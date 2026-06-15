import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase/supabaseClient"; // adjust path if needed
import MainLayout from "./layout/mainlayout.jsx";
import Signup from "./pages/signup.jsx";
import Landingpage from "./pages/landingpage.jsx";
import Login from "./pages/login.jsx";
import Products from "./pages/products.jsx";
import Productspage from "./pages/productspage.jsx";
import CartPage from "./pages/cartPage.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ Load current session
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    }
    loadSession();

    // ✅ Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      {/* Pass user into MainLayout so Header can use it */}
      <MainLayout user={user}>
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products/:slug" element={<Products />} />
          <Route path="/products" element={<Productspage />} />
          <Route path="/cart" element={<CartPage user={user} />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
