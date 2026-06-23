import { useQuery } from "@tanstack/react-query";
import { apiFetch, Prompt, Category, Platform } from "@/lib/api";
import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Star, Filter, X } from "lucide-react";

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

export default function Explore() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [platformId, setPlatformId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [featured, setFeatured] = useState(false);

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId) params.set("categoryId", categoryId);
  if (platformId) params.set("platformId", platformId);
  if (difficulty) params.set("difficulty", difficulty);
  if (featured) params.set("featured", "true");
  params.set("limit", "50");

  const { data, isLoading } = useQuery({
    queryKey: ["prompts", params.toString()],
    queryFn: () => apiFetch<{ prompts: Prompt[]; total: number }>(`/prompts?${params.toString()}`),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/categories"),
  });

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ["platforms"],
    queryFn: () => apiFetch<Platform[]>("/platforms"),
  });

  const prompts = data?.prompts ?? [];
  const total = data?.total ?? 0;
  const hasFilters = !!(search || categoryId || platformId || difficulty || featured);

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setPlatformId("");
    setDifficulty("");
    setFeatured(false);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore Prompts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {total} prompts available — filter by category, platform, or skill level
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prompts..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All Categories</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={platformId}
          onChange={(e) => setPlatformId(e.target.value)}
        >
          <option value="">All Platforms</option>
          {(platforms ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <Button
          variant={featured ? "default" : "outline"}
          size="sm"
          className="h-9"
          onClick={() => setFeatured((f) => !f)}
        >
          <Star className="h-3.5 w-3.5 mr-1.5" />
          Featured
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No prompts match your filters.</p>
          <Button variant="ghost" className="mt-2" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((p) => (
            <Link key={p.id} href={`/prompts/${p.id}`}>
              <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer group">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                    {p.isFeatured && <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{p.description}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <DifficultyBadge level={p.difficulty} />
                      <span className="text-xs text-muted-foreground">{p.categoryName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
