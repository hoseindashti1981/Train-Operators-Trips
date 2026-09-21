import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LoheApp } from "@/components/lohe-app";
import "@/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");

createRoot(root).render(
  <StrictMode>
    <LoheApp />
  </StrictMode>,
);
