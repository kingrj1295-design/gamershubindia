
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

const rootElement = document.getElementById("root");

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

if (rootElement.hasChildNodes()) {
  // Reuse prerendered HTML on game detail pages.
  hydrateRoot(rootElement, app);
} else {
  // Normal client rendering for pages without prerendered HTML.
  createRoot(rootElement).render(app);
}
