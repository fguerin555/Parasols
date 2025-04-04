import React from "react";
import { Link } from "react-router-dom";
import "../Global.css";
import styles from "./Navbar.module.css"; // Décommentez cette ligne

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarLinks}>
        <li>
          <Link to="/">Beach</Link>
        </li>
        <li>
          <Link to="/period">Period</Link>
        </li>
        <li>
          <Link to="/daybyday">Day by Day</Link>
        </li>
        <li>
          <Link to="/beachplanperiod">Beach Plan Period</Link>
        </li>
        <li>
          <Link to="/codbarrereader">Code barre Reader</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
