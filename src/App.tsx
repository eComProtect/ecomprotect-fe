import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NotificationProvider } from "./providers/notification.provider";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { registerServiceWorker } from "./utils/serviceWorker";

function App() {
  const queryClient = new QueryClient();

  useEffect(() => {
    // Register service worker early in app lifecycle
    registerServiceWorker().catch((error) => {
      console.error("Failed to register service worker:", error);
    });
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NotificationProvider>
            <Router />
            <Toaster />
            <ReactQueryDevtools />
          </NotificationProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
