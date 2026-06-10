import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/mainlayout.jsx";
import Landingpage from "./pages/landingpage.jsx";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landingpage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
