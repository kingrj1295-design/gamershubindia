import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Products from "./pages/Products.jsx";
import GameLibrary from "./pages/GameLibrary.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import GameDetail from "./pages/GameDetail.jsx";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/games" element={<GameLibrary />} />
          <Route path="/games/:slug" element={<GameDetail />} />
          <Route path="/community" element={<ComingSoon title="Community" phase="Phase 5" />} />
          <Route path="/news" element={<ComingSoon title="Gaming News" phase="Phase 6" />} />
          <Route path="/help" element={<ComingSoon title="Help & Support" phase="Phase 6" />} />
          <Route path="*" element={<ComingSoon title="Page not found" phase="" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
