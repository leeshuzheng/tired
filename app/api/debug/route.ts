
export async function GET() {
  return Response.json({
    hasDbUrl: !!process.env.SUPABASE_DB_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}