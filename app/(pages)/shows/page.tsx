import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: { status: "published" },
    orderBy: { startsAt: "asc" },
    include: { tiers: true },
  });

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-12 sm:px-8">
      <div className="relative mx-auto max-w-5xl">
        <h1 className="mb-8 text-5xl font-bold leading-none tracking-tight text-[#EDEFEA] sm:text-6xl">
          upcoming shows
        </h1>

        {events.length === 0 ? (
          <div className="border-t-2 border-[#EDEFEA] pt-3 text-sm text-[#B8BFB2]">
            no shows yet — check back soon
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => {
              const minPrice =
                e.tiers.length > 0
                  ? Math.min(...e.tiers.map((t) => t.priceCents))
                  : null;
              return (
                <Link
                  key={e.id}
                  href={`/shows/${e.id}`}
                  className="group block border border-[#8A9285] transition-colors hover:border-[#EDEFEA]"
                >
                  {e.imageUrl && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[#8A9285]">
                      <Image
                        src={e.imageUrl}
                        alt={e.title}
                        fill
                        className="object-cover transition-opacity group-hover:opacity-80"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="mb-1.5 font-mono text-xs text-[#8A9285]">
                      {new Date(e.startsAt).toLocaleDateString("en-SG", {
                        month: "short",
                        day: "2-digit",
                      }).toLowerCase()}{" "}
                      ·{" "}
                      {new Date(e.startsAt).toLocaleTimeString("en-SG", {
                        hour: "numeric",
                        minute: "2-digit",
                      }).toLowerCase()}{" "}
                      · {e.venueName.toLowerCase()}
                    </p>
                    <h2 className="mb-1.5 text-xl font-bold leading-tight tracking-tight text-[#EDEFEA]">
                      {e.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-[#B8BFB2]">
                      {minPrice != null
                        ? `tickets from $${(minPrice / 100).toFixed(0)}`
                        : "tickets tba"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}