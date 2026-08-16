import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase/supabaseClient"; // adjust path if needed
import MainLayout from "./layout/mainlayout.jsx";
import Signup from "./pages/signup.jsx";
import Landingpage from "./pages/landingpage.jsx";
import Login from "./pages/login.jsx";
import ForgotPassword from "./pages/forgotPassword.jsx";
import ResetPassword from "./pages/resetPassword.jsx";
import Products from "./pages/products.jsx";
import Productspage from "./pages/productspage.jsx";
import CartPage from "./pages/cartPage.jsx";
import Contact from "./pages/contact.jsx";
import Terms from "./pages/terms.jsx";
import Privacy from "./pages/privacy.jsx";
import OrderSuccess from "./pages/orderSuccess.jsx";
import OrderCancelled from "./pages/orderCancelled.jsx";
import Aos from "aos";
import "aos/dist/aos.css";

// App is the root component. It owns the logged-in `user` state and decides
// which page component to render based on the current URL (routing).
function App() {
  // `user` is shared across the whole site: the header uses it to show
  // Login/Logout, and the cart page uses it to know whose cart to load.
  // It starts as null (not logged in) until we check for a session below.
  const [user, setUser] = useState(null);

  // Total number of items (summed quantity, not distinct lines) in the
  // logged-in user's cart. Lives up here so the header badge can show it
  // even though the cart itself is only loaded on the /cart and product
  // pages - whichever page changes the cart calls refreshCartCount()
  // afterward to keep this in sync.
  const [cartCount, setCartCount] = useState(0);

  async function refreshCartCount(currentUser = user) {
    if (!currentUser) {
      setCartCount(0);
      return;
    }
    const { data, error } = await supabase
      .from("cart")
      .select("quantity")
      .eq("user_id", currentUser.id);

    if (error) {
      console.error("Error loading cart count:", error);
    } else {
      setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
    }
  }

  // Set up AOS ("Animate On Scroll") once when the app first mounts.
  // The empty [] dependency array means this effect runs only once.
  useEffect(() => {
    Aos.init({ duration: 800, once: true });
  }, []);

  // Figure out whether someone is already logged in, and keep listening
  // for login/logout events for as long as the app is open.
  useEffect(() => {
    // Load current session
    // On page load, ask Supabase if there's a saved session (e.g. the user
    // logged in earlier and didn't sign out).
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      refreshCartCount(sessionUser);
    }
    loadSession();

    // Listen for login/logout changes
    // This subscribes to auth changes so `user` updates automatically
    // whenever someone logs in, logs out, or their session refreshes -
    // without needing to reload the page.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        refreshCartCount(sessionUser);
      },
    );

    // Cleanup function: React runs this if the component unmounts, so we
    // don't leak the subscription (it would keep firing into a dead component).
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      {/* Pass user + cartCount into MainLayout so Header can use them */}
      <MainLayout user={user} cartCount={cartCount}>
        {/* Routes/Route map a URL path to the page component that should
            render there. Only one Route's element renders at a time. */}
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/products/:slug"
            element={<Products refreshCartCount={refreshCartCount} />}
          />
          <Route path="/products" element={<Productspage />} />
          <Route
            path="/cart"
            element={
              <CartPage user={user} refreshCartCount={refreshCartCount} />
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-cancelled" element={<OrderCancelled />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
