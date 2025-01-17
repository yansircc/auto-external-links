import NextAuth from "next-auth";
import { cache } from "react";

import { config } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(config);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
