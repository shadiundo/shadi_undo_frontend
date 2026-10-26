// src/app/(admin)/pages/Main/components/Footer.jsx
import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";
import logo from "@/assets/images/shadiundo.png";

const COLORS = {
  dark: "#1b1f23",
  panel: "#1b1f23",
  text: "#ffffff",
  muted: "#9aa3a8",
  accent: "#CAAA93",
  accentDark: "#604B33",
  curveBg: "#fbfaf8",
};

const FooterShell = styled.footer`
  position: relative;
  background: ${COLORS.panel};
  color: ${COLORS.text};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

/* top curve background */
const CurveWrap = styled.div`
  width: 100%;
  height: 110px;
  line-height: 0;
  background: ${COLORS.curveBg};
`;

/* responsive container:
   - fixed brand column on large screens so alignment matches screenshot
   - 2 columns for medium, 1 column for mobile
*/
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 22px 28px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 28px;
  align-items: flex-start;
  box-sizing: border-box;

  /* Desktop: fixed left brand column and vertically center */
  @media (min-width: 1000px) {
    grid-template-columns: 320px 1fr 1fr 1fr;
    align-items: center;
  }

  /* Tablet */
  @media (max-width: 1000px) and (min-width: 641px) {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 32px 18px 22px;
  }

  /* Mobile */
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 20px 16px 18px;
  }
`;

/* Column wrapper */
const Col = styled.div`
  min-width: 0;

  /* center the brand column on desktop vertically (first child) */
  @media (min-width: 1000px) {
    &:first-child {
      align-self: center;
    }
  }

  @media (max-width: 640px) {
    text-align: center;
    align-self: center;
  }
`;

/* Brand area (logo + description + socials) */
const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  img {
    /* responsive logo: scales with viewport but clamps to reasonable sizes */
    width: clamp(140px, 12vw, 220px);
    height: auto;
    display: block;
  }

  p {
    color: ${COLORS.muted};
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 640px) {
    align-items: center;

    img {
      margin-bottom: 4px;
    }

    p {
      max-width: 100%;
      text-align: center;
    }
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const SocButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  color: ${COLORS.text};
  text-decoration: none;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);
  transition: transform 0.12s, box-shadow 0.12s, background 0.12s, color 0.12s, width 0.12s, height 0.12s;

  &:hover,
  &:focus {
    transform: translateY(-6px);
    background: ${COLORS.accent};
    color: #111;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
    outline: none;
  }

  svg {
    width: 18px;
    height: 18px;
    display: block;
  }

  @media (max-width: 420px) {
    width: 40px;
    height: 40px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ColTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: ${COLORS.text};
  font-weight: 700;

  @media (max-width: 640px) {
    text-align: center;
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  li a {
    color: ${COLORS.muted};
    text-decoration: none;
    font-size: 15px;
    display: inline-block;
    transition: color 0.12s;
  }

  li a:hover,
  li a:focus {
    color: ${COLORS.text};
  }

  @media (max-width: 640px) {
    align-items: center;
  }
`;

const Address = styled.address`
  font-style: normal;
  color: ${COLORS.muted};
  font-size: 14px;
  line-height: 1.6;

  @media (max-width: 640px) {
    max-width: 320px;
    margin: 0 auto;
    text-align: center;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.03);
  margin-top: 6px;
`;

const SubFooter = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 22px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 14px 16px 22px;
  }
`;

const Copy = styled.div`
  color: ${COLORS.muted};
  font-size: 13px;
  text-align: left;

  @media (max-width: 640px) {
    text-align: center;
  }
`;

const LangSelect = styled.select`
  background: transparent;
  color: ${COLORS.muted};
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    box-shadow: 0 6px 18px rgba(202, 170, 147, 0.08);
    color: ${COLORS.text};
  }
`;

const RightArea = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 640px) {
    justify-content: center;
    width: 100%;
  }
`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <FooterShell>
      <CurveWrap aria-hidden>
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          width="100%"
          height="140"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
        >
          <rect x="0" y="0" width="100%" height="100%" fill={COLORS.curveBg} />
          <path
            d="M0,80 C160,40 420,40 720,60 C1020,80 1280,110 1440,40 L1440,240 L0,240 Z"
            fill={COLORS.panel}
          />
        </svg>
      </CurveWrap>

      <Container>
        <Col>
          <Brand>
            <NavLink to="/" aria-label="ShaadiUndo home">
              <img src={logo} alt="ShaadiUndo logo" />
            </NavLink>

            <p>
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
            </p>

            <Socials aria-label="Social links">
              <SocButton href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </SocButton>
              <SocButton href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </SocButton>
              <SocButton href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </SocButton>
              <SocButton href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </SocButton>
              <SocButton href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </SocButton>
            </Socials>
          </Brand>
        </Col>

        <Col>
          <ColTitle>Links</ColTitle>
          <List>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/services">Services</NavLink>
            </li>
            <li>
              <NavLink to="/about">About Us</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact Us</NavLink>
            </li>
          </List>
        </Col>

        <Col>
          <ColTitle>Find Us</ColTitle>
          <Address>
            43 W. Wellington Road Fairhope
            <br />
            AL 36532
            <br />
            <br />
            (257) 388-6895
            <br />
            temmink@outlook.com
          </Address>
        </Col>

        <Col>
          <ColTitle>Partner With Us</ColTitle>
          <List>
            <li>
              <a href="/auth/professional-login">Join as Lawyer</a>
            </li>
            <li>
              <a href="/auth/professional-login">Join as Therapists</a>
            </li>
            <li>
              <a href="/auth/professional-login">Join as Counsellor</a>
            </li>
            <li>
              <a href="/auth/professional-login">Join as Mediator</a>
            </li>
          </List>
        </Col>
      </Container>

      <Divider />

      <SubFooter>
        <Copy>© {year} - SHAADI UNDO. Designed by Socially Connect. All rights reserved</Copy>

        <RightArea>
          <LangSelect aria-label="Select language" defaultValue="en">
            <option value="en">English</option>
          </LangSelect>
        </RightArea>
      </SubFooter>
    </FooterShell>
  );
}
