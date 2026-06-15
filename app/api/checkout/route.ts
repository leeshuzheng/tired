import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { eventId, tierId, buyerName, buyerEmail, buyerPhone, quantity } = await req.json();

  const tier = await prisma.tier.findUnique({ where: { id: tierId } });
  if (!tier || tier.quantitySold + quantity > tier.quantityTotal) {
    return NextResponse.json({ error: "Sold out" }, { status: 400 });
  }

  const amountCents = tier.priceCents * quantity;
  const reference = randomUUID();

  await prisma.order.create({
    data: {
      eventId, tierId, buyerName, buyerEmail, buyerPhone, quantity,
      amountCents, hitpayReference: reference, status: "pending",
    },
  });

  const hitpayBody = new URLSearchParams({
    amount: (amountCents / 100).toFixed(2),
    currency: "SGD",
    email: buyerEmail,
    name: buyerName,
    reference_number: reference,
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shows/${eventId}/success?ref=${reference}`,
    webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/hitpay`,
  });
  hitpayBody.append("payment_methods[]", "paynow_online");

  const hitpayRes = await fetch(`${process.env.HITPAY_API_URL}/v1/payment-requests`, {
    method: "POST",
    headers: {
      "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY!,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: hitpayBody,
  });

  const data = await hitpayRes.json();

  await prisma.order.update({
    where: { hitpayReference: reference },
    data: { hitpayPaymentRequestId: data.id },
  });

  console.log(data);

  return NextResponse.json({ url: data.url });
}