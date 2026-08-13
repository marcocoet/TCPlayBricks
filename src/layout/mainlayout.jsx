import Header from "../components/header.jsx";
import Footer from "../components/footer.jsx";

// MainLayout wraps every page with the same Header and Footer, so we don't
// have to repeat them in each page file. `children` is whatever page
// component App.jsx put inside <MainLayout> for the current route.
export default function MainLayout({ children, user, cartCount }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header user={user} cartCount={cartCount} />
      <main className="grow bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
