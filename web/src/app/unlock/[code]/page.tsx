"use client";

import { use, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function UnlockPage({ params }: PageProps) {
  const { code } = use(params);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { target_url } = await api.unlock(code, password);
      window.location.href = target_url;
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Failed to unlock";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader className="items-center text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Password required</CardTitle>
          <CardDescription>
            The link <span className="font-mono">/{code}</span> is password-protected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Unlocking..." : "Unlock & continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
