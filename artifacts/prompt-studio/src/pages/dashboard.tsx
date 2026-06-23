import { useQuery } from "@tanstack/react-query";
import { apiFetch, Stats, Prompt, Tip } from "@/lib/api";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Grid3X3,
  Monitor,
  Lightbulb,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  Brain,
  Code2,
} from "lucide-react";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl`} style={{ backgroundColor: color + "20" }}>
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[level] ?? styles.beginner}`}>
      {level}
    </span>
  );
}

export default function Dashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => apiFetch<Stats>("/stats"),
  });

  const { data: featuredData } = useQuery({
    queryKey: ["prompts", "featured"],
    queryFn: () => apiFetch<{ prompts: Prompt[]; total: number }>("/prompts?featured=true&limit=6"),
  });

  const { data: tips } = useQuery<Tip[]>({
    queryKey: ["tips", "beginner"],
    queryFn: () => apiFetch<Tip[]>("/tips?level=beginner&limit=3"),
  });

  const featured = featuredData?.prompts ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-violet-600/90 p-8 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5" />
          <span className="text-sm font-medium opacity-80">AI Prompt Engineering Studio</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Master the Art of Prompt Engineering</h1>
        <p className="text-white/70 max-w-xl mb-6">
          A professional library of battle-tested prompts, expert tips, and real examples — all offline, all yours.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/explore">
            <Button variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-white/20">
              Browse Library <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tips">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Expert Tips <Lightbulb className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Prompts" value={stats.totalPrompts} icon={BookOpen} color="#6366f1" />
          <StatCard label="Categories" value={stats.totalCategories} icon={Grid3X3} color="#8b5cf6" />
          <StatCard label="AI Platforms" value={stats.totalPlatforms} icon={Monitor} color="#06b6d4" />
          <StatCard label="Expert Tips" value={stats.totalTips} icon={Lightbulb} color="#10b981" />
        </div>
      )}

      {/* Difficulty breakdown */}
      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Skill Level Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Beginner", count: stats.beginnerCount, color: "#10b981" },
                { label: "Intermediate", count: stats.intermediateCount, color: "#f59e0b" },
                { label: "Advanced", count: stats.advancedCount, color: "#ef4444" },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl bg-muted/40">
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Featured Prompts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Featured Prompts
            </h2>
            <Link href="/explore?featured=true">
              <Button variant="ghost" size="sm" className="text-primary">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {featured.map((p) => (
              <Link key={p.id} href={`/prompts/${p.id}`}>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-medium text-sm truncate">{p.title}</span>
                          <DifficultyBadge level={p.difficulty} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">{p.categoryName}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Tips sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-violet-500" />
              Quick Tips
            </h2>
            <Link href="/tips">
              <Button variant="ghost" size="sm" className="text-primary">
                All tips <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {(tips ?? []).map((tip) => (
              <Card key={tip.id} className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-100 dark:border-violet-900/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 shrink-0">
                      <Code2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tip.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tip.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Navigate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                { href: "/categories", label: "Browse by Category", icon: Grid3X3 },
                { href: "/platforms", label: "Browse by Platform", icon: Monitor },
                { href: "/favorites", label: "My Favorites", icon: Star },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-9">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
