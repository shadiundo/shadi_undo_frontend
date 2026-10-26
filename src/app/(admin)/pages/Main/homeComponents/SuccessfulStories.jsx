import React from "react";
import styled from "styled-components";

/* ---------- Colors (single source of truth) ---------- */
const COLORS = {
  star: "#FFB47F",
  dark: "#03182A",
  black: "#000000",
  cream: "#EDD4C2",
  badge: "#AC5B21",
  frame: "#BA8D6C",
  soft: "#F1E8E2",
  veryLight: "#FAF9F6",
  white: "#FFFFFF",
};

/* helper to convert hex to rgba with alpha for inset/soft shadows */
function hexToRgba(hex, alpha = 1) {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function SuccessfulStories({
  testimonial = {
    quote:
      "I was provided the guidance and support I needed in a difficult time. I found peace and a fresh start.",
    author: "Anjali S.",
    stars: 5,
  },
  heading =
    "A TEAM OF GREAT CONSULTANTS AND LAWYERS WITH 25+ YEARS OF EXPERIENCE",
  stats = [
    { label: "", value: "100%" },
    { label: "", value: "4,532+" },
  ],
  badge = "Testimonials",
}) {
  return (
    <Wrap>
      <TopTitle role="heading" aria-level="2">
        SUCCESSFUL STORIES
      </TopTitle>

      <CurvedBg>
        <Inner>
          <Left>
            <Frame>
              <FrameInner>
                <TopStars aria-hidden>{renderStars(testimonial.stars)}</TopStars>

                <Quote>{testimonial.quote}</Quote>

                <AuthorRow>
                  <Author>{testimonial.author}</Author>
                  <QuoteMark aria-hidden>“”</QuoteMark>
                </AuthorRow>
              </FrameInner>
            </Frame>
          </Left>

          <Right>
            <Badge>{badge}</Badge>
            <MainHeading>{heading}</MainHeading>

            <StarsAndStats>
              <StarsBlock>
                <SmallStars aria-hidden>{renderStars(5)}</SmallStars>
                <StatValue>{stats[0].value}</StatValue>
              </StarsBlock>

              <StarsBlock>
                <SmallStars aria-hidden>{renderStars(5)}</SmallStars>
                <StatValue>{stats[1].value}</StatValue>
              </StarsBlock>
            </StarsAndStats>
          </Right>
        </Inner>
      </CurvedBg>
    </Wrap>
  );
}

/* ---------- helper: render stars ---------- */
function renderStars(count = 5) {
  const arr = [];
  const filled = Math.max(0, Math.min(5, Math.round(count)));
  for (let i = 0; i < filled; i++) {
    arr.push(
      <svg
        key={i}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill={COLORS.star}
        aria-hidden
      >
        <path d="M12 .587l3.668 7.431L23.5 9.75l-5.75 5.6L19.5 24 12 19.897 4.5 24l1.75-8.65L.5 9.75l7.832-1.732z" />
      </svg>
    );
  }
  return arr;
}

/* -------------------- styles -------------------- */

const Wrap = styled.section`
  width: 100%;
  box-sizing: border-box;
  background: ${COLORS.white};
  /* ensure this section creates its own stacking context */
  position: relative;
  z-index: 0;
  margin-bottom:5rem;
`;

const TopTitle = styled.h2`
  font-family: 'Raleway', sans-serif;
  font-weight: 900;
  font-size: 34px;
  text-align: center;
  color: ${COLORS.dark};
  padding: 28px 20px 12px;
  letter-spacing: 1px;

  position: relative;
  z-index: 40; /* sit above other page elements */
  margin-top: 12px; /* gentle offset to avoid overlap */
  margin-bottom:3rem;

  @media (max-width: 980px) {
    font-size: 28px;
    padding-top: 20px;
    margin-top: 6px;
  }
`;

const CurvedBg = styled.div`
  background: linear-gradient(180deg, ${COLORS.soft} 0%, ${COLORS.cream} 100%);
  position: relative;
  
  padding: 64px 20px 80px; /* increased top padding to keep content below any overlap */

  /* subtle curved top using radial gradient overlay, moved further up so it doesn't cover title */
  &:before {
    content: "";
    position: absolute;
    left: 10px;
    right: 0;
    top: -56px;
    height: 115px;
    background: radial-gradient(
      1000px 120px at 50% 0%,
      rgba(255,255,255,1),
      rgba(255,255,255,1) 36%,
      rgba(255,255,255,0) 100%
    );
    pointer-events: none;
    z-index: 2;
  }

  @media (max-width: 980px) {
    padding: 48px 16px 56px;
  }

  @media (max-width: 640px) {
    padding: 32px 12px 36px;
    &:before { top: -48px; height: 96px; }
  }
`;

/* centered inner container controlling columns */
const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 520px 1fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 3; /* ensure content sits above the curved overlay */

  @media (max-width: 1100px) {
    grid-template-columns: 440px 1fr;
    gap: 28px;
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

/* left framed testimonial */
const Left = styled.div`
  display: flex;
  justify-content: center;
`;

const Frame = styled.div`
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  padding: 22px;
  border-radius: 18px;
  display: flex;
  justify-content: center;
`;

/* thick outer frame */
const FrameInner = styled.div`
  width: 100%;
  background: ${COLORS.white};
  border-radius: 12px;
  padding: 28px 28px 42px 28px;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 12px 30px ${hexToRgba(COLORS.black, 0.06)};

  /* thick outer border look (now solid with exact color #BA8D6C) */
  &:after {
    content: "";
    position: absolute;
    left: -18px;
    top: -18px;
    right: -18px;
    bottom: -18px;
    border-radius: 18px;
    border: 14px solid ${COLORS.frame}; /* EXACT #BA8D6C */
    pointer-events: none;
  }
`;

/* top stars in testimonial */
const TopStars = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  /* svg color is set via renderStars fill, keep fallback */
  svg { color: ${COLORS.star}; }
`;

/* quote text */
const Quote = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: ${COLORS.black === "#000000" ? "#111827" : COLORS.black};
  margin: 6px 0 28px;
  max-width: 420px;

  @media (max-width: 820px) {
    font-size: 16px;
  }
`;

/* author and quote mark row */
const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top:3rem;
`;

const Author = styled.div`
  font-weight: 800;
  color: ${COLORS.black === "#000000" ? "#111827" : COLORS.black};
  font-size: 16px;
`;

/* stylized quote mark bottom-right */
const QuoteMark = styled.div`
  font-size: 56px;
  color: ${hexToRgba(COLORS.frame, 0.12)};
  line-height: 1;
  transform: translateY(6px);
`;

/* right side */
const Right = styled.div`
  padding: 6px 6px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: 820px) {
    padding: 0 6px;
  }
`;

/* small rounded badge */
const Badge = styled.div`
  display: inline-block;
  background: ${COLORS.badge};
  color: ${COLORS.white};
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  width: fit-content;
`;

/* big uppercase heading on right */
const MainHeading = styled.h3`
  margin: 0;
  font-family: 'Raleway', sans-serif;
  font-weight: 900;
  color: ${COLORS.dark};
  font-size: 32px;
  line-height: 1.02;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  max-width: 560px;

  @media (max-width: 1100px) {
    font-size: 28px;
  }
  @media (max-width: 820px) {
    font-size: 22px;
    text-align: left;
  }
`;

/* row containing two stats blocks */
const StarsAndStats = styled.div`
  display: flex;
  gap: 60px;
  align-items: flex-end;
  margin-top: 10px;

  @media (max-width: 1100px) {
    gap: 40px;
  }

  @media (max-width: 820px) {
    gap: 28px;
    flex-wrap: wrap;
  }
`;

const StarsBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

/* small star row above stat */
const SmallStars = styled.div`
  display: flex;
  gap: 8px;

  svg { color: ${COLORS.star}; width: 18px; height: 18px; }
`;

const StatValue = styled.div`
  font-weight: 900;
  color: ${COLORS.dark};
  font-size: 28px;
  letter-spacing: 0.3px;
`;
