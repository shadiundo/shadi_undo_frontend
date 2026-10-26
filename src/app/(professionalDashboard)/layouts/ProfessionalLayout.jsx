// ProfessionalLayout.jsx
import React, { useEffect, useState, useRef } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaEdit,
  FaCertificate,
  FaMoon,
  FaSun,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaRegCalendarAlt,
  FaChevronRight,
  FaChevronLeft,
  FaCrown,
} from "react-icons/fa";
import { useAuthContext } from "@/context/useAuthContext";
import logo from "@/assets/images/shadiundo.png";

const ProfessionalLayout = () => {
  const { user, removeSession } = useAuthContext();

  // State
  const [theme, setTheme] = useState(() => localStorage.getItem("data-layout-mode") || "light");
  const [collapsed, setCollapsed] = useState(false); // Desktop sidebar state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile sidebar state

  // --- Theme Logic ---
  const applyTheme = (mode) => {
    document.body.setAttribute("data-layout-mode", mode);
    document.body.classList.toggle("dark-mode", mode === "dark");
    try {
      localStorage.setItem("data-layout-mode", mode);
    } catch { }
    window.dispatchEvent(new Event("app-theme-changed"));
  };

  useEffect(() => applyTheme(theme), [theme]);

  useEffect(() => {
    window.toggleAppTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    return () => {
      try { delete window.toggleAppTheme; } catch { }
    };
  }, []);

  // --- Logout Logic ---
  const handleLogout = async () => {
    try {
      await removeSession?.();
      window.location.href = "/auth/professional-login";
    } catch (e) {
      console.error(e);
    }
  };

  // --- Auto-close mobile menu on resize or route change ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  /* ---------- Sub-Components ---------- */

  const ThemeModeToggle = () => {
    const [isDark, setIsDark] = useState(theme === "dark");
    useEffect(() => {
      const onChange = () => setIsDark(document.body.classList.contains("dark-mode"));
      window.addEventListener("app-theme-changed", onChange);
      return () => window.removeEventListener("app-theme-changed", onChange);
    }, []);

    return (
      <button
        aria-label="Toggle theme"
        onClick={() => window.toggleAppTheme()}
        className="premium-icon-btn"
      >
        {isDark ? <FaSun className="text-sun" /> : <FaMoon className="text-moon" />}
      </button>
    );
  };

  const ProfileDropdown = ({ user }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const initials = (user?.name || user?.email || "U").slice(0, 2).toUpperCase();

    useEffect(() => {
      const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }, []);

    return (
      <div ref={ref} className="dropdown-wrapper">
        <button onClick={() => setOpen(!open)} className="premium-avatar-trigger">
          <div className="avatar-circle">{initials}</div>
          <div className="avatar-info-desktop">
            <span className="name-trunc">{user?.name?.split(' ')[0] || "User"}</span>
            <FaChevronRight className={`chevron ${open ? 'rotate' : ''}`} />
          </div>
        </button>
        {open && (
          <div className="premium-dropdown-panel">
            <div className="dropdown-user-header">
              <div className="avatar-large">{initials}</div>
              <div className="header-meta">
                <p className="m-0 fw-bold">{user?.name ?? user?.email}</p>
                <p className="m-0 role-badge">{user?.role || "Professional"}</p>
              </div>
            </div>
            <div className="dropdown-body">
              <NavLink to="/professional/profile" className="drop-item" onClick={() => setOpen(false)}>
                <FaUser /> View Profile
              </NavLink>
              <button onClick={handleLogout} className="drop-item logout">
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap');

        :root { 
            --accent: #CAAA93; 
            --accent-hover: #b89882;
            --accent-soft: rgba(202, 170, 147, 0.12);
            --transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            --font-main: 'Raleway', sans-serif;
            --radius-lg: 18px;
            --radius-md: 12px;
            --shadow-premium: 0 10px 40px -10px rgba(0,0,0,0.1);
        }

        body { 
          font-family: var(--font-main); 
          margin: 0; 
          background-color: var(--bg);
          -webkit-font-smoothing: antialiased;
        }

        body[data-layout-mode="light"] {
          --bg: #FDFCFB;
          --panel: #ffffff;
          --text: #1A202C;
          --muted: #718096;
          --border: #EDF2F7;
          --glass-bg: rgba(255, 255, 255, 0.85);
        }

        body[data-layout-mode="dark"] {
          --bg: #0D1117;
          --panel: #161B22;
          --text: #C9D1D9;
          --muted: #8B949E;
          --border: #30363D;
          --glass-bg: rgba(22, 27, 34, 0.85);
        }

        .pro-layout { display: flex; min-height: 100vh; }
        .pro-main { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; }

        /* --- Sidebar Styling --- */
        .pro-sidebar {
          width: 280px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 1200;
          transition: width var(--transition), transform var(--transition);
        }

        .pro-sidebar.sidebar-collapsed { width: 90px; }

        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          position: relative;
          border-bottom: 1px solid transparent;
        }

        .logo-container img { 
          height: 100px; 
          width: auto; 
          object-fit: contain;
          transition: var(--transition);
        }
        
        .sidebar-collapsed .logo-container img { 
           opacity: 0;
           transform: scale(0.5);
           pointer-events: none;
        }

        /* Desktop Collapse Toggle (Circle) */
        .desktop-toggle-btn {
          position: absolute;
          right: -14px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--panel);
          color: var(--accent);
          border: 1px solid var(--border);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          z-index: 10;
        }
        .desktop-toggle-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }

        /* Mobile Close Button (Inside Sidebar) */
        .mobile-close-btn {
          display: none; /* Hidden on desktop */
          position: absolute;
          right: 20px;
          top: 25px;
          background: transparent;
          border: none;
          font-size: 20px;
          color: var(--text);
          cursor: pointer;
        }

        /* Nav Items */
        .side-nav { padding: 20px 16px; flex: 1; overflow-y: auto; }
        .nav-link {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          margin-bottom: 8px;
          border-radius: var(--radius-md);
          color: var(--muted);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          gap: 16px;
          position: relative;
        }

        .nav-link:hover { 
          background: var(--accent-soft); 
          color: var(--accent);
        }

        .nav-link.active { 
          background: var(--accent); 
          color: white; 
          box-shadow: 0 8px 20px -6px rgba(202, 170, 147, 0.6); 
        }

        .nav-link .icon { font-size: 20px; min-width: 24px; display: flex; justify-content: center; }

        /* --- Topbar Styling --- */
        .topbar {
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          height: 80px;
          padding: 0 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--border);
        }

        /* Hamburger Button (Mobile Only) */
        .hamburger-btn {
          display: none; /* Hidden by default on desktop */
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--panel);
          color: var(--text);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-right: 15px;
        }

        .premium-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--panel);
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: 0.2s;
        }
        .premium-icon-btn:hover { border-color: var(--accent); transform: translateY(-2px); }

        /* Profile Trigger */
        .premium-avatar-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--accent-soft);
          padding: 6px 14px 6px 6px;
          border-radius: 50px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: 0.2s;
        }
        .premium-avatar-trigger:hover { border-color: var(--accent); }

        .avatar-circle {
          width: 36px;
          height: 36px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
        }

        .avatar-info-desktop { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text); font-size: 14px; }
        .chevron { font-size: 10px; transition: 0.3s; opacity: 0.6; }
        .chevron.rotate { transform: rotate(180deg); }

        /* Dropdown Panel */
        .premium-dropdown-panel {
          position: absolute;
          right: 0;
          top: 60px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 260px;
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDown { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .dropdown-user-header { padding: 20px; background: var(--accent-soft); display: flex; align-items: center; gap: 15px; }
        .avatar-large { width: 48px; height: 48px; background: var(--accent); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 18px; }
        .role-badge { font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .drop-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          color: var(--text);
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          font-family: var(--font-main);
        }
        .drop-item:hover { background: var(--bg); color: var(--accent); }
        .drop-item.logout { color: #FF4D4D; border-top: 1px solid var(--border); }

        /* Sidebar Footer */
        .sidebar-footer { padding: 20px; border-top: 1px solid var(--border); margin-top: auto; }
        .pro-badge {
          background: linear-gradient(135deg, #CAAA93 0%, #D8Bfb0 100%);
          color: white;
          padding: 12px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 700;
        }

        /* --- RESPONSIVE / MOBILE CSS --- */
        @media (max-width: 991px) {
          /* Sidebar becomes fixed drawer */
          .pro-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            width: 280px;
            transform: translateX(-110%); /* Hidden by default */
            z-index: 1300; /* Higher than everything */
            box-shadow: 10px 0 30px rgba(0,0,0,0.2);
          }
          
          /* When open, slide in */
          .pro-sidebar.mobile-open {
            transform: translateX(0);
          }
          
          /* Hide desktop collapse toggle */
          .desktop-toggle-btn { display: none !important; }
          
          /* Show mobile close button inside sidebar */
          .mobile-close-btn { display: block; }

          /* Sidebar Header larger on mobile */
          .sidebar-header { justify-content: flex-start; padding-left: 20px; }

          /* Topbar Adjustments */
          .topbar { padding: 0 20px; height: 70px; }
          
          /* Show Hamburger */
          .hamburger-btn { display: flex !important; }
          
          /* Hide extra desktop elements */
          .avatar-info-desktop { display: none; }
          .premium-avatar-trigger { padding: 5px; }

          /* Backdrop */
          .mobile-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(5px);
            z-index: 1250; /* Between sidebar and content */
            animation: fadeIn 0.2s ease;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          
          .pro-content { padding: 20px; }
        }

        .text-sun { color: #F59E0B; }
        .text-moon { color: #818CF8; }
        .m-0 { margin: 0; }
        .fw-bold { font-weight: 700; }
      `}</style>

      <div className="pro-layout">
        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
        )}

        {/* --- SIDEBAR --- */}
        <aside className={`pro-sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

          <div className="sidebar-header">
            <div className="logo-container">
              <img src={logo} alt="ShaadiUndo" />
            </div>

            {/* Desktop: Collapse Circle Arrow */}
            <button
              className="desktop-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>

            {/* Mobile: Close X Button */}
            <button
              className="mobile-close-btn"
              onClick={() => setMobileOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          <nav className="side-nav">
            <PremiumNavItem to="/professional/dashboard" icon={<FaHome />} label="Dashboard" collapsed={collapsed} setMobileOpen={setMobileOpen} />
            <PremiumNavItem to="/professional/profile" icon={<FaUser />} label="Profile View" collapsed={collapsed} setMobileOpen={setMobileOpen} />
            <PremiumNavItem to="/professional/appointments" icon={<FaRegCalendarAlt />} label="Appointments" collapsed={collapsed} setMobileOpen={setMobileOpen} />
            <PremiumNavItem to="/professional/edit-profile" icon={<FaEdit />} label="Settings" collapsed={collapsed} setMobileOpen={setMobileOpen} />
            <PremiumNavItem to="/professional/documents" icon={<FaCertificate />} label="Certificates" collapsed={collapsed} setMobileOpen={setMobileOpen} />
          </nav>


        </aside>

        {/* --- MAIN CONTENT --- */}
        <div className="pro-main">

          <header className="topbar">
            {/* Left side: Hamburger + Title */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                className="hamburger-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <FaBars />
              </button>

              {/* Optional: Show title on mobile to fill space */}
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: window.innerWidth < 991 ? 'block' : 'none' }}>
                Dashboard
              </h3>
            </div>

            {/* Right side: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* <div style={{ display: window.innerWidth < 600 ? 'none' : 'block' }}>
                <ThemeModeToggle />
              </div> */}

              <button className="premium-icon-btn">
                <FaBell />
              </button>

              <ProfileDropdown user={user} />
            </div>
          </header>

          <main className="pro-content" style={{ padding: window.innerWidth < 991 ? '20px' : '30px' }}>
            <Outlet />
          </main>

        </div>
      </div>
    </>
  );
};

/* Helper Component for Nav Items */
const PremiumNavItem = ({ to, icon, label, collapsed, setMobileOpen }) => (
  <NavLink
    to={to}
    onClick={() => setMobileOpen(false)} // Auto-close on mobile when clicked
    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
  >
    <span className="icon">{icon}</span>
    {!collapsed && (
      <span className="label" style={{ flex: 1, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    )}
    {!collapsed && <FaChevronRight style={{ fontSize: '10px', opacity: 0.3 }} />}
  </NavLink>
);

export default ProfessionalLayout;