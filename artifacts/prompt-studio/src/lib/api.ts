const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  promptCount: number;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  capabilities: string[];
  promptCount: number;
}

export interface Prompt {
  id: number;
  title: string;
  description: string;
  template: string;
  categoryId: number;
  categoryName: string;
  platformIds: number[];
  platformNames: string[];
  difficulty: string;
  tags: string[];
  variables: string[];
  isFeatured: boolean;
  usageCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromptExample {
  id: number;
  promptId: number;
  title: string;
  userInput: string;
  filledTemplate: string;
  aiOutput: string;
  notes?: string;
}

export interface Tip {
  id: number;
  title: string;
  content: string;
  level: string;
  category: string;
  tags: string[];
  platformIds: number[];
  platformNames: string[];
  createdAt: string;
}

export interface Stats {
  totalPrompts: number;
  totalCategories: number;
  totalPlatforms: number;
  totalTips: number;
  featuredCount: number;
  beginnerCount: number;
  intermediateCount: number;
  advancedCount: number;
}

export interface PromptsResponse {
  prompts: Prompt[];
  total: number;
}
