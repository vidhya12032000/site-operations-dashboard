import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Site Operations
      </div>

      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/sites"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Sites
        </NavLink>

        <NavLink
          to="/installations"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Installations
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;