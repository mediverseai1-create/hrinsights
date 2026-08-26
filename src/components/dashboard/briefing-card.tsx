import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BriefingCard({ text, aiGenerated }: { text: string; aiGenerated: boolean }) {
  return (
    <Card className="flex items-start gap-3 bg-forest-950 p-5 text-cream-50">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
      <div>
        <p className="text-sm leading-relaxed text-cream-50/90">{text}</p>
        {!aiGenerated && (
          <p className="mt-2 text-xs text-cream-50/40">
            Generated from your workspace data. Connect a Gemini API key for a fuller AI-written briefing.
          </p>
        )}
      </div>
    </Card>
  );
}
