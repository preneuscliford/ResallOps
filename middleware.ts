import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!basicAuthUser || !basicAuthPassword) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (user === basicAuthUser && password === basicAuthPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ResallOps Radar"',
    },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
