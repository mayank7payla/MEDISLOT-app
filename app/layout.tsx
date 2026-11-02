import "./globals.css";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export const metadata = { title: "MediSlot - Smart Hospital Appointments", description: "Book doctors, check symptoms, manage prescriptions." };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  return (
    <html lang="en">
      <body>
        <nav>
          <b>MediSlot</b>
          <Link href="/">Doctors</Link>
          <Link href="/symptom-checker">Symptom Checker</Link>
          {u ? (<>
            <Link href="/dashboard">Dashboard</Link>
            {u.role === "ADMIN" && <Link href="/admin">Admin</Link>}
            <SignOutButton />
          </>) : (<><Link href="/login">Login</Link><Link href="/register">Register</Link></>)}
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
