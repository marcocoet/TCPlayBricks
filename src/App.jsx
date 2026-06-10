import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/mainlayout.jsx";
import Signup from "./pages/signup.jsx";
import Landingpage from "./pages/landingpage.jsx";
import Login from "./pages/login.jsx";
function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
