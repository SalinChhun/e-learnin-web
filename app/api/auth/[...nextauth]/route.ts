import authOptions from "@/utils/authOptions";
import NextAuth from "next-auth";

// The route handler should only export GET and POST handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };