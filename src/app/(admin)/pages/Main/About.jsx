// src/pages/About.jsx  (or wherever your About component lives)
import React from "react";
import styled from "styled-components";
import logo from "@/assets/images/shaadi-logo 3.png";
import union from "@/assets/images/Union.png";
import FullGuidanceImg from "@/assets/images/Guidence.png";
import KnowledgeCentre from "./homeComponents/KnowledgeCentre";
import SuccessfulStories from "./homeComponents/SuccessfulStories";
import BookingCategories from "./homeComponents/BookingCategories";

const AboutWrapper = styled.div`
  width: 100%;
  font-family: "Inter", sans-serif;
  color: #141c2c;
  box-sizing: border-box;
  overflow-x: hidden; /* prevent horizontal scrolling from transforms / big images */
`;
/* ------------------ HERO SECTION ------------------ */

/* HERO SECTION */
const HeroSection = styled.section`
  background: linear-gradient(135deg, #eddcbf 21%, #caaa93 91%);
  padding: 90px 10%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-family: "Raleway", sans-serif;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -10px;
    right: 500px;
    width: 900px;
    height: 900px;
    background-image: url(${union});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: top left;
    opacity: 0.15;
    z-index: 1;
    pointer-events: none;
  }

  @media (max-width: 980px) {
    padding: 56px 6%;
  }

  /* Mobile / narrow devices: stack hero vertically and center content */
  @media (max-width: 680px) {
    flex-direction: column;
    align-items: center;
    gap: 18px;

    &::before {
      /* shrink decorative motif so it doesn't overflow */
      right: -40%;
      top: -20%;
      width: 420px;
      height: 420px;
      opacity: 0.08;
    }
  }
`;

const HeroLeft = styled.div`
  max-width: 520px;
  flex: 1;
  position: relative;
  z-index: 3;

  @media (max-width: 680px) {
    max-width: 100%;
    width: 100%;
    text-align: center; /* center text on small screens */
    padding: 0 8px;
  }
`;

