import { loadCachedBrief } from "@/lib/brief";
import { renderHtml } from "@/lib/html";

export const dynamic = "force-dynamic";

export async function GET() {
  const brief = await loadCachedBrief();
  const html = renderHtml(brief);
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
