// src/components/KnowledgeCentre.jsx
import React from "react";
import styled from "styled-components";

import articles from "@/assets/images/Article.png";
import news from "@/assets/images/Newspaper.png";
import cases from "@/assets/images/Cases.png";
import flag from "@/assets/images/Flag.png";

import { Link } from "react-router-dom";

export default function KnowledgeCentre() {
  return (
    <Section>
      <Inner>
        {/* LEFT SIDE TEXT */}
        <Left>
          <Title>KNOWLEDGE CENTRE</Title>

          <Desc>
            The Knowledge Centre is your personal library of everything you need to
            know about ending a marriage, from legal rights to emotional recovery.
            Explore expert-led content, real stories, and actionable insights, all
            in one place.
          </Desc>

          <CTA as={Link} to="/services">
            <span>Go to Knowledge Centre</span>
            <Chevron viewBox="0 0 24 24" aria-hidden>
              <path
                d="M13.5 6.5L12.09 7.91 15.17 11H4v2h11.17l-3.08 3.09L13.5 18.5 19 13z"
                fill="currentColor"
              />
            </Chevron>
          </CTA>
        </Left>

        {/* RIGHT CARDS GRID */}
        <Right aria-label="Knowledge cards">
          <Link to="/services">
            <CardLarge area="a" data-area="a">
              <IconOutline>
                <IconImg src={articles} alt="Articles" />
              </IconOutline>
              <CardTitleLarge>
                Read The Latest
                <br />
                Articles
              </CardTitleLarge>
            </CardLarge>
          </Link>

          <Link to="/partner-with-us">
            <CardSmall area="b" data-area="b">
              <SmallLeft>
                <IconFilled>
                  <IconImg src={news} alt="News" />
                </IconFilled>
              </SmallLeft>
              <SmallRight>
                <CardTitleSmall>
                  Latest
                  <br />
                  News
                </CardTitleSmall>
              </SmallRight>
            </CardSmall>
          </Link>

          <Link to="/peculiar-cases">
            <CardSmall area="c" data-area="c">
              <SmallLeft>
                <IconFilled>
                  <IconImg src={cases} alt="Cases" />
                </IconFilled>
              </SmallLeft>
              <SmallRight>
                <CardTitleSmall>
                  Peculiar
                  <br />
                  Cases
                </CardTitleSmall>
              </SmallRight>
            </CardSmall>
          </Link>

          <Link to="/services">
            <CardLarge area="d" data-area="d">
              <IconOutline>
                <IconImg src={flag} alt="Flag" />
              </IconOutline>
              <CardTitleLarge>
                Red Flags In
                <br />
                Marriage
              </CardTitleLarge>
            </CardLarge>
          </Link>
        </Right>
      </Inner>
    </Section>
  );
}

/* ============================================================= */
/* =========================  STYLES  =========================== */
/* ============================================================= */

const Section = styled.section`
  width: 100%;
  background: #ffffff;
  padding: 56px 28px;
  box-sizing: border-box;
`;

const Inner = styled.div`
  max-width: 1280px;
  margin: 0 auto;

  display: grid;
  grid-template-columns: 1fr 620px; /* makes right section wider like Figma */
  gap: 48px;
  align-items: center;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr 480px;
    gap: 36px;
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

const Left = styled.div``;

const Title = styled.h2`
  font-family: "Raleway", sans-serif;
  font-weight: 800;
  font-size: clamp(34px, 4vw, 48px);
  color: #0f1724;
  margin: 0 0 18px;
`;

const Desc = styled.p`
  color: rgba(15, 23, 36, 0.75);
  font-size: clamp(15px, 1.4vw, 17px);
  line-height: 1.75;
  max-width: 700px;
  margin: 0 0 28px;
`;

const CTA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  border-radius: 999px;
  background: #d6b39e;
  color: #0f1724;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(15, 23, 36, 0.06);
  transition: 0.16s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 44px rgba(15, 23, 36, 0.1);
  }

  @media (max-width: 820px) {
    width: 100%;
    justify-content: center;
  }
`;

const Chevron = styled.svg`
  width: 18px;
  height: 18px;
`;

/* ======================= RIGHT CLUSTER ======================= */

const Right = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* use equal-height rows so top and bottom rows align perfectly */
  grid-auto-rows: 1fr;
  grid-template-areas:
    "a b"
    "c d";
  gap: 20px;
  align-items: center; /* center items within each row */

  @media (max-width: 1180px) {
    grid-auto-rows: 1fr;
    gap: 16px;
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "a"
      "b"
      "c"
      "d";
  }
`;

const CardBase = styled.div`
  box-sizing: border-box;
  display: flex;
  gap: 20px;
  transition: 0.16s ease;
`;

const OUTLINE_COLOR = "rgba(75, 51, 35, 0.22)";

/* ======================= LARGE CARDS ======================= */

const CardLarge = styled(CardBase)`
  grid-area: ${(p) => p.area};
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  min-height: 220px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 3px solid ${OUTLINE_COLOR};
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.06);
  color: #5b3f2f;

  /* keep both large cards vertically centered inside their row */
  align-self: center;

  @media (max-width: 1180px) {
    padding: 22px;
    min-height: 190px;
  }

  @media (max-width: 820px) {
    flex-direction: row;
    text-align: left;
    padding: 16px;
    min-height: 110px;
  }
`;

/* ======================= SMALL CARDS ======================= */

const CardSmall = styled(CardBase)`
  grid-area: ${(p) => p.area};
  background: linear-gradient(180deg, #f0e2cc 0%, #ead3b8 100%);
  border-radius: 16px;
  padding: 16px 18px;
  min-height: 120px;
  color: #5a3f2d;
  border: 1px solid rgba(75, 51, 35, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);

  /* vertically center small cards too */
  align-self: center;

  @media (max-width: 1180px) {
    min-height: 100px;
  }

  @media (max-width: 820px) {
    min-height: 92px;
    padding: 12px;
  }
`;

const SmallLeft = styled.div`
  width: 88px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 1180px) {
    width: 72px;
  }

  @media (max-width: 820px) {
    width: 56px;
  }
`;

const SmallRight = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const IconOutline = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(75, 51, 35, 0.06);

  @media (max-width: 1180px) {
    width: 72px;
    height: 72px;
  }

  @media (max-width: 820px) {
    width: 56px;
    height: 56px;
  }
`;

const IconFilled = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(75, 51, 35, 0.08);

  @media (max-width: 1180px) {
    width: 48px;
    height: 48px;
  }

  @media (max-width: 820px) {
    width: 44px;
    height: 44px;
  }
`;

const IconImg = styled.img`
  width: 68%;
  height: 68%;
  object-fit: contain;
`;

const CardTitleLarge = styled.h3`
  margin: 12px 0 0;
  font-weight: 800;
  font-size: 20px;
  color: #5b3f2f;
  line-height: 1.05;
`;

const CardTitleSmall = styled.h4`
  margin: 0;
  font-weight: 800;
  font-size: 18px;
  color: #5b3f2f;
  line-height: 1.1;
`;
