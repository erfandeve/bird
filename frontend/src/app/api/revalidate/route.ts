import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

function isAuthorized(received: string | null) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** جنگو بعد از تغییر داده این مسیر را صدا می‌زند */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get("x-revalidate-secret"))) {
    return NextResponse.json({ detail: "unauthorized" }, { status: 401 });
  }
  revalidateTag("catalog", { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
