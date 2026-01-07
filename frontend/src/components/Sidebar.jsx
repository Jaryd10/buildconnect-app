import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">BuildConnect</h2>

      <nav>
        <NavLink to="/public">Public Chat</NavLink>
        <NavLink to="/dm">Direct Messages</NavLink>
        <NavLink to="/followers">Followers</NavLink>
        <NavLink to="/directory">Business Directory</NavLink>
        <NavLink to="/marketplace">Marketplace</NavLink>
      </nav>
    </aside>
  );
}
