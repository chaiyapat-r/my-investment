import { type NextRequest } from "next/server";
import { forward } from "@/lib/api/backend";

type Ctx = { params: Promise<{ id: string; trancheId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id, trancheId } = await ctx.params;
  return forward(req, `/entry-plans/${id}/tranches/${trancheId}/move`);
}
