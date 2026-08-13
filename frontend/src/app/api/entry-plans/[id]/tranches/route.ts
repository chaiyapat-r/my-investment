import { type NextRequest } from "next/server";
import { forward } from "@/lib/api/backend";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return forward(req, `/entry-plans/${id}/tranches`);
}
