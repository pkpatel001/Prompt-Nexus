import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/dashboard";
import Explore from "@/pages/explore";
import PromptDetail from "@/pages/prompt-detail";
import Categories from "@/pages/categories";
import Platforms from "@/pages/platforms";
import Tips from "@/pages/tips";
import Favorites from "@/pages/favorites";
import Builder from "@/pages/builder";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/explore" component={Explore} />
        <Route path="/prompts/:id" component={PromptDetail} />
        <Route path="/categories" component={Categories} />
        <Route path="/platforms" component={Platforms} />
        <Route path="/tips" component={Tips} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/builder" component={Builder} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
