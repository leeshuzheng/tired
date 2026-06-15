import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((v, k) => (params[k] = v.toString()));

  // Verify signature (HitPay sends hmac field)
  const { hmac, ...rest } = params;
  const sorted = Object.keys(rest).sort().map(k => `${k}${rest[k]}`).join("");
  const expected = crypto
    .createHmac("sha256", process.env.HITPAY_SALT!)
    .update(sorted)
    .digest("hex");

  if (expected !== hmac) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (params.status === "completed") {
    const order = await prisma.order.update({
      where: { hitpayReference: params.reference_number },
      data: { status: "paid", paidAt: new Date() },
    });

    await prisma.tier.update({
      where: { id: order.tierId },
      data: { quantitySold: { increment: order.quantity } },
    });
  }

  return NextResponse.json({ received: true });
}