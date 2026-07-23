import Header from "../components/header.jsx";
import Footer from "../components/footer.jsx";

export default function MainLayout({ children, user }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header user={user} />
      <main className="grow bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
