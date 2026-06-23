import { useQuery } from "@tanstack/react-query";
import { apiFetch, Category } from "@/lib/api";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const ICON_MAP: Record<string, string> = {
  Megaphone: "📣",
  Code: "💻",
  PenTool: "✍️",
  Scale: "⚖️",
  Heart: "❤️",
  GraduationCap: "🎓",
  Briefcase: "💼",
  BarChart3: "📊",
  Headphones: "🎧",
  Users: "👥",
  DollarSign: "💰",
  FlaskConical: "🔬",
  Image: "🖼️",
  CheckSquare: "✅",
};

export default function Categories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/categories"),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {categories?.length ?? 0} industry categories with curated prompts
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(categories ?? []).map((cat) => (
            <Link key={cat.id} href={`/explore?categoryId=${cat.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group hover:border-primary/30 h-full">
                <CardContent className="p-5">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    {ICON_MAP[cat.icon] ?? "📌"}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors leading-tight">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{cat.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>{cat.promptCount} prompts</span>
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
