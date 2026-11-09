// Deposit payments. Today the resort sends payment details by Messenger and the guest replies
// with a screenshot. PayMongo plugs in here:
//
//   1. Add a serverless function at /api/checkout that creates a PayMongo Checkout Session
//      (POST https://api.paymongo.com/v1/checkout_sessions, basic auth with the SECRET key,
//      line_items = the deposit, payment_method_types = ["gcash", "card", "paymaya"],
//      success_url = <site>/book?paid=<booking id>) and returns { checkout_url }.
//      The secret key lives only on the server, never in VITE_* env vars.
//   2. Add a PayMongo webhook (checkout_session.payment.paid) that marks the booking paid.
//   3. Set VITE_PAYMONGO=on. The confirmation screen then shows "Pay deposit" instead of
//      the manual steps; nothing else changes.

export const ONLINE_PAYMENTS = import.meta.env?.VITE_PAYMONGO === "on";

/** Starts a hosted PayMongo checkout for a booking's deposit; returns the URL to send the guest to. */
export async function depositCheckoutUrl(booking) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ bookingId: booking.id, amount: booking.deposit, name: booking.name, email: booking.email, phone: booking.phone }),
  });
  if (!res.ok) throw new Error("We couldn't open the payment page. Try again, or pay by GCash or bank transfer.");
  return (await res.json()).checkout_url;
}

// Shown when online payment is off. Account numbers are sent privately after the request,
// so they never sit on a public page where they can be copied into scam listings.
export const MANUAL_METHODS = ["GCash", "UnionBank transfer", "PayPal (credit card)"];
