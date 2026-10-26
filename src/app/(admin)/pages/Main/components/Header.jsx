import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/images/shadiundo.png";
import { FaWallet } from "react-icons/fa";

/* Colors */
const ACCENT = "#CAAA93";
const TEXT = "#141C2C";
const DARK = "#03182A";
const BORDER_GRAY = "#E5E7EB";

/* =========================
   Styled components
   ========================= */

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 8%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96px;
  transition: background 0.28s ease, box-shadow 0.28s ease, border-bottom-color 0.28s ease;

  background: ${({ $isHome }) => ($isHome ? "transparent" : "#fff")};
  box-shadow: ${({ $isHome }) => ($isHome ? "none" : "0 4px 12px rgba(0,0,0,0.05)")};
  border-bottom: 1px solid ${({ $isHome }) => ($isHome ? "transparent" : BORDER_GRAY)};

  font-family: "Raleway", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    height: 68px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 70px;
  width: auto;               /* let width be determined by image + transform */
  margin-left: 0;

 

  img {
    height: 100%;
    width: auto;
    object-fit: contain;
    transform: scale(1.45) translateY(2px); 
    transform-origin: left center;
    display: block;
  }


  @media (min-width: 1200px) {
    
    margin-left: -50px;
    margin-right: auto;
    gap: 16px;
  }

  /* Mobile screens */
  @media (max-width: 768px) {
    height: 56px;
    margin-right: 0;

    img {
      transform: scale(1.2) translateY(0);
    }
  }
`;



const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 0;
  margin-left: 2rem;

  @media (max-width: 768px) {
    display: none;
    margin-left: 0; /* remove on mobile */
    margin-top: 0;
  }
`;


const StyledLink = styled(NavLink)`
  text-decoration: none;
  color: ${TEXT};
  font-size: 1.05rem;
  padding-bottom: 4px;
  font-weight: 700;
  position: relative;
  transition: color 0.22s ease, transform 0.18s ease;

  &.active { color: ${DARK}; }

  &.active::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -6px;
    transform: translateX(-50%);
    width: 38%;
    height: 2px;
    background: ${DARK};
    border-radius: 4px;
  }

  &:hover {
    color: ${DARK};
    transform: translateY(-1px);
  }
`;

const Button = styled(NavLink)`
  background: ${ACCENT};
  color: ${DARK};
  padding: 0.6rem 1.4rem;
  border-radius: 30px;
margin-left: 16px;
  font-size: 0.95rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.28s ease;
  box-shadow: 0 6px 18px rgba(11, 16, 20, 0.07);

  &:hover {
    background: #b07f64;
    color: #fff;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileSignIn = styled(NavLink)`
  display: none;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${ACCENT};
    color: ${DARK};
    padding: 0.38rem 0.9rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 4px 16px rgba(11,16,20,0.06);
    margin-left: 8px;
  }
`;

const WalletButton = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: #fff;
  color: ${DARK};
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  margin-left: 16px;          /* only pushes wallet away from the button */
  border: 1px solid rgba(15,23,42,0.06);
  box-shadow: 0 6px 18px rgba(11, 16, 20, 0.04);
  z-index: 2;

  &:hover {
    transform: translateY(-2px);
    background: #fffaf7;
  }

  @media (max-width: 768px) {
    display: inline-flex;
    padding: 0.35rem 0.7rem;
    margin-left: 8px;
  }
`;


const WalletBalance = styled.span`
  font-size: 0.95rem; 
  color: ${DARK};
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;

  @media (max-width: 768px) {
    display: block;
  }

  span {
    display: block;
    width: 22px;
    height: 2px;
    background: ${TEXT};
    margin: 4px 0;
    border-radius: 2px;
    transition: transform 0.25s ease, opacity 0.2s ease;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(8, 10, 12, 0.28);
  backdrop-filter: blur(${({ open }) => (open ? "2px" : "0px")});
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? "visible" : "hidden")};
  transition: opacity 0.28s ease, backdrop-filter 0.28s ease, visibility 0.28s;
  z-index: 110;
`;

const MobileMenu = styled.aside`
  position: fixed;
  top: 0;
  left: ${({ open }) => (open ? "0" : "-100%")};
  height: 100vh;
  width: 86%;
  max-width: 420px;
  background: ${({ $isHome }) => ($isHome ? "rgba(255,255,255,0.98)" : "#fff")};
  box-shadow: 0 18px 40px rgba(11, 16, 20, 0.08);
  padding: 22px;
  transition: left 0.34s cubic-bezier(.2,.8,.2,1);
  z-index: 115;
  display: flex;
  flex-direction: column;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  overflow-y: auto;
`;

const DrawerTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const DrawerLogoWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding-left: 6px;

  img {
    height: 100px;
    width: 100px;
    object-fit: contain;
    transform: scale(1.05);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${BORDER_GRAY};
  margin: 12px 0 16px 0;
`;

const MobileNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 14px 12px;
  border-radius: 10px;
  color: ${TEXT};
  text-decoration: none;
  font-weight: 700;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(202,170,147,0.06);
    transform: translateY(-2px);
  }

  &.active {
    background: rgba(202,170,147,0.12);
    color: ${DARK};
  }
`;

const MobileCTA = styled(Button)`
  display: block;
  width: 100%;
  margin-top: 16px;
  text-align: center;
  margin-left: -5px;
`;

const DrawerClose = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover { background: rgba(11,16,20,0.04); }

  svg { width: 18px; height: 18px; }
`;

/* =========================
   Component
   ========================= */

   const API_BASE = import.meta.env.VITE_API_URL || "";

function buildUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}


export default function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [walletBalance, setWalletBalance] = useState(null);

  React.useEffect(() => setMenuOpen(false), [location.pathname]);

useEffect(() => {
  let mounted = true;

  async function fetchWallet() {
    const token = localStorage.getItem("token");
    if (!token) {
      setWalletBalance(null);
      return;
    }

    try {
      const res = await fetch(buildUrl("/api/profile/me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (mounted && json?.success) {
        setWalletBalance(json.data?.wallet?.balance ?? null);
      }
    } catch (err) {
      console.error("Header wallet fetch failed", err);
    }
  }

  fetchWallet();

  return () => {
    mounted = false;
  };
}, [location.pathname]); 




  const formatCurrency = (amount) => {
    if (amount == null) return "—";
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    } catch {
      return String(amount);
    }
  };

  return (
    <>
      <HeaderWrapper $isHome={isHome}>
        
        {/* Left Hamburger */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <MobileMenuButton onClick={() => setMenuOpen(s => !s)}>
            <span style={{ transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none" }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none" }} />
          </MobileMenuButton>
        </div>

        {/* Center Logo */}
        <Logo as={Link} to="/">
        
          <img src={logo} alt="ShaadiUndo Logo" />
        </Logo>

        {/* Right Side */}
        <div style={{ display: "flex", alignItems: "center",   }}>
          <Nav>
            <StyledLink to="/" end>Home</StyledLink>
            <StyledLink to="/about">About</StyledLink>
            <StyledLink to="/services">Latest Articles</StyledLink>
            <StyledLink to="/partner-with-us">Latest News</StyledLink>
            <StyledLink to="/peculiar-cases">Peculiar Cases</StyledLink>
            <StyledLink to="/contact">Contact</StyledLink>
          </Nav>

          <Button to="/lawyer-list">Book Consultation</Button>

        <WalletButton to="/user-profile">
  <FaWallet size={20} style={{ color: "#D3382F" }} />
  <WalletBalance>
    {walletBalance == null
      ? "—"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(walletBalance)}
  </WalletBalance>
</WalletButton>


          <MobileSignIn to="/user-profile">Profile</MobileSignIn>
        </div>
      </HeaderWrapper>

      <Overlay open={menuOpen} onClick={() => setMenuOpen(false)} />

      <MobileMenu open={menuOpen} $isHome={isHome}>
        <DrawerTop>
          <div style={{ width: 40 }} />
          <DrawerLogoWrap><img src={logo} alt="ShaadiUndo" /></DrawerLogoWrap>
          <DrawerClose onClick={() => setMenuOpen(false)}>
            <svg viewBox="0 0 24 24"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="5.6" strokeLinecap="round"/></svg>
          </DrawerClose>
        </DrawerTop>

        <Divider />

        <nav>
          <MobileNavLink to="/" end>Home</MobileNavLink>
          <MobileNavLink to="/about">About</MobileNavLink>
          <MobileNavLink to="/services">Latest Articles</MobileNavLink>
          <MobileNavLink to="/partner-with-us">Latest News</MobileNavLink>
          <MobileNavLink to="/peculiar-cases">Peculiar Cases</MobileNavLink>
          <MobileNavLink to="/contact">Contact</MobileNavLink>

          <MobileCTA to="/lawyer-list">Book Consultation</MobileCTA>
        </nav>

        <div style={{ height: 36 }} />
      </MobileMenu>
    </>
  );
}
