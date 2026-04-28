"use client";

import { useState } from "react";
import { signUpAction } from "@/server/auth-actions";

export function SignUpForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form
      action={async (formData) => {
        setLoading(true);
        await signUpAction(formData);
        setLoading(false);
      }}
      className="flex flex-col gap-4"
    >
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}