import { useQuery } from "@tanstack/react-query";
import { apiFetch, Prompt } from "@/lib/api";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Wand2,
  Copy,
  Check,
  ChevronRight,
  RotateCcw,
  Variable,
  Eye,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

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

function highlightTemplate(template: string, values: Record<string, string>) {
  const parts: { text: string; isVar: boolean; varName?: string }[] = [];
  const regex = /\{([^}]+)\}/g;
  let last = 0;
  let match;
  while ((match = regex.exec(template)) !== null) {
    if (match.index > last) {
      parts.push({ text: template.slice(last, match.index), isVar: false });
    }
    parts.push({ text: match[0], isVar: true, varName: match[1] });
    last = match.index + match[0].length;
  }
  if (last < template.length) {
    parts.push({ text: template.slice(last), isVar: false });
  }

  return parts.map((part, i) => {
    if (!part.isVar) {
      return <span key={i}>{part.text}</span>;
    }
    const val = values[part.varName!];
    if (val) {
      return (
        <span key={i} className="bg-primary/15 text-primary rounded px-0.5 font-medium">
          {val}
        </span>
      );
    }
    return (
      <span key={i} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded px-0.5 font-mono text-xs">
        {part.text}
      </span>
    );
  });
}

function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{([^}]+)\}/g, (_, name) => values[name] || `{${name}}`);
}

type Step = "pick" | "fill" | "preview";

export default function Builder() {
  const [step, setStep] = useState<Step>("pick");
  const [search, setSearch] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data } = useQuery({
    queryKey: ["prompts-builder", search],
    queryFn: () =>
      apiFetch<{ prompts: Prompt[]; total: number }>(
        `/prompts?${search ? `search=${encodeURIComponent(search)}&` : ""}limit=30`
      ),
  });

  const prompts = data?.prompts ?? [];
  const filled = useMemo(
    () => (selectedPrompt ? fillTemplate(selectedPrompt.template, values) : ""),
    [selectedPrompt, values]
  );
  const allFilled = useMemo(() => {
    if (!selectedPrompt) return false;
    return selectedPrompt.variables.every((v) => values[v]?.trim());
  }, [selectedPrompt, values]);

  function pickPrompt(p: Prompt) {
    setSelectedPrompt(p);
    setValues({});
    setStep("fill");
  }

  function reset() {
    setStep("pick");
    setSelectedPrompt(null);
    setValues({});
    setCopied(false);
    setSearch("");
  }

  function copyResult() {
    navigator.clipboard.writeText(filled);
    setCopied(true);
    toast({ title: "Prompt copied!", description: "Paste it into your AI tool of choice." });
    setTimeout(() => setCopied(false), 3000);
  }

  const stepLabels: { key: Step; label: string }[] = [
    { key: "pick", label: "1. Choose Prompt" },
    { key: "fill", label: "2. Fill Variables" },
    { key: "preview", label: "3. Preview & Copy" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          Prompt Builder
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select a prompt, fill in the variables, and get a ready-to-use prompt instantly.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((s, i) => {
          const isActive = s.key === step;
          const isPast =
            (step === "fill" && s.key === "pick") ||
            (step === "preview" && (s.key === "pick" || s.key === "fill"));
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
              <button
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isPast
                    ? "text-primary cursor-pointer hover:bg-primary/10"
                    : "text-muted-foreground cursor-default"
                }`}
                onClick={() => {
                  if (isPast) {
                    if (s.key === "pick") reset();
                    else if (s.key === "fill") setStep("fill");
                  }
                }}
              >
                {s.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Step 1: Pick a prompt */}
      {step === "pick" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prompts by title or keyword..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {prompts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No prompts found.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {prompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickPrompt(p)}
                  className="text-left w-full"
                >
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">
                              {p.title}
                            </span>
                            <DifficultyBadge level={p.difficulty} />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {p.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{p.categoryName}</span>
                            {p.variables.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Variable className="h-3 w-3" />
                                {p.variables.length} variable{p.variables.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Fill variables */}
      {step === "fill" && selectedPrompt && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: inputs */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{selectedPrompt.title}</h2>
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-muted-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />
                Change
              </Button>
            </div>

            {selectedPrompt.variables.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  This prompt has no variables — it's ready to use as-is!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Fill in each variable to customize your prompt:
                </p>
                {selectedPrompt.variables.map((varName) => (
                  <div key={varName} className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {"{" + varName + "}"}
                      </span>
                    </label>
                    {varName.toLowerCase().includes("description") ||
                    varName.toLowerCase().includes("context") ||
                    varName.toLowerCase().includes("content") ||
                    varName.toLowerCase().includes("text") ||
                    varName.toLowerCase().includes("requirements") ||
                    varName.toLowerCase().includes("goals") ? (
                      <textarea
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder={`Enter ${varName.replace(/_/g, " ")}...`}
                        value={values[varName] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [varName]: e.target.value }))
                        }
                      />
                    ) : (
                      <Input
                        placeholder={`Enter ${varName.replace(/_/g, " ")}...`}
                        value={values[varName] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [varName]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => setStep("preview")}
                disabled={selectedPrompt.variables.length > 0 && !allFilled}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Prompt
              </Button>
              {selectedPrompt.variables.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setValues({})}
                  title="Reset all"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </h3>
            <Card className="border-dashed">
              <CardContent className="p-4">
                <pre className="text-sm whitespace-pre-wrap leading-relaxed font-mono">
                  {highlightTemplate(selectedPrompt.template, values)}
                </pre>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded bg-primary/15 mr-1 align-middle" />
              Filled values &nbsp;&nbsp;
              <span className="inline-block w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30 mr-1 align-middle" />
              Remaining placeholders
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Copy */}
      {step === "preview" && selectedPrompt && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Your Finished Prompt
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Ready to paste into any AI tool</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep("fill")} className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>

          {/* Result */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  {selectedPrompt.title}
                </CardTitle>
                <Button size="sm" onClick={copyResult} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap leading-relaxed font-mono bg-background/70 rounded-xl p-4 border border-border/50">
                {filled}
              </pre>
            </CardContent>
          </Card>

          {/* Variable summary */}
          {selectedPrompt.variables.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                  Variable Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedPrompt.variables.map((v) => (
                    <div key={v} className="flex items-start gap-2 text-sm">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                        {"{" + v + "}"}
                      </span>
                      <span className="text-foreground/80 break-words">{values[v] || "—"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={copyResult} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Build Another
            </Button>
            <Link href={`/prompts/${selectedPrompt.id}`}>
              <Button variant="ghost" size="lg">
                View Prompt Details
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
