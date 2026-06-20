import { prisma } from "@/lib/prisma";
import type { LiqpayStatusResponse } from "@/lib/liqpay";
import type { PaymentStatus } from "@prisma/client";

function mapStatus(liqpayStatus: string): PaymentStatus {
  if (liqpayStatus === "success" || liqpayStatus === "sandbox") return "SUCCESS";
  if (liqpayStatus === "reversed") return "REVERSED";
  if (
    liqpayStatus === "failure" ||
    liqpayStatus === "error" ||
    liqpayStatus === "expired"
  ) {
    return "FAILURE";
  }
  return "PENDING";
}

// Общая точка применения статуса LiqPay к нашей БД — вызывается и со
// страницы result_url (pull, работает локально), и из вебхука server_url
// (push, для прода). Идемпотентна: повторный вызов с тем же статусом
// ничего не ломает.
export async function applyLiqpayStatus(
  investmentId: string,
  resp: LiqpayStatusResponse
) {
  const status = mapStatus(resp.status);
  const fee = (resp.sender_commission ?? 0) + (resp.receiver_commission ?? 0);

  await prisma.transaction.upsert({
    where: { liqpayOrderId: investmentId },
    update: {
      status,
      liqpayPaymentId: resp.payment_id ? String(resp.payment_id) : undefined,
      fee,
      rawResponse: resp as object,
    },
    create: {
      investmentId,
      liqpayOrderId: investmentId,
      liqpayPaymentId: resp.payment_id ? String(resp.payment_id) : null,
      amount: resp.amount ?? 0,
      fee,
      currency: resp.currency ?? "USD",
      status,
      rawResponse: resp as object,
    },
  });

  if (status === "SUCCESS") {
    await prisma.investment.update({
      where: { id: investmentId },
      data: { status: "CONFIRMED" },
    });
  }

  return status;
}
