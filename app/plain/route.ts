import { loadBrief } from "@/lib/brief";
import { renderPlain } from "@/lib/plain";

export const revalidate = 1800;

export async function GET() {
  const brief = await loadBrief();
  const text = renderPlain(brief);
  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300",
    },
  });
}
