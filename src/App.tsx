import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Command from "./pages/Command";
import Floor from "./pages/Floor";
import Ops from "./pages/Ops";
import Incidents from "./pages/Incidents";
import Schedule from "./pages/Schedule";
import Timeline from "./pages/Timeline";
import Watchtower from "./pages/Watchtower";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Command />} />
            <Route path="/floor" element={<Floor />} />
            <Route path="/ops" element={<Ops />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/watchtower" element={<Watchtower />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
