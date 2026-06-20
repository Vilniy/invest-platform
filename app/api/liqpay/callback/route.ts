import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyCallback } from "@/lib/liqpay";
import { applyLiqpayStatus } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

// server_url — LiqPay шлёт сюда POST после оплаты. В локальной разработке
// недостижим (localhost), но обязателен для прода: единственный способ
// узнать об оплате, если пользователь закрыл вкладку до result_url.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const data = String(form.get("data") ?? "");
  const signature = String(form.get("signature") ?? "");

  const resp = verifyCallback(data, signature);
  if (!resp || !resp.order_id) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const investment = await prisma.investment.findUnique({
    where: { id: resp.order_id },
    select: { id: true },
  });
  if (!investment) {
    // order_id никогда не станет существующим повторной попыткой —
    // отвечаем 200, чтобы LiqPay не зацикливался на ретраях.
    return NextResponse.json({ ok: true });
  }

  try {
    await applyLiqpayStatus(resp.order_id, resp);
  } catch {
    // Временная ошибка (БД и т.п.) — пусть LiqPay повторит попытку позже.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // LiqPay ожидает простой 200 OK, тело не важно.
  return NextResponse.json({ ok: true });
}
