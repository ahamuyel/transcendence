"use client";

import { useState } from "react";
import { signInAction } from "@/server/auth-actions";

export function LoginForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form
      action={async (formData) => {
        setLoading(true);
        await signInAction(formData);
        setLoading(false);
      }}
      className="flex flex-col gap-4"
    >
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}