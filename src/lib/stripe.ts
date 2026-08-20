/**
 * Minimal Stripe access over the REST API (no SDK dependency). Only used once
 * the God console has a secret key + premium price ID saved.
 */
const API = "https://api.stripe.com/v1";

function form(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export async function createCheckoutSession(
  secret: string,
  p: { priceId: string; successUrl: string; cancelUrl: string; email?: string; uid: string; category: string; state: string },
): Promise<{ id: string; url: string } | null> {
  const body = form({
    mode: "subscription",
    "line_items[0][price]": p.priceId,
    "line_items[0][quantity]": "1",
    success_url: p.successUrl,
    cancel_url: p.cancelUrl,
    client_reference_id: p.uid,
    ...(p.email ? { customer_email: p.email } : {}),
    "metadata[uid]": p.uid,
    "metadata[category]": p.category,
    "metadata[state]": p.state,
  });
  const res = await fetch(`${API}/checkout/sessions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { id: string; url: string };
  return { id: j.id, url: j.url };
}

export async function retrieveCheckoutSession(secret: string, id: string): Promise<{
  payment_status?: string;
  status?: string;
  subscription?: string;
  metadata?: Record<string, string>;
} | null> {
  const res = await fetch(`${API}/checkout/sessions/${id}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) return null;
  return res.json();
}
