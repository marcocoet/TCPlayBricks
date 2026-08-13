import { supabase } from "../supabase/supabaseClient";

// Starts PayFast checkout for whatever's currently in the logged-in user's
// cart: calls the create-payfast-payment Edge Function (which reads the
// cart itself server-side), then builds and submits a hidden form to
// redirect the browser to PayFast's hosted checkout page. Used by both the
// cart page's "Buy Now" and a product page's "Buy it Now" (which adds the
// item to the cart first, then calls this the same way).
export async function startPayfastCheckout() {
  const { data, error } = await supabase.functions.invoke(
    "create-payfast-payment",
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
