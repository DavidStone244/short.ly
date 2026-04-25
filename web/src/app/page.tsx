import Link from "next/link";
import { ShortenForm } from "@/components/ShortenForm";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Lock, QrCode, Zap, Calendar, Code2 } from "lucide-react";

const features = [
  { icon: Zap, title: "Lightning fast", desc: "Base62-encoded auto-increment IDs. No collision retries, no duplicate codes." },
  { icon: BarChart3, title: "Click analytics", desc: "Total clicks, unique visitors, browser/OS breakdown, daily history." },
  { icon: QrCode, title: "QR codes", desc: "Auto-generated PNG QR for every link. Perfect for posters and slides." },
  { icon: Lock, title: "Password protect", desc: "Gate sensitive links behind a password. Visitors must unlock first." },
  { icon: Calendar, title: "Expiration", desc: "Set links to auto-expire at any future timestamp." },
  { icon: Code2, title: "Open source", desc: "Self-host with Docker, Postgres, and Redis. MIT licensed, no lock-in." },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <section className="max-w-3xl mx-auto text-center space-y-4 mb-10">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          The URL shortener<br />
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            built for builders.
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Shorten URLs, track clicks, generate QR codes, and protect sensitive links — all from a single, open-source FastAPI backend.
        </p>
      </section>

      <section className="max-w-3xl mx-auto mb-20">
        <ShortenForm />
      </section>

      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Everything you need.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="pt-6 space-y-2">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          Want to manage your links and view stats?{" "}
          <Link href="/register" className="underline text-foreground">
            Create an account
          </Link>{" "}
          or{" "}
          <Link href="/login" className="underline text-foreground">
            log in
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
