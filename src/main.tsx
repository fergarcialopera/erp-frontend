import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/colors.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
