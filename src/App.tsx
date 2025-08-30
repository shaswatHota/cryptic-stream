import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useChatStore } from "@/stores/chatStore";
import Welcome from "./components/Welcome";
import Home from "./pages/Home";
import UserSetup from "./pages/UserSetup";
import ChatRoom from "./pages/ChatRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useChatStore();
  const [showWelcome, setShowWelcome] = useState(!isAuthenticated);

  useEffect(() => {
    setShowWelcome(!isAuthenticated);
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Home />
                ) : showWelcome ? (
                  <Welcome onGetStarted={handleGetStarted} />
                ) : (
                  <Navigate to="/setup" replace />
                )
              } 
            />
            <Route 
              path="/setup" 
              element={!isAuthenticated ? <UserSetup /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/chat/:groupID" 
              element={isAuthenticated ? <ChatRoom /> : <Navigate to="/setup" replace />} 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
