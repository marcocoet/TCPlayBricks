import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

// CORS headers so the browser (a different origin, e.g. localhost:5173)
// is allowed to call this function.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Same packing logic as cartPage.jsx, ported to TypeScript, so the
// delivery fee charged here always matches what the user saw in their cart. ---
function packingFits(items: any[], box: any) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight_kg * item.quantity, 0);
  if (totalWeight > box.max_weight_kg) return false;

  const maxLength = Math.max(...items.map((item) => item.length_cm));
  const maxWidth = Math.max(...items.map((item) => item.width_cm));
  const maxHeight = Math.max(...items.map((item) => item.height_cm));

  const totalWidth = items.reduce((sum, item) => sum + item.width_cm * item.quantity, 0);
  const totalHeight = items.reduce((sum, item) => sum + item.height_cm * item.quantity, 0);

  const sideBySideFits =
    totalWidth <= box.max_width_cm &&
    maxLength <= box.max_length_cm &&
    maxHeight <= box.max_height_cm;

  const stackedFits =
    totalHeight <= box.max_height_cm &&
    maxLength <= box.max_length_cm &&
    maxWidth <= box.max_width_cm;

  return sideBySideFits || stackedFits;
}

async function getSmallestPudoBox(supabase: any, items: any[]) {
  const { data: boxes, error } = await supabase.from("pudo_boxes").select("*");
  if (error) throw error;

  const fittingBoxes = boxes.filter((box: any) => packingFits(items, box));
  fittingBoxes.sort(
    (a: any, b: any) =>
      a.max_length_cm * a.max_width_cm * a.max_height_cm -
      b.max_length_cm * b.max_width_cm * b.max_height_cm,
  );
  return fittingBoxes[0] || null;
}

// PayFast's official signature recipe: urlencode each value (PHP-style -
// spaces become "+"), join as key=value&key=value..., MD5 hash the result.
// The field order here must match the order the fields are sent to PayFast.
function generateSignature(fields: Record<string, string>, passphrase: string | null) {
  // PHP's urlencode() (which PayFast's backend uses) escapes !'()* -
  // JS's encodeURIComponent leaves those characters alone. This wrapper
  // makes the two match exactly, so our signature always agrees with
  // PayFast's recalculated one.
  const phpStyleEncode = (value: string) =>
    encodeURIComponent(value)
      .replace(/%20/g, "+")
      .replace(/[!'()*~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

  let pfOutput = "";
  for (const key in fields) {
    const value = fields[key];
    if (value !== "" && value !== undefined && value !== null) {
      pfOutput += `${key}=${phpStyleEncode(String(value).trim())}&`;
    }
  }
  let getString = pfOutput.slice(0, -1); // drop the trailing "&"
  if (passphrase) {
    getString += `&passphrase=${phpStyleEncode(passphrase.trim())}`;
  }
  return createHash("md5").update(getString).digest("hex");
}

Deno.serve(async (req) => {
  // Browsers send an OPTIONS preflight before the real request - just
  // acknowledge it with the CORS headers.
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Two Supabase clients:
    // - userClient only knows who's calling (reads the JWT the browser
    //   sent automatically in the Authorization header).
    // - adminClient uses the service role key, which bypasses Row Level
    //   Security - safe here because every write it does is driven by
    //   data WE looked up server-side, not raw values from the client.
    const authHeader = req.headers.get("Authorization")!;
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not logged in" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The buyer's chosen PUDO locker - required, since it's the only place
    // we know where to actually ship the order to.
    const { pudoLocker } = await req.json().catch(() => ({}));
    if (!pudoLocker || !String(pudoLocker).trim()) {
      return new Response(JSON.stringify({ error: "Please choose a PUDO locker" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load this user's cart fresh from the database - never trust an
    // amount the client might send us.
    const { data: cartItems, error: cartError } = await adminClient
      .from("cart")
      .select("cart_id, quantity, lego_sets(*)")
      .eq("user_id", user.id);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Recompute subtotal + delivery fee ourselves, same as cartPage.jsx does.
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.lego_sets.price * item.quantity,
      0,
    );
    const items = cartItems.map((item) => ({ ...item.lego_sets, quantity: item.quantity }));
    const box = await getSmallestPudoBox(adminClient, items);
    const deliveryFee = box ? box.price : 0;
    const total = subtotal + deliveryFee;

    // A unique reference for this checkout attempt - PayFast calls this
    // m_payment_id. The webhook in Step 5 uses it to find this sale again.
    const paymentId = crypto.randomUUID();

    // Create the "pending" order record, and a durable snapshot of what
    // was in the cart (cart rows get deleted once payment succeeds).
    const { data: sale, error: saleError } = await adminClient
      .from("sales")
      .insert({
        user_id: user.id,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status: "pending",
        payment_id: paymentId,
        pudo_locker: String(pudoLocker).trim(),
      })
      .select()
      .single();
    if (saleError) throw saleError;

    const saleItems = cartItems.map((item) => ({
      sale_id: sale.sale_id,
      set_id: item.lego_sets.set_id,
      quantity: item.quantity,
      unit_price: item.lego_sets.price,
    }));
    const { error: itemsError } = await adminClient.from("sale_items").insert(saleItems);
    if (itemsError) throw itemsError;

    // Build the PayFast form fields.
    const siteUrl = Deno.env.get("SITE_URL")!;
    const functionsUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;

    // .trim() here matters: whatever we put in `fields` is both what gets
    // hashed AND what actually gets sent to PayFast in the form, so they
    // must be byte-for-byte identical. Secrets set via the CLI can
    // sometimes pick up invisible trailing whitespace.
    const fields: Record<string, string> = {
      merchant_id: Deno.env.get("PAYFAST_MERCHANT_ID")!.trim(),
      merchant_key: Deno.env.get("PAYFAST_MERCHANT_KEY")!.trim(),
      return_url: `${siteUrl}/order-success`,
      cancel_url: `${siteUrl}/order-cancelled`,
      notify_url: `${functionsUrl}/payfast-notify`,
      email_address: user.email ?? "",
      m_payment_id: paymentId,
      amount: total.toFixed(2),
      item_name: `TC PlayBricks order (${cartItems.length} item${cartItems.length > 1 ? "s" : ""})`,
    };

    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || null;
    const signature = generateSignature(fields, passphrase);

    const mode = Deno.env.get("PAYFAST_MODE") ?? "sandbox";
    const actionUrl =
      mode === "live"
        ? "https://www.payfast.co.za/eng/process"
        : "https://sandbox.payfast.co.za/eng/process";

    return new Response(
      JSON.stringify({ actionUrl, fields: { ...fields, signature } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});