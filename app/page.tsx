import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-[100dvh] grid place-items-center p-8">
      <Card className="max-w-lg mx-auto w-full">
        <CardContent className="p-8 space-y-6 text-center">
          <h1 className="text-4xl font-display font-semibold">Plant Dashboard</h1>
          <p className="text-lg font-display text-muted-foreground">
            Monitor your plants' health and manage care routines all in one place.
          </p>
          <Link href="/app/today">
            <Button variant="secondary">Go to App</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
