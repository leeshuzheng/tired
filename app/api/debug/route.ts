import { prisma } from "@/lib/prisma";

function dbUrlHints(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || "5432",
      usesPooler: parsed.port === "6543" || parsed.hostname.includes("pooler"),
      hasPgbouncer: parsed.searchParams.has("pgbouncer"),
      hasSslMode: parsed.searchParams.has("sslmode"),
    };
  } catch {
    return { parseError: true };
  }
}

export async function GET() {
  const dbUrl = process.env.SUPABASE_DB_URL;

  try {
    const count = await prisma.event.count();
    return Response.json({
      ok: true,
      hasDbUrl: !!dbUrl,
      nodeEnv: process.env.NODE_ENV,
      dbUrlHints: dbUrlHints(dbUrl),
      eventCount: count,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return Response.json(
      {
        ok: false,
        hasDbUrl: !!dbUrl,
        nodeEnv: process.env.NODE_ENV,
        dbUrlHints: dbUrlHints(dbUrl),
        error: error.message,
        name: error.name,
      },
      { status: 500 },
    );
  }
}
