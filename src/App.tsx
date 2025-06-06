
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TelegramProvider } from "./providers/TelegramProvider";
import TelegramApp from "./TelegramApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TelegramProvider>
        <Toaster />
        <Sonner />
        <TelegramApp />
      </TelegramProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
