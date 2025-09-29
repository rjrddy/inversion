// Use NextAuth's built-in middleware to avoid alias/path resolution issues
export { auth as middleware } from "next-auth"

export const config = {
  matcher: [
    "/",
    "/resumes/:path*",
    "/applications/:path*",
    "/portfolio/:path*",
    "/ai-tools/:path*",
    "/settings/:path*",
    // allow auth routes and public assets
    // NextAuth and static files are excluded implicitly by not matching here
    // Sign-in page remains public
  ],
}


