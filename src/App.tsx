import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import DirectMessage from "./pages/DirectMessage";
import SpecialAccess from "./pages/SpecialAccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/chat/:chatId" element={<Chat />} />
      <Route path="/dm/:conversationId" element={<DirectMessage />} />
      <Route path="/special-access" element={<SpecialAccess />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
