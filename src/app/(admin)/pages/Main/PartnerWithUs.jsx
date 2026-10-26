// LatestNews.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import cardImg from "@/assets/images/Rectangle 58.png";
import BookingCategories from "./homeComponents/BookingCategories";
import { fetchLiveNews } from "./homeComponents/newsService";

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
  margin: -40px auto 60px;
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
`;

const SectionTitle = styled.h2`
  font-family: "Raleway", serif;
  font-size: 24px;
  color: #0f1720;
  margin: 0;
  font-weight: 800;
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
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(9,10,12,0.08);
  }
`;

const CardImageWrap = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  background-image: url(${props => props.bg || cardImg});
  background-size: cover;
  background-position: center;
  background-color: #f0f0f0;
`;

const CategoryPill = styled.span`
  position: absolute;
  top: 10px;
  left: 12px;
  background: #ba8d6c;
  color: #fff;
  font-weight: 700;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const CardBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  font-weight: 700;
  color: #0f0f0f;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  a {
    text-decoration: none;
    color: inherit;
    &:hover {
      color: #ba8d6c;
    }
  }
`;

const CardExcerpt = styled.p`
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
`;

const ReadMoreLink = styled.a`
  color: #ba8d6c;
  font-weight: 600;
  text-decoration: none;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
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
  color: ${props => props.active ? "#ba8d6c" : "#5c5c5c"};
  font-weight: ${props => props.active ? "700" : "400"};
  font-size: 15px;
  cursor: pointer;
  display:flex;
  align-items:center;
  gap:10px;
  transition: all 0.2s;

  &:before{
    content: "➔";
    color: #b57d4d;
    font-weight:800;
    margin-right:4px;
    opacity: ${props => props.active ? "1" : "0.5"};
  }
  
  &:hover {
    color: #ba8d6c;
  }
`;

const LoadMoreButton = styled.button`
  background: #fff;
  border: 2px solid #CAAA93;
  color: #CAAA93;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  align-self: center;
  margin-top: 30px;
  
  &:hover {
    background: #CAAA93;
    color: #fff;
  }
`;

const NEWS_CATEGORIES = [
  "All",
  "Divorce",
  "Relationship",
  "Court Judgment",
  "Alimony",
  "Child Custody",
  "Dowry",
  "Annulment",
  "Separation"
];

const LatestNews = () => {
  const [liveNews, setLiveNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination State
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  // Fetch Live News
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLiveNews()
      .then(news => {
        if (mounted) {
          setLiveNews(news);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError("Failed to load news.");
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  // Filter Logic
  const filteredNews = liveNews.filter(item => {
    if (activeCategory === "All") return true;
    const text = (item.title + " " + item.excerpt).toLowerCase();
    const cat = activeCategory.toLowerCase();

    // Map specialized categories if needed
    if (cat === "court judgment") return text.includes("court") || text.includes("judgment");

    return text.includes(cat);
  });

  const visibleNews = filteredNews.slice(0, visibleCount);
  const showLoadMore = visibleCount < filteredNews.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setVisibleCount(6); // Reset pagination on filter change
  };


  if (loading) {
    return (
      <PageWrapper>
        <HeroSection>
          <HeroInner>
            <HeroKicker>Knowledge Center</HeroKicker>
            <HeroTitle>News Clippings</HeroTitle>
            <HeroDesc>Loading articles…</HeroDesc>
          </HeroInner>
        </HeroSection>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <HeroSection>
          <HeroInner>
            <HeroKicker>Knowledge Center</HeroKicker>
            <HeroTitle>News Clippings</HeroTitle>
            <HeroDesc style={{ color: "red" }}>{error}</HeroDesc>
          </HeroInner>
        </HeroSection>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <HeroSection>
        <HeroInner>
          <HeroKicker>Knowledge Center</HeroKicker>
          <HeroTitle>News Clippings</HeroTitle>
          <HeroDesc>
            Stay updated with the latest news on divorce, relationship disputes, and family law.
            <br />Featuring curated articles from top sources like The Hindu, Indian Express, and BBC.
          </HeroDesc>
          <HeroCTA href="#latest-news">Latest Updates →</HeroCTA>
        </HeroInner>
      </HeroSection>

      <ContentWrapper id="latest-news">
        <ArticlesColumn>

          <SectionHeader>
            <SectionTitle>Latest News ({activeCategory})</SectionTitle>
          </SectionHeader>

          <ArticlesGrid>
            {visibleNews.map((news) => (
              <ArticleCard key={news.id}>
                <CardImageWrap bg={news.image}>
                  <CategoryPill>{news.source}</CategoryPill>
                </CardImageWrap>
                <CardBody>
                  <CardTitle>
                    <a href={news.link} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: news.title }} />
                  </CardTitle>
                  <CardExcerpt dangerouslySetInnerHTML={{ __html: news.excerpt }} />
                  <CardFooter>
                    <span>{new Date(news.date).toLocaleDateString()}</span>
                    <ReadMoreLink href={news.link} target="_blank" rel="noopener noreferrer">
                      Read Full Story →
                    </ReadMoreLink>
                  </CardFooter>
                </CardBody>
              </ArticleCard>
            ))}
            {visibleNews.length === 0 && <p>No news found for this topic.</p>}
          </ArticlesGrid>

          {showLoadMore && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LoadMoreButton onClick={handleLoadMore}>Show More</LoadMoreButton>
            </div>
          )}

          <GridFooterSpacer />
        </ArticlesColumn>

        <Sidebar>
          <SidebarCard>
            <SidebarTitle>Topics</SidebarTitle>
            <SidebarList>
              {NEWS_CATEGORIES.map(cat => (
                <SidebarItem
                  key={cat}
                  active={activeCategory === cat ? 1 : 0}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </SidebarItem>
              ))}
            </SidebarList>
          </SidebarCard>

          {/* Removed "Explore More" section as requested */}

        </Sidebar>
      </ContentWrapper>

      <BookingCategories />
    </PageWrapper>
  );
};

export default LatestNews;