const Title = styled.h1`
  font-size: 45px;
  font-weight: 800;
  margin-bottom: 18px;
  color: #03182a;
  font-family: "Raleway", sans-serif;

  @media (max-width: 980px) {
    font-size: clamp(28px, 6vw, 40px);
  }

  @media (max-width: 680px) {
    /* slightly smaller and tighter on narrow screens */
    font-size: clamp(22px, 8vw, 34px);
    line-height: 1.05;
  }
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.8;
  font-weight: 600;
  margin-bottom: 30px;
  max-width: 480px;
  color: #1b2735;
  font-family: "Raleway", sans-serif;

  @media (max-width: 980px) {
    max-width: 100%;
  }

  @media (max-width: 680px) {
    margin-left: auto;
    margin-right: auto;
    font-size: 15px;
    line-height: 1.6;
    max-width: 100%;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 18px;
  margin-bottom: 35px;
  font-family: "Raleway", sans-serif;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 680px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled.button`
  background: #cfa98f;
  color: white;
  border: none;
  padding: 13px 30px;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover {
    background: #b58f78;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: rgba(19, 32, 42, 0.7);
  border: 2px solid rgba(19, 32, 42, 0.15);
  padding: 11px 26px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover {
    border-color: rgba(19, 32, 42, 0.35);
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 40px;
  margin-top: 20px;

  @media (max-width: 980px) {
    gap: 28px;
  }

  /* FIX mobile alignment */
  @media (max-width: 680px) {
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
  }
`;
;


const StatColumn = styled.div`
  text-align: center; /* CENTER text on all mobile */

  h3 {
    font-size: 45px;
    font-weight: 700;
    color: #03182a;
    font-family: "Raleway", sans-serif;

    @media (max-width: 980px) {
      font-size: 34px;
    }

    /* FIX spacing below heading on mobile */
    @media (max-width: 680px) {
      font-size: 32px;
      margin-bottom: 4px;
    }
  }

  p {
    font-size: 20px;
    margin-top: 5px;
    color: #141c2c;
    font-family: "Raleway", sans-serif;

    @media (max-width: 980px) {
      font-size: 16px;
    }

    /* FIX mobile spacing */
    @media (max-width: 680px) {
      margin-top: 0px;
      font-size: 15px;
      line-height: 1.4;
    }
  }
`;


/* HERO RIGHT (logo/image) */
const HeroRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 3;

  @media (max-width: 680px) {
    margin-top: 0;
    order: 2; /* ensure image appears after text if stacking */
    width: 100%;
  }
`;

const Logo = styled.img`
  width: 360px;
  max-width: 100%;
  object-fit: contain;

  @media (max-width: 980px) {
    width: 260px;
  }

  @media (max-width: 680px) {
    width: 220px; /* smaller on phones */
    margin: 6px auto 0;
    display: block;
  }
`;

/* GUIDANCE IMAGE */
const GuidanceFull = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 98px;
`;

const GuidanceImg = styled.img`
  width: 100%;
  max-width: 1250px;
  display: block;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);

  @media (max-width: 980px) {
    max-width: 100%;
    margin: 0 12px;
  }

  @media (max-width: 480px) {
    margin: 0 14px;
    border-radius: 6px;
  }
`;

/* SECTION / CARDS */
const SectionWrapper = styled.section`
  background: #ffffff;
  padding: 90px 10%;
  margin-top: 10rem;
  margin-bottom: 8rem;

  @media (max-width: 980px) {
    padding: 56px 6%;
    margin-top: 6rem;
  }

  @media (max-width: 680px) {
    padding: 40px 6%;
    margin-top: 4.5rem;
    margin-bottom: 4rem;
  }
`;

const CardRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px;
  justify-items: center;
  align-items: stretch;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    gap: 36px;
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 24px;
    justify-items: center;
    padding-bottom: 8px;
  }
`;

/* Card: keep desktop sizing, but allow safe max-width on small screens */
const Card = styled.div`
  background: #ba8d6c;
  width: 35rem; /* desktop design preserved */
  padding: 65px 60px;
  border-radius: 22px;
  box-sizing: border-box;
  min-height: 320px; /* ensures both cards visually tall and equal */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  h2 {
    font-size: 33px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #ffffff;
    font-family: "Raleway", sans-serif;
  }

  p {
    font-size: 17px;
    line-height: 1.7;
    color: #ffffff;
    opacity: 0.92;
    max-width: 85%;
    font-family: "Inter", sans-serif;
  }

  @media (max-width: 1024px) {
    padding: 48px 44px;
    min-height: 300px;
  }

  /* On narrow/mobile: make card width fluid but limit to a comfortable max so it looks similar */
  @media (max-width: 680px) {
    width: 100%;
    max-width: 520px; /* keeps a similar card feel but prevents overflow */
    padding: 36px 28px;
    min-height: 260px;
    border-radius: 18px;

    h2 { font-size: 26px; }
    p { font-size: 15px; max-width: 100%; }
  }
`;
/* ------------------ FOOTER PARTS (page composition) ------------------ */

export default function About() {
  return (
    <AboutWrapper>
      {/* HERO */}
      <HeroSection>
        <HeroLeft>
          <Title>About Shaadi Undo</Title>

          <Description>
            The Knowledge Centre is your personal library of everything you need
            to know about ending a marriage. From legal rights to emotional
            recovery, explore expert-led content, real stories, and actionable
            insights—all in one place.
          </Description>

          <ButtonRow>
            <PrimaryButton>Get Started →</PrimaryButton>
            <SecondaryButton>Contact us</SecondaryButton>
          </ButtonRow>

          <StatsRow>
            <StatColumn>
              <h3>25</h3>
              <p>Years of Experience</p>
            </StatColumn>

            <StatColumn>
              <h3>4K+</h3>
              <p>Happy Clients Trust Our Services</p>
            </StatColumn>

            <StatColumn>
              <h3>50+</h3>
              <p>Marriage Consultants</p>
            </StatColumn>
          </StatsRow>
        </HeroLeft>

        <HeroRight>
          <Logo src={logo} alt="ShaadiUndo logo" />
        </HeroRight>
      </HeroSection>

      <GuidanceFull>
        <GuidanceImg src={FullGuidanceImg} alt="Guided Divorce Care" />
      </GuidanceFull>

      {/* VISION & MISSION */}
      <SectionWrapper>
        <CardRow>
          <Card style={{ backgroundColor: "#CAAA93" }}>
            <h2>Our Vision</h2>
            <p>
              The Knowledge Centre is your personal library of everything you
              need to know about ending a marriage, from legal rights to
              emotional recovery.
            </p>
          </Card>

          <Card>
            <h2>Our Mission</h2>
            <p>
              The Knowledge Centre is your personal library of everything you
              need to know about ending a marriage, from legal rights to
              emotional recovery.
            </p>
          </Card>
        </CardRow>
      </SectionWrapper>

      <BookingCategories />
      <KnowledgeCentre />
      <br />
      <br />
      <br />
      <SuccessfulStories />
    </AboutWrapper>
  );
}
