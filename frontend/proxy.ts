import { NextResponse, type NextRequest } from "next/server";

// Quick gate for the admin: without a session cookie, go straight to the sign-in page.
// The backend still checks the session on every admin API call.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("a4d_session")) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
