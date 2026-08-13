import { type NextRequest } from "next/server";
import { forward } from "@/lib/api/backend";

export const POST = (req: NextRequest) => forward(req, "/snapshots/bulk");
