import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, Prompt, PromptExample } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Star,
  Copy,
  Heart,
  HeartOff,
  Variable,
  Tag,
  ChevronDown,
  ChevronUp,
  Monitor,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[level] ?? styles.beginner}`}>
      {level}
    </span>
  );
}

function ExampleCard({ example }: { example: PromptExample }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{example.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">User Input</p>
          <p className="text-sm bg-muted/50 rounded-lg p-3">{example.userInput}</p>
        </div>
        {expanded && (
          <>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Filled Template</p>
              <pre className="text-xs bg-muted/50 rounded-lg p-3 whitespace-pre-wrap font-mono">{example.filledTemplate}</pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">AI Output</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(example.aiOutput);
                    toast({ title: "Copied to clipboard" });
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>
              <div className="text-xs bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                {example.aiOutput}
              </div>
            </div>
            {example.notes && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <span className="font-medium">Note:</span> {example.notes}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function PromptDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: prompt, isLoading } = useQuery<Prompt>({
    queryKey: ["prompt", id],
    queryFn: () => apiFetch<Prompt>(`/prompts/${id}`),
    enabled: !!id,
  });

  const { data: examples } = useQuery<PromptExample[]>({
    queryKey: ["examples", id],
    queryFn: () => apiFetch<PromptExample[]>(`/prompts/${id}/examples`),
    enabled: !!id,
  });

  const { data: favorites } = useQuery<{ promptId: number }[]>({
    queryKey: ["favorites"],
    queryFn: () => apiFetch<{ promptId: number }[]>("/favorites"),
  });

  const isFav = (favorites ?? []).some((f) => f.promptId === Number(id));

  const addFav = useMutation({
    mutationFn: () => apiFetch("/favorites", { method: "POST", body: JSON.stringify({ promptId: Number(id) }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites"] }); toast({ title: "Added to favorites" }); },
  });

  const removeFav = useMutation({
    mutationFn: () => apiFetch(`/favorites/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites"] }); toast({ title: "Removed from favorites" }); },
  });

  function copyTemplate() {
    if (prompt) {
      navigator.clipboard.writeText(prompt.template);
      toast({ title: "Template copied to clipboard" });
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded-xl animate-pulse" />
        <div className="h-60 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Prompt not found.</p>
        <Link href="/explore"><Button variant="ghost" className="mt-2">Back to Explore</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/explore">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight">{prompt.title}</h1>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={copyTemplate}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant={isFav ? "default" : "outline"}
              size="sm"
              onClick={() => isFav ? removeFav.mutate() : addFav.mutate()}
            >
              {isFav ? <HeartOff className="h-4 w-4 mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              {isFav ? "Unfave" : "Favorite"}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">{prompt.description}</p>
        <div className="flex flex-wrap gap-2 items-center">
          <DifficultyBadge level={prompt.difficulty} />
          {prompt.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium">
              <Star className="h-3 w-3" /> Featured
            </span>
          )}
          <span className="text-sm text-muted-foreground">in <span className="font-medium text-foreground">{prompt.categoryName}</span></span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Template */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Prompt Template
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={copyTemplate}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/40 rounded-xl p-4 leading-relaxed border border-border/50">
                {prompt.template}
              </pre>
            </CardContent>
          </Card>

          {/* Examples */}
          {(examples ?? []).length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-base">Real Examples</h2>
              {examples!.map((ex) => <ExampleCard key={ex.id} example={ex} />)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Variables */}
          {prompt.variables.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
                  <Variable className="h-3.5 w-3.5" />
                  Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {prompt.variables.map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{"{" + v + "}"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Platforms */}
          {prompt.platformNames.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
                  <Monitor className="h-3.5 w-3.5" />
                  Compatible Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {prompt.platformNames.map((name) => (
                  <div key={name} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {name}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 uppercase tracking-wide text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
