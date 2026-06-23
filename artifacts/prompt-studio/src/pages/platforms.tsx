import { useQuery } from "@tanstack/react-query";
import { apiFetch, Platform } from "@/lib/api";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Cpu } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#10a37f",
  claude: "#d4824b",
  gemini: "#4285f4",
  midjourney: "#000000",
  "dalle-3": "#412991",
  "stable-diffusion": "#c13584",
  "github-copilot": "#24292e",
  perplexity: "#20808d",
  "llama-2": "#0467df",
  mistral: "#f54e42",
};

export default function Platforms() {
  const { data: platforms, isLoading } = useQuery<Platform[]>({
    queryKey: ["platforms"],
    queryFn: () => apiFetch<Platform[]>("/platforms"),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Platforms</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {platforms?.length ?? 0} platforms with platform-specific optimized prompts
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(platforms ?? []).map((p) => {
            const color = PLATFORM_COLORS[p.slug] ?? "#6366f1";
            return (
              <Link key={p.id} href={`/explore?platformId=${p.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer group hover:border-primary/30 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                        style={{ backgroundColor: color + "20" }}
                      >
                        <Cpu className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{p.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          <span>{p.promptCount} prompts</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                    {p.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs py-0">{cap}</Badge>
                        ))}
                        {p.capabilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs py-0">+{p.capabilities.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
