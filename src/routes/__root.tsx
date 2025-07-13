// src/routes/__root.tsx

import { createRootRoute, Outlet } from "@tanstack/react-router";
import "./finishSignUp";


// Import your site-wide components and the AuthProvider
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/components/AuthContext"; // <-- CRITICAL IMPORT

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    // Wrap the entire application in the AuthProvider
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        
        {/* The main content area that will grow to fill the space */}
        <main className="flex-1">
          {/* The Outlet now renders its children inside the AuthProvider context */}
          <Outlet />
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}