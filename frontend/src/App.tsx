import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import Installations from "./pages/Installations";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/sites"
          element={<Sites />}
        />

        <Route
          path="/installations"
          element={<Installations />}
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;