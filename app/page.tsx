import { ArrowRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Button>
        <GitBranch data-icon="inline-start" /> Next.js starter
        <ArrowRight />
      </Button>
    </main>
  );
}
