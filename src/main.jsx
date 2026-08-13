import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// This is the entry point of the whole app.
// createRoot() finds the <div id="root"> in index.html and mounts our React
// component tree into it. Everything the site renders starts from <App />.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* StrictMode is a dev-only helper: it double-invokes some functions
        (like component bodies and effects) to help catch bugs. It doesn't
        run in production and doesn't render anything itself. */}
    <App />
  </StrictMode>,
);
