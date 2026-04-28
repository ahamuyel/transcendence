// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "./db";
// import * as schema from "./db/schema";

// export const auth = betterAuth({
//   secret:  process.env.BETTER_AUTH_SECRET!,
//   baseURL: process.env.BETTER_AUTH_URL!,

//   database: drizzleAdapter(db, {
//     provider: "pg",
//     schema: {
//       user:         schema.user,
//       session:      schema.session,
//       account:      schema.account,
//       verification: schema.verification,
//     },
//   }),

//   emailAndPassword: { enabled: true },
// });

// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "@/db"; // your drizzle instance

// export const auth = betterAuth({
//     database: drizzleAdapter(db, {
//         provider: "pg", // or "mysql", "sqlite"
//     }),
// });

import { db } from "./db";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  //...other options
  emailAndPassword: { 
    enabled: true, 
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    }, 
  plugins: [nextCookies()]
  }, 
});