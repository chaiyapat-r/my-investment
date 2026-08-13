import { type NextRequest } from "next/server";
import { forward } from "@/lib/api/backend";

export const GET = (req: NextRequest) => forward(req, "/chart");
