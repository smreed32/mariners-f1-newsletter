import { loadBrief } from "@/lib/brief";
import { renderHtml } from "@/lib/html";

export const revalidate = 1800;

export async function GET() {
  const brief = await loadBrief();
  const html = renderHtml(brief);
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300",
    },
  });
}
