import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { PwaRegister } from "@/components/PwaRegister";
import "./styles/colors.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <PwaRegister />
    <App />
  </>,
);
