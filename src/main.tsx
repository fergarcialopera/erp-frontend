import { suppressNonErrorConsole } from "@/lib/suppressConsoleNoise";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

suppressNonErrorConsole();

createRoot(document.getElementById("root")!).render(<App />);
