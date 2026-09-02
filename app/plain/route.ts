import { loadCachedBrief } from "@/lib/brief";
import { renderPlain } from "@/lib/plain";

export const dynamic = "force-dynamic";

export async function GET() {
  const brief = await loadCachedBrief();
  const text = renderPlain(brief);
  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
