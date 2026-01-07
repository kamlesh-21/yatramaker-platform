// //client/vite-project/src/pages/not-found.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-muted-foreground">We couldn't find that page.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>Go Home</button>
      </div>
    </div>
  );
}
