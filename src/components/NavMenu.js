import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isSuperUser } from '../utils/auth';
import './NavMenu.css';

function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isSuperUser');
    navigate('/login');
  };

  return (
    <div className="nav-menu" ref={dropdownRef}>
      <button onClick={toggleMenu} className="hamburger-menu">
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          <Link to="/" onClick={toggleMenu}>Home</Link>
          <Link to="/add-member" onClick={toggleMenu}>Add Member</Link>
          <Link to="/member-list" onClick={toggleMenu}>Member Search</Link>
          {isSuperUser() && <Link to="/register" onClick={toggleMenu}>Register User</Link>}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      )}
    </div>
  );
}

export default NavMenu;