"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";

export function Navbar() {
  const { token, email, logout, ready } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Link2 className="h-5 w-5 text-primary" />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-2">
          {!ready ? null : token ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <span className="hidden sm:inline text-xs text-muted-foreground px-2">{email}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
