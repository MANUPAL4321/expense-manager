import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="nav-wrapper">
      <nav className="nav" id="main-header">
        {/* Left: Logo */}
        <Link to="/dashboard" className="logo-container" id="logo-link">
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h2 className="logo-text">Expense<span className="logo-highlight">Manager</span></h2>
        </Link>

        {/* Right: Profile Avatar */}
        <div className="profile-section" ref={dropdownRef}>
          <button
            className="avatar-btn"
            id="profile-avatar-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="User menu"
          >
            <span className="avatar-initials">{getInitials(user?.username)}</span>
            <svg className={`avatar-chevron ${showDropdown ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {showDropdown && (
            <div className="profile-dropdown" id="profile-dropdown">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">{getInitials(user?.username)}</div>
                <div>
                  <p className="dropdown-username">{user?.username}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/dashboard" className={`dropdown-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setShowDropdown(false)} id="dropdown-dashboard">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Dashboard</span>
              </Link>
              <Link to="/add" className={`dropdown-item ${location.pathname === '/add' ? 'active' : ''}`} onClick={() => setShowDropdown(false)} id="dropdown-add">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <span>Add Transaction</span>
              </Link>
              <Link to="/history" className={`dropdown-item ${location.pathname === '/history' ? 'active' : ''}`} onClick={() => setShowDropdown(false)} id="dropdown-history">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>History</span>
              </Link>

              <Link to="/analyze" className={`dropdown-item ${location.pathname === '/analyze' ? 'active' : ''}`} onClick={() => setShowDropdown(false)} id="dropdown-analyze">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <span>Analyze</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item logout-item" id="dropdown-logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
