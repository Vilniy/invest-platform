import { createHash, timingSafeEqual } from "crypto";

const PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY ?? "";
const CHECKOUT_URL = "https://www.liqpay.ua/api/3/checkout";
const REQUEST_URL = "https://www.liqpay.ua/api/request";

function sign(data: string) {
  return createHash("sha1")
    .update(PRIVATE_KEY + data + PRIVATE_KEY)
    .digest("base64");
}

function encode(payload: Record<string, unknown>) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  return { data, signature: sign(data) };
}

// Данные для авто-сабмит формы на чекаут LiqPay (метод POST,
// без JS — обычная HTML-форма с hidden data/signature).
export function buildCheckoutPayload({
  orderId,
  amount,
  currency = "USD",
  description,
  resultUrl,
  serverUrl,
}: {
  orderId: string;
  amount: number;
  currency?: string;
  description: string;
  resultUrl: string;
  serverUrl: string;
}) {
  return {
    checkoutUrl: CHECKOUT_URL,
    publicKey: PUBLIC_KEY,
    ...encode({
      version: 3,
      public_key: PUBLIC_KEY,
      action: "pay",
      amount,
      currency,
      description,
      order_id: orderId,
      result_url: resultUrl,
      server_url: serverUrl,
      language: "ru",
    }),
  };
}

export type LiqpayStatusResponse = {
  status: string;
  order_id: string;
  payment_id?: number;
  amount?: number;
  currency?: string;
  sender_commission?: number;
  receiver_commission?: number;
  err_code?: string;
  err_description?: string;
  [key: string]: unknown;
};

// Узнаём реальный статус оплаты у самого LiqPay (pull) — работает и в
// локальной разработке, в отличие от server_url webhook, до которого
// LiqPay с localhost не достучится.
export async function checkOrderStatus(
  orderId: string
): Promise<LiqpayStatusResponse> {
  const { data, signature } = encode({
    version: 3,
    public_key: PUBLIC_KEY,
    action: "status",
    order_id: orderId,
  });

  const res = await fetch(REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data, signature }),
  });

  return res.json();
}

// Проверка подписи входящего вебхука (server_url) перед тем, как доверять
// его содержимому.
export function verifyCallback(data: string, signature: string) {
  const expected = Buffer.from(sign(data));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  return JSON.parse(Buffer.from(data, "base64").toString("utf-8")) as LiqpayStatusResponse;
}
