// LatestArticles.jsx
import React from "react";
import styled from "styled-components";
import img from '@/assets/images/Rectangle 55.png'
import img2 from '@/assets/images/Rectangle 58.png'
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaPinterestP,
} from "react-icons/fa";
import BookingCategories from "./homeComponents/BookingCategories";

/* ------------------ KEEP ALL OF THESE UNCHANGED (hero and imports) ------------------ */

const PageWrapper = styled.div`
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f5f5f7;
  color: #333;
`;

const HeroSection = styled.section`
  position: relative;
  width: 100%;
  height: 350px;
  background-image: ${({ bg }) =>
    bg ? `url(${bg})` : "url('https://via.placeholder.com/1600x500')"};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
`;

const HeroContent = styled.div`
  position: relative;
  text-align: center;
  color: #fff;
  max-width: 820px;
  padding: 0 1.5rem;
`;

const HeroLabel = styled.div`
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.6rem;
  opacity: 0.85;
`;

const HeroTitle = styled.h1`
  font-size: 1.8rem;
  line-height: 1.4;
  font-weight: 900;
  color:#FFF;

  @media (min-width: 768px) {
    font-size: 2.1rem;
  }
`;

/* ------------------ START: ONLY CHANGED/ADDED AFTER HERO ------------------ */

/* Page content wrapper (keeps article/sidebar area intact for context) */
const ContentWrapper = styled.main`
  max-width: 1720px;
  margin: -48px auto 40px;   /* keeps content tucked under hero */
  margin-top:3rem;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 360px;
  grid-gap: 36px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    padding: 0 24px;
    margin-top: 2.5rem;
  }
`;

/* Article body card (unchanged visual) */
const ArticleBody = styled.article`
  background-color: #ffffff;
  padding: 40px 48px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(9, 10, 12, 0.06);
  font-size: 16px;
  line-height: 1.9;
  color: #222;
  font-family: 'Poppins', sans-serif;

  p {
    margin: 0 0 22px 0;
    font-weight: 400;
    color: #222;
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

/* Sidebar kept for context (unchanged) */
const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 250px;
`;

const SidebarCard = styled.div`
  background-color: #ffffff;
  padding: 22px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(9, 10, 12, 0.04);
`;

const SidebarTitle = styled.h3`
  font-size: 23px;
  margin: 0 0 12px 0;
  font-weight: 800;
  color: #101010;
  padding-bottom: 12px;
  border-bottom: 2px solid #BA8D6C;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 14px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SidebarItem = styled.li`
  font-size: 18px;
  color: #5a5a5a;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: color 0.15s ease, transform 0.12s ease;

  &:before {
    content: '➔';
    color: #BA8D6C;
    font-size: 13px;
    display: inline-block;
    width: 14px;
    margin-left: 0;
  }

  &:hover {
    color: #b76b3e;
    transform: translateX(4px);
  }
`;

/* ------------------ RELATED ARTICLES SECTION ------------------ */

/* Wrapper for the related section so we can position share area on top-right */
const RelatedSectionWrapper = styled.section`
  width: 100%;
  margin: 36px 0 60px;
  box-sizing: border-box;
`;

/* This container matches the page width alignment used for content */
const RelatedContainer = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;

  @media (max-width: 1200px) {
    padding: 0 24px;
  }
`;

/* Improved Share @ area (top-right, as in image) */
const TopShare = styled.div`
  position: absolute;
  right: 0;
  top: -56px; /* sits above the related heading like the Figma */
  display: flex;
  align-items: center;
  gap: 12px;
  color: #B88E70;
  font-weight: 600;

  @media (max-width: 900px) {
    top: -44px;
    right: 0;
  }
`;

/* Circular icon style for top share icons (filled background like image) */
const TopShareIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e9d5c7; /* light warm circle */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
`;

/* Heading centered */
const RelatedHeading = styled.h2`
  text-align: center;
  font-size: 36px;
  margin: 24px 0 28px;
  font-weight: 800;
  color: #0f0f0f;
`;

/* Grid of cards */
const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

/* Single card */
const RelatedCard = styled.article`
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 6px 18px rgba(9,10,12,0.04);
`;

/* Image area (uses existing img) */
const CardImage = styled.div`
  width: 100%;
  height: 150px;
  background-image: url(${img2});
  background-size: cover;
  background-position: center;
`;

/* Card body with internal padding so visual matches */
const CardBody = styled.div`
  padding: 16px 18px 22px 18px;
