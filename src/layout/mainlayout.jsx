import Header from "../components/header.jsx";
import Footer from "../components/footer.jsx";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1/2">{children}</main>
      <Footer />
    </div>
  );
}
