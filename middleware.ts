import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = { matcher: ["/curate/:path*", "/profile/:path*", "/auth/:path*"] };

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

    // Allow unauthenticated users to reach auth pages.
    if (!token) {
        if (isAuthPage) return NextResponse.next();
        return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Prevent authenticated users from accessing auth pages.
    if (isAuthPage) {
        return NextResponse.redirect(new URL("/curate", req.url));
    }

    return NextResponse.next();
}