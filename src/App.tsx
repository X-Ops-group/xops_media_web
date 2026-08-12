import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Category } from "./pages/Category";
import { ArticlePage } from "./pages/ArticlePage";
import "./theme.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home lang="en" />} />
      <Route path="/categoria/:slug" element={<Category lang="en" />} />
      <Route path="/articulo/:slug" element={<ArticlePage lang="en" />} />

      <Route path="/es" element={<Home lang="es" />} />
      <Route path="/es/categoria/:slug" element={<Category lang="es" />} />
      <Route path="/es/articulo/:slug" element={<ArticlePage lang="es" />} />
    </Routes>
  );
}
