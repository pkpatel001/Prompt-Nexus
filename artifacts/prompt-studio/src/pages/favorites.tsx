import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, HeartOff, BookOpen, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FavoriteWithPrompt {
  id: number;
  promptId: number;
  createdAt: string;
  prompt: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    categoryName: string;
    tags: string[];
  };
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

export default function Favorites() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: favorites, isLoading } = useQuery<FavoriteWithPrompt[]>({
    queryKey: ["favorites"],
    queryFn: () => apiFetch<FavoriteWithPrompt[]>("/favorites"),
  });

  const removeFav = useMutation({
    mutationFn: (promptId: number) => apiFetch(`/favorites/${promptId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      toast({ title: "Removed from favorites" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          Favorites
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {favorites?.length ?? 0} saved prompts
        </p>
      </div>

      {!favorites?.length ? (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No favorites yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Save prompts you love and find them here.</p>
          <Link href="/explore">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Prompts
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <Card key={fav.id} className="group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-semibold text-sm">{fav.prompt.title}</span>
                      <DifficultyBadge level={fav.prompt.difficulty} />
                      <span className="text-xs text-muted-foreground">{fav.prompt.categoryName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{fav.prompt.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {fav.prompt.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/prompts/${fav.promptId}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      onClick={() => removeFav.mutate(fav.promptId)}
                    >
                      <HeartOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
