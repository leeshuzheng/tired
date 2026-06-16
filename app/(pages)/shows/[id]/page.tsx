import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function ShowPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id: id },
    include: { tiers: true },
  });

  if (!event) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#2B2E2A] px-4 py-12 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-block font-mono text-xs text-[#8A9285] transition-opacity hover:opacity-70"
        >
          ← back
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {event.imageUrl && (
                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden border border-[#8A9285]">
                <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                />
                </div>
            )}
            <p className="mb-2 font-mono text-xs text-[#8A9285]">
              {new Date(event.startsAt).toLocaleDateString("en-SG", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).toLowerCase()}{" "}
              ·{" "}
              {new Date(event.startsAt).toLocaleTimeString("en-SG", {
                hour: "numeric",
                minute: "2-digit",
              }).toLowerCase()}{" "}
              · {event.venueName.toLowerCase()}
            </p>

            <h1 className="mb-6 text-4xl font-bold leading-none tracking-tight text-[#EDEFEA] sm:text-5xl">
              {event.title.toLowerCase()}
            </h1>

            <p className="whitespace-pre-line text-sm leading-relaxed text-[#B8BFB2]">
              {event.description}
            </p>
          </div>

          <div className="border-t-2 border-[#EDEFEA] pt-6 lg:sticky lg:top-12 lg:h-fit lg:border-l-2 lg:border-t-0 lg:pl-8 lg:pt-0">
            <CheckoutForm event={event} />
          </div>
        </div>
      </div>
    </main>
  );
}