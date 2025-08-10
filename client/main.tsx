import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Emergency from "./pages/Emergency";
import FakeCall from "./pages/FakeCall";
import Location from "./pages/Location";
import QuickDial from "./pages/QuickDial";
import DangerZones from "./pages/DangerZones";
import HiddenMode from "./pages/HiddenMode";
import Calculator from "./pages/Calculator";
import Clock from "./pages/Clock";
import CheckIn from "./pages/CheckIn";
import VoiceActivation from "./pages/VoiceActivation";
import ShakeAlert from "./pages/ShakeAlert";
import ReportIncident from "./pages/ReportIncident";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import Voices from "./pages/Voices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      themes={["light", "dark"]}
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/fake-call" element={<FakeCall />} />
              <Route path="/location" element={<Location />} />
              <Route path="/quick-dial" element={<QuickDial />} />
              <Route path="/danger-zones" element={<DangerZones />} />
              <Route path="/hidden-mode" element={<HiddenMode />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/clock" element={<Clock />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/voice-activation" element={<VoiceActivation />} />
              <Route path="/shake-alert" element={<ShakeAlert />} />
              <Route path="/report-incident" element={<ReportIncident />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/voices" element={<Voices />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
