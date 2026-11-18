import { NextResponse, type NextRequest } from "next/server";

const PRESENCE_COOKIE = "baseline_signed_in";

export function middleware(request: NextRequest) {
  const present = request.cookies.get(PRESENCE_COOKIE)?.value === "1";
  if (present) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: "/",
};
