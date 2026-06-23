import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Grid3X3,
  Monitor,
  Lightbulb,
  Heart,
  Zap,
  Menu,
  X,
  Wand2,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/builder", label: "Prompt Builder", icon: Wand2 },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/platforms", label: "Platforms", icon: Monitor },
  { href: "/tips", label: "Tips & Tricks", icon: Lightbulb },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const [location] = useLocation();
  const isActive = href === "/" ? location === "/" : location.startsWith(href);
  return (
    <Link href={href}>
      <span
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
            <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-bold text-sm leading-tight">Prompt Studio</p>
            <p className="text-sidebar-foreground/40 text-xs">AI Engineering</p>
          </div>
          <button
            className="ml-auto lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/30 text-center">Fully offline · No API keys needed</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card lg:hidden">
          <button
            className="text-foreground/60 hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm">Prompt Studio</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
