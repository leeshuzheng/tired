import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { id } = await params;
  const { ref } = await searchParams;

  if (!ref) notFound();

  const order = await prisma.order.findUnique({
    where: { hitpayReference: ref },
    include: { event: true, tier: true },
  });

  if (!order) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#2B2E2A] px-4 py-12 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-xl">
        <p className="mb-2 font-mono text-xs text-[#8A9285]">
          {order.status === "paid" ? "order confirmed" : "order received"}
        </p>

        <h1 className="mb-2 text-4xl font-bold leading-none tracking-tight text-[#EDEFEA] sm:text-5xl">
          {order.status === "paid" ? "you're in" : "almost there"}
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-[#B8BFB2]">
          {order.status === "paid" ? (
            <>your ticket for <span className="text-[#EDEFEA]">{order.event.title.toLowerCase()}</span> is confirmed.</>
          ) : (
            <>confirming your payment for <span className="text-[#EDEFEA]">{order.event.title.toLowerCase()}</span> — this page will update shortly.</>
          )}
        </p>

        <div className="border-t-2 border-[#EDEFEA] pt-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs text-[#8A9285]">event</dt>
              <dd className="text-right text-[#EDEFEA]">{order.event.title.toLowerCase()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs text-[#8A9285]">tier</dt>
              <dd className="text-right text-[#EDEFEA]">{order.tier.name.toLowerCase()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs text-[#8A9285]">quantity</dt>
              <dd className="text-right text-[#EDEFEA]">{order.quantity}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs text-[#8A9285]">amount</dt>
              <dd className="text-right text-[#EDEFEA]">${(order.amountCents / 100).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs text-[#8A9285]">reference</dt>
              <dd className="text-right text-[#EDEFEA]">{order.hitpayReference}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs text-[#8A9285]">status</dt>
              <dd className="text-right text-[#EDEFEA]">{order.status}</dd>
            </div>
          </dl>
        </div>

        <Link
          href={`/shows/${id}`}
          className="mt-8 inline-block font-mono text-xs text-[#8A9285] transition-opacity hover:opacity-70"
        >
          ← back to event page
        </Link>
      </div>
    </main>
  );
}