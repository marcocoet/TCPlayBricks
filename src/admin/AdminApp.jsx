import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import useRole from "./useRole";
import Spinner from "../components/Spinner";
import BrickButton from "../components/BrickButton";
import SetsList from "./pages/SetsList";
import SetEdit from "./pages/SetEdit";
import Themes from "./pages/Themes";

// Entry point for everything under /admin. App.jsx lazy-loads this file,
// so customers never download the admin code.
//
// `user` comes from App.jsx. `authReady` is false until App.jsx has
// checked for a saved session - without it we'd briefly think nobody is
// logged in and bounce the admin to the login page on every refresh.
export default function AdminApp({ user, authReady }) {
  const { isStaff, isAdmin, loading } = useRole(user);

  if (!authReady || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!isStaff) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">No access</h1>
        <p className="text-gray-600">
          This area is only for TC PlayBricks staff.
        </p>
        <BrickButton to="/">Back to the shop</BrickButton>
      </div>
    );
  }

  const tab = ({ isActive }) =>
    `px-4 py-2 rounded-md font-semibold text-sm transition ${
      isActive ? "bg-red-600 text-white" : "bg-white text-gray-800 hover:bg-gray-100"
    }`;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Admin{" "}
          <span className="text-sm font-normal text-gray-500">
            ({isAdmin ? "admin" : "staff"})
          </span>
        </h1>
        <nav className="flex flex-wrap gap-2">
          <NavLink to="/admin/sets" className={tab}>
            Sets
          </NavLink>
          <NavLink to="/admin/themes" className={tab}>
            Themes
          </NavLink>
        </nav>
      </div>

      <Routes>
        <Route index element={<Navigate to="sets" replace />} />
        <Route path="sets" element={<SetsList />} />
        <Route path="sets/new" element={<SetEdit />} />
        <Route path="sets/:setId" element={<SetEdit />} />
        <Route path="themes" element={<Themes />} />
        <Route path="*" element={<Navigate to="sets" replace />} />
      </Routes>
    </div>
  );
}
