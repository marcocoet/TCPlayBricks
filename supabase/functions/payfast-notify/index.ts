import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

// Rebuilds PayFast's signature from a set of fields, same recipe as the
// other function - used here to check PayFast's data wasn't tampered with.
function generateSignature(fields: Record<string, string>, passphrase: string | null) {
  // PHP's urlencode() (which PayFast's backend uses) escapes !'()* -
  // JS's encodeURIComponent leaves those characters alone. This wrapper
  // makes the two match exactly, so our signature always agrees with
  // PayFast's recalculated one.
  const phpStyleEncode = (value: string) =>
    encodeURIComponent(value)
      .replace(/%20/g, "+")
      .replace(/[!'()*~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

  // Unlike the outgoing checkout signature (which skips blank fields),
  // PayFast's ITN signature includes every field it sent us, even ones
  // with an empty value - only the signature field itself is excluded.
  let pfOutput = "";
  for (const key in fields) {
    if (key === "signature") continue; // never include the signature in its own calculation
    const value = fields[key];
    if (value !== undefined && value !== null) {
      pfOutput += `${key}=${phpStyleEncode(String(value).trim())}&`;
    }
  }
  let getString = pfOutput.slice(0, -1);
  if (passphrase) {
    getString += `&passphrase=${phpStyleEncode(passphrase.trim())}`;
  }
  return createHash("md5").update(getString).digest("hex");
}

Deno.serve(async (req) => {
  // PayFast expects a plain 200 response - errors here should still return
  // 200 once we've logged them, otherwise PayFast just keeps retrying.
  try {
    // PayFast actually POSTs this as multipart/form-data (not the simpler
    // application/x-www-form-urlencoded we originally assumed) - you can
    // tell from the "Content-Disposition: form-data" boundaries in a raw
    // dump of the body. req.formData() correctly parses either format
    // based on the Content-Type header, so we use that instead of
    // manually splitting on "&"/"=".
    //
    // We need the raw body bytes too (to forward, byte-for-byte, to
    // PayFast's validate endpoint in step 2), and a Request's body can
    // only be read once - so we clone the request first and read each
    // copy differently.
    const contentType = req.headers.get("content-type") ?? "application/x-www-form-urlencoded";
    const bodyText = await req.clone().text();

    const formData = await req.formData();
    const fields: Record<string, string> = {};
    for (const [key, value] of formData) fields[key] = String(value);

    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || null;

    // 1. Does the signature PayFast sent match what we'd calculate from
    //    the same data? If not, this request is bogus - stop here.
    const expectedSignature = generateSignature(fields, passphrase);
    if (expectedSignature !== fields.signature) {
      console.error("PayFast ITN: signature mismatch", fields);
      return new Response("invalid signature", { status: 400 });
    }

    // 2. Ask PayFast itself to confirm this notification is genuine
    //    (protects against someone spoofing a POST to this URL directly).
    const mode = Deno.env.get("PAYFAST_MODE") ?? "sandbox";
    const validateUrl =
      mode === "live"
        ? "https://www.payfast.co.za/eng/query/validate"
        : "https://sandbox.payfast.co.za/eng/query/validate";

    const validateResponse = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: bodyText,
    });
    const validateResult = (await validateResponse.text()).trim();
    if (validateResult !== "VALID") {
      console.error("PayFast ITN: not validated by PayFast", validateResult);
      return new Response("not valid", { status: 400 });
    }

    // 3. Look up the sale this payment belongs to, and make sure the
    //    amount PayFast says was paid actually matches what we charged for.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: sale, error: saleError } = await adminClient
      .from("sales")
      .select("*")
      .eq("payment_id", fields.m_payment_id)
      .single();

    if (saleError || !sale) {
      console.error("PayFast ITN: no matching sale", fields.m_payment_id);
      return new Response("unknown payment", { status: 400 });
    }

    const amountPaid = parseFloat(fields.amount_gross);
    if (Math.abs(amountPaid - Number(sale.total)) > 0.01) {
      console.error("PayFast ITN: amount mismatch", amountPaid, sale.total);
      return new Response("amount mismatch", { status: 400 });
    }

    // 4. Everything checks out - mark the sale paid (or failed) and, if
    //    paid, clear the user's cart (sale_items already has the record
    //    of what was bought).
    const newStatus = fields.payment_status === "COMPLETE" ? "paid" : "failed";

    await adminClient
      .from("sales")
      .update({ status: newStatus, pf_payment_id: fields.pf_payment_id })
      .eq("sale_id", sale.sale_id);

    if (newStatus === "paid") {
      await adminClient.from("cart").delete().eq("user_id", sale.user_id);
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("PayFast ITN error:", err);
    return new Response("error", { status: 500 });
  }
});