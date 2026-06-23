import { useQuery } from "@tanstack/react-query";
import { apiFetch, Tip } from "@/lib/api";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Brain, Rocket, GraduationCap } from "lucide-react";

const LEVEL_CONFIG = {
  beginner: {
    label: "Beginner",
    icon: GraduationCap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  intermediate: {
    label: "Intermediate",
    icon: Brain,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  advanced: {
    label: "Advanced",
    icon: Rocket,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

export default function Tips() {
  const [level, setLevel] = useState<string>("");

  const { data: tips, isLoading } = useQuery<Tip[]>({
    queryKey: ["tips", level],
    queryFn: () => apiFetch<Tip[]>(`/tips${level ? `?level=${level}` : ""}`),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          Tips & Tricks
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Expert guidance for prompt engineering at every skill level
        </p>
      </div>

      {/* Level filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={level === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setLevel("")}
        >
          All Levels
        </Button>
        {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Button
              key={key}
              variant={level === key ? "default" : "outline"}
              size="sm"
              onClick={() => setLevel(key)}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {cfg.label}
            </Button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(tips ?? []).map((tip, i) => {
            const cfg = LEVEL_CONFIG[tip.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.beginner;
            const Icon = cfg.icon;
            return (
              <Card key={tip.id} className={`border ${cfg.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-white/5 shrink-0 shadow-sm">
                      <span className={`text-sm font-bold ${cfg.color}`}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-sm">{tip.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
                      {tip.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {tip.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs py-0">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
