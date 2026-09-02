import { supabase } from "../supabase/supabaseClient";

// Starts PayFast checkout for whatever's currently in the logged-in user's
// cart: calls the create-payfast-payment Edge Function (which reads the
// cart itself server-side), then builds and submits a hidden form to
// redirect the browser to PayFast's hosted checkout page. `pudoLocker` is
// the buyer's chosen delivery locker - required, since that's the only
// place we know where to actually ship the order.
export async function startPayfastCheckout(pudoLocker) {
  const { data, error } = await supabase.functions.invoke(
    "create-payfast-payment",
    { body: { pudoLocker } },
  );
  if (error) throw error;

  const { actionUrl, fields } = data;
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;

  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
