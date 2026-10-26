// LatestNews.jsx
import React from "react";
import styled from "styled-components";

import cardImg from "@/assets/images/Rectangle 58.png"; 
import BookingCategories from "./homeComponents/BookingCategories";


const PageWrapper = styled.div`
  font-family: "Poppins", sans-serif;
  background-color: #faf7f7;
  color: #222;
`;


const HeroSection = styled.section`
  width: 100%;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f5e9dd 0%, #ead8c8 45%, #ecd7c9 100%);
  position: relative;
  padding: 56px 20px;
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.03);
`;

const HeroInner = styled.div`
  text-align: center;
  max-width: 980px;
  padding: 0 20px;
`;

const HeroKicker = styled.p`
  color: #7a5b44;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 10px;
`;

const HeroTitle = styled.h1`
  margin: 0 auto 14px;
  font-family: "Raleway", serif;
  color: #0f1720;
  font-weight: 900;
  font-size: 45px;
  line-height: 1.05;

  @media (max-width: 720px) {
    font-size: 26px;
  }
`;

const HeroDesc = styled.p`
  color: #4b4b4b;
  max-width: 780px;
  margin: 0 auto 20px;
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  line-height: 1.55;
`;

const HeroCTA = styled.a`
  display: inline-block;
  background: linear-gradient(90deg, #CAAA93 100%);
  color: #fff;
  padding: 10px 22px;
  border-radius: 28px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 18px rgba(185,124,70,0.12);
`;



const ContentWrapper = styled.main`
  max-width: 1200px;
  margin: -40px auto 60px; /* tuck under hero */
  margin-top: 80px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    margin-top: 18px;
  }
`;



const ArticlesColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;



const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;



const ArticleCard = styled.article`
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(16, 16, 16, 0.06);
  box-shadow: 0 6px 18px rgba(9,10,12,0.04);
  display: flex;
  flex-direction: column;
`;



const CardImageWrap = styled.div`
  position: relative;
  width: 100%;
  height: 140px;
  background-image: url(${cardImg});
  background-size: cover;
  background-position: center;
`;



const CategoryPill = styled.span`
  position: absolute;
  top: 10px;
  left: 12px;
  background: #ba8d6c; /* biscuit color like image */
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(186,141,108,0.12);
`;



const CardBody = styled.div`
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
  font-weight: 800;
  color: #0f0f0f;
`;

const CardExcerpt = styled.p`
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
`;



const GridFooterSpacer = styled.div`
  height: 2px;
`;



const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 250px;
`;

const SidebarCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(9,10,12,0.04);
  border: 1px solid rgba(0,0,0,0.04);
`;

const SidebarTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 800;
  color: #101010;
  border-bottom: 3px solid #f0e0d7;
  padding-bottom: 8px;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SidebarItem = styled.li`
  color: #5c5c5c;
  font-size: 15px;
  cursor: pointer;
  display:flex;
  align-items:center;
  gap:10px;

  &:before{
    content: "➔";
    color: #b57d4d;
    font-weight:800;
    margin-right:4px;
  }
`;



const ShareRow = styled.div`
  display:flex;
  gap:12px;
  align-items:center;
  justify-content:flex-end;
  margin-bottom: 10px;
`;

const ShareLabel = styled.span`
  color: #b88e70;
  font-weight:700;
  font-size:14px;
  margin-right:8px;
`;

const ShareCircle = styled.button`
  width:44px;
  height:44px;
  border-radius:50%;
  background:#b88e70;
  border:none;
  color:#fff;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
`;

/* ---------- Sample data (12 cards) ---------- */
const sampleArticles = new Array(12).fill(0).map((_, i) => ({
  id: i + 1,
  title: "Will the surge in divorces and single living reshape Indian",
  excerpt:
    "The meaning of relationship, marriage, and children is now up for debate. But do you think these changes could have an impact, whether positive or negative, on society…",
  category: "Divorce",
}));



const PeculiarCases = () => {
  return (
    <PageWrapper>
      <HeroSection>
        <HeroInner>
          <HeroKicker>Knowledge Center</HeroKicker>
          <HeroTitle>Peculiar Cases</HeroTitle>
          <HeroDesc>
           The Knowledge Centre is your personal library of everything you 
            <br/>need to know about ending a marriage, from legal rights to 
            <br/>emotional recovery. Explore expert-led content, real stories, and 
            <br/>actionable insights, all in one place.
          </HeroDesc>
          <HeroCTA href="#get-started">Get Started →</HeroCTA>
        </HeroInner>
      </HeroSection>

      <ContentWrapper>
        <ArticlesColumn>
          <ArticlesGrid>
            {sampleArticles.map((a) => (
              <ArticleCard key={a.id}>
                <CardImageWrap>
                  <CategoryPill>{a.category}</CategoryPill>
                </CardImageWrap>
                <CardBody>
                  <CardTitle>{a.title}</CardTitle>
                  <CardExcerpt>{a.excerpt}</CardExcerpt>
                </CardBody>
              </ArticleCard>
            ))}
          </ArticlesGrid>

          <GridFooterSpacer />
        </ArticlesColumn>

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
              <SidebarItem>Latest News</SidebarItem>
              <SidebarItem>Courses</SidebarItem>
              <SidebarItem>News Clippings</SidebarItem>
              <SidebarItem>Videos</SidebarItem>
              <SidebarItem>Family Laws</SidebarItem>
            </SidebarList>
          </SidebarCard>
        </Sidebar>
      </ContentWrapper>

   
      <BookingCategories />
    </PageWrapper>
  );
};

export default PeculiarCases;
