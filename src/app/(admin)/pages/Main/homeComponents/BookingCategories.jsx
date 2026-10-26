// BookingCategories.jsx
import React from "react";
import styled from "styled-components";

import lawyerImg from "@/assets/images/lawyer.png";
import therapistImg from "@/assets/images/therapits.png";
import mediatorImg from "@/assets/images/mediators.png";
import counsellorImg from "@/assets/images/counsellor.png";

const BookingSection = styled.section`
  padding: 56px 36px;
  max-width: 1200px;
  margin: 0 auto 40px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const BookingInner = styled.div`
  text-align: center;
  margin-bottom: 28px;
`;

const BookingTitle = styled.h2`
  font-family: "Raleway", sans-serif;
  font-size: 44px;
  font-weight: 800;
  margin: 8px 0 6px;
  color: var(--text, #0f1724);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 980px) {
    font-size: clamp(28px, 6.5vw, 44px);
    white-space: normal;
  }
`;

const BookingSubtitle = styled.p`
  font-size: 18px;
  color: rgba(15, 23, 36, 0.72);
  margin-bottom: 28px;
`;

/* Grid:
   - 2 columns on desktop/tablet
   - 1 column on mobile
   - symmetric horizontal padding on mobile so left/right gaps are equal
*/
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* two columns on larger screens */
  gap: 22px;

  @media (max-width: 980px) {
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* one card per row on mobile */
    padding: 0 16px; /* symmetric padding left/right */
    justify-items: center; /* center cards inside the single column grid */
    gap: 18px;
  }

  @media (max-width: 480px) {
    gap: 14px;
    padding: 0 14px;
  }
`;

/* Card keeps the desktop row layout at all sizes.
   Add symmetric internal horizontal padding and a sensible max-width
   so on small screens left/right visual gaps are equal and the card
   doesn't get overly narrow.
*/
const Card = styled.div`
  display: flex;
  align-items: center;
  border-radius: 20px;
  overflow: visible;
  background: linear-gradient(180deg, #f6f1e6 70%, #caaa93 100%);
  border: 1px solid rgba(15, 23, 36, 0.12);
  min-height: 140px;
  box-shadow: 0 8px 24px rgba(11, 16, 20, 0.04);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;

  /* keep horizontal layout always */
  flex-direction: row;

  /* card width behavior */
  width: 100%;
  max-width: 920px; /* keeps proportions similar to desktop when centered on mobile */
  box-sizing: border-box;

  /* symmetric internal padding (left/right) to balance spaces */
  padding: 18px 18px;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 60px rgba(15, 23, 36, 0.18);
    border-color: rgba(15, 23, 36, 0.28);
  }

  /* On very small screens we keep the horizontal layout but slightly reduce paddings */
  @media (max-width: 480px) {
    padding: 14px 14px;
  }
`;

const CardContent = styled.div`
  flex: 1 1 54%;
  padding: 6px 12px;
  text-align: left;
  min-width: 0; /* important to prevent overflow in flex children */
`;

const CardHeading = styled.h3`
  font-size: 24px;
  margin: 0 0 10px;
  font-weight: 800;
  color: #0f1724;
`;

const CardDesc = styled.p`
  margin: 0 0 18px;
  color: rgba(15, 23, 36, 0.75);
  font-size: 16px;
  line-height: 1.45;
`;

const BookNow = styled.a`
  display: inline-block;
  background: #0f1724;
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.02em;
  box-shadow: 0 10px 24px rgba(15, 23, 36, 0.08);
  cursor: pointer;
`;

/* Keep the image area sized like desktop (46% of card)
   but allow the min-width to shrink a bit on small screens to avoid overflow */
const CardImageWrap = styled.div`
  width: 46%;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 14px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    min-width: 120px; /* slightly smaller on tiny phones */
    padding-top: 8px;
  }
`;

const CardImage = styled.img`
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  object-position: center;
  border-radius: 10px;
  transition: transform 0.28s ease;

  ${Card}:hover & {
    transform: scale(1.02);
  }

  @media (max-width: 480px) {
    max-height: 140px;
  }
`;

const defaultCards = [
  {
    title: "Lawyer",
    desc: "Family law, divorce, custody, maintenance, etc.",
    img: lawyerImg,
    href: "lawyer-list",
  },
  {
    title: "Therapist",
    desc: "Individual therapy, couple therapy, child therapy.",
    img: therapistImg,
    href: "therapist-list",
  },
  {
    title: "Mediators",
    desc: "Conflict resolution specialists.",
    img: mediatorImg,
    href: "mediator-list",
  },
  {
    title: "Counsellors",
    desc: "Mental health, emotional wellbeing, coping strategies.",
    img: counsellorImg,
    href: "counsellor-list",
  },
];

export default function BookingCategories({
  cards = defaultCards,
  title = "Book Online Consultation",
  subtitle = "When Relationships Get Tough — We're Here to Guide You.",
}) {
  return (
    <BookingSection id="book-categories">
      <BookingInner>
        <BookingTitle>{title}</BookingTitle>
        <BookingSubtitle>{subtitle}</BookingSubtitle>

        <Grid>
          {cards.map((c) => (
            <Card key={c.title}>
              <CardContent>
                <CardHeading>{c.title}</CardHeading>
                <CardDesc>{c.desc}</CardDesc>
                <BookNow href={c.href}>{c.cta || "BOOK ONLINE"}</BookNow>
              </CardContent>

              <CardImageWrap>
                <CardImage src={c.img} alt={c.title} loading="lazy" />
              </CardImageWrap>
            </Card>
          ))}
        </Grid>
      </BookingInner>
    </BookingSection>
  );
}
