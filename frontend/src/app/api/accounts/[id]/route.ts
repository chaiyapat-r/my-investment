import { type NextRequest } from "next/server";
import { forward } from "@/lib/api/backend";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return forward(req, `/accounts/${id}`);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return forward(req, `/accounts/${id}`);
}