`;

/* Category pill */
const CategoryPill = styled.span`
  display: inline-block;
  background: #BA8D6C;
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 600;
`;

/* Title */
const CardTitle = styled.h3`
  font-size: 18px;
  margin: 0 0 10px 0;
  line-height: 1.2;
  font-weight: 800;
  color: #101010;
`;

/* Excerpt */
const CardExcerpt = styled.p`
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
`;

/* Share area at bottom (centered on page gutters) */
const BottomShareWrapper = styled.div`
  max-width: 1120px;
  margin: 36px auto 0;
  margin-left:28rem;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ShareLabel = styled.span`
  color: #B88E70;
  font-weight: 700;
  margin-right: 8px;
  font-size:20px;
`;

const CircleIcon = styled.button`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: #B88E70;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  font-size: 23px;
`;

/* ------------------ END: CHANGED AFTER HERO ------------------ */

/* Note: LatestArticles component below keeps hero unchanged and uses new related block */

const LatestArticles = ({ heroBg }) => {
  return (
    <PageWrapper>
      <HeroSection bg={img}>
        <HeroOverlay />
        <HeroContent>
          <HeroLabel>Latest Articles</HeroLabel>
          <HeroTitle>
            Will the surge in divorces and single living
            <br />
            reshape Indian ?
          </HeroTitle>
        </HeroContent>
      </HeroSection>

      {/* main content area (article + sidebar) */}
      <ContentWrapper>
        <ArticleBody>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit
            amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit
            amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit
            amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua.
          </p>
        </ArticleBody>

        <Sidebar>
          <SidebarCard>
            <SidebarTitle>Categories</SidebarTitle>
            <SidebarList>
              <SidebarItem>Marriage Acts</SidebarItem>
              <SidebarItem>Divorce</SidebarItem>
              <SidebarItem>Family Laws</SidebarItem>
              <SidebarItem>Negotiation</SidebarItem>
              <SidebarItem>Family Acts</SidebarItem>
            </SidebarList>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Knowledge Center</SidebarTitle>
            <SidebarList>
              <SidebarItem>Latest Articles</SidebarItem>
              <SidebarItem>News</SidebarItem>
              <SidebarItem>Courses</SidebarItem>
              <SidebarItem>Videos</SidebarItem>
              <SidebarItem>New Rules</SidebarItem>
              <SidebarItem>Family Laws</SidebarItem>
            </SidebarList>
          </SidebarCard>
        </Sidebar>
      </ContentWrapper>

      {/* Related articles section with improved top share */}
      <RelatedSectionWrapper>
        <RelatedContainer>
           <BottomShareWrapper>
        <ShareLabel>Share @</ShareLabel>
        <CircleIcon aria-label="facebook"><FaFacebookF /></CircleIcon>
        <CircleIcon aria-label="twitter"><FaTwitter /></CircleIcon>
        <CircleIcon aria-label="linkedin"><FaLinkedinIn /></CircleIcon>
        <CircleIcon aria-label="pinterest"><FaPinterestP /></CircleIcon>
      </BottomShareWrapper>
<br/>
<br/>
<br/>
          <RelatedHeading>Related Articles</RelatedHeading>

          <RelatedGrid>
            <RelatedCard>
              <CardImage />
              <CardBody>
                <CategoryPill>Divorce</CategoryPill>
                <CardTitle>Will the surge in divorces and single living reshape Indian</CardTitle>
                <CardExcerpt>
                  The meaning of relationships, marriage, and children is now up for debate. But do you think these changes could have an impact, whether positive or negative, on society...
                </CardExcerpt>
              </CardBody>
            </RelatedCard>

            <RelatedCard>
              <CardImage />
              <CardBody>
                <CategoryPill>Divorce</CategoryPill>
                <CardTitle>Will the surge in divorces and single living reshape Indian</CardTitle>
                <CardExcerpt>
                  The meaning of relationships, marriage, and children is now up for debate. But do you think these changes could have an impact, whether positive or negative, on society...
                </CardExcerpt>
              </CardBody>
            </RelatedCard>

            <RelatedCard>
              <CardImage />
              <CardBody>
                <CategoryPill>Divorce</CategoryPill>
                <CardTitle>Will the surge in divorces and single living reshape Indian</CardTitle>
                <CardExcerpt>
                  The meaning of relationships, marriage, and children is now up for debate. But do you think these changes could have an impact, whether positive or negative, on society...
                </CardExcerpt>
              </CardBody>
            </RelatedCard>
          </RelatedGrid>
        </RelatedContainer>
      </RelatedSectionWrapper>

      {/* bottom share that matches page gutters (keeps original bottom share but visually improved) */}
    <BookingCategories/>
    </PageWrapper>
  );
};

export default LatestArticles;
