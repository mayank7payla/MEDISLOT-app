"use client";
import { signOut } from "next-auth/react";
export default function SignOutButton() {
  return <button className="alt" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>;
}
