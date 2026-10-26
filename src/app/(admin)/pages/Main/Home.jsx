import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import heroImage from "@/assets/images/hero_bg_image 1.jpg";
import union from "@/assets/images/Union.png";
import circleBg from "@/assets/images/unsplash_W3Jl3jREpDY.png";
import heartsRow from "@/assets/images/final-divorce-consulation 1.png";
import waveLines from "@/assets/images/supports 1.png";
import heartsRow2 from "@/assets/images/Layer_x0020_1.png";
import waveLines2 from "@/assets/images/settleemnt 1.png";
import avatar1 from "@/assets/images/users/avatar-1.jpg";
import avatar2 from "@/assets/images/users/avatar-2.jpg";
import avatar3 from "@/assets/images/users/avatar-3.jpg";
import avatar4 from "@/assets/images/users/avatar-4.jpg";
import avatar5 from "@/assets/images/users/avatar-5.jpg";
import avatar6 from "@/assets/images/users/avatar-6.jpg";
import avatar7 from "@/assets/images/users/avatar-7.jpg";
import avatar8 from "@/assets/images/users/avatar-8.jpg";
import avatar9 from "@/assets/images/users/avatar-9.jpg";
import avatar10 from "@/assets/images/users/avatar-10.jpg";
import { Link } from "react-router-dom";

// placeholder images for BookingCategories — replace paths later as you said
import lawyerImg from "@/assets/images/lawyer.png";
import therapistImg from "@/assets/images/therapits.png";
import mediatorImg from "@/assets/images/mediators.png";
import counsellorImg from "@/assets/images/counsellor.png";
import KnowledgeCentre from "./homeComponents/KnowledgeCentre";
import SuccessfulStories from "./homeComponents/SuccessfulStories";

/* ----------------- HorizontalProfessionals (full) ----------------- */

function HorizontalProfessionals({ role }) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const containerRef = React.useRef(null);
  const fetchedRef = React.useRef(false); // ensure only fetched once per mount unless you want refetch

  // IntersectionObserver to lazy-fetch when section enters viewport
  React.useEffect(() => {
    if (!containerRef.current) return;
    if (fetchedRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // fetch data when in view
            fetchData();
            obs.disconnect();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    obs.observe(containerRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // fetch function (used by observer and retries)
  const fetchData = React.useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(null);

    if (!BASE_URL) {
      // fallback demo data when env is not present
      const sample = [
        {
          name: "Jyotish Shalini",
          image: avatar2,
          languages: ["English", "Hindi"],
          yearsExperience: 10,
          ratePerMinute: 42,
          rating: 4.93,
          reviewsCount: 14355,
          speciality: "Vedic Astrology",
          isOnline: true,
          role: "lawyer",
        },
        {
          name: "Tarot Aashi",
          image: avatar3,
          languages: ["English", "Hindi"],
          yearsExperience: 5,
          ratePerMinute: 12,
          rating: 4.86,
          reviewsCount: 582,
          speciality: "Tarot Reading",
          isOnline: false,
          role: "counsellor",
        },
        {
          name: "Tarot Rangat",
          image: avatar4,
          languages: ["Hindi", "Sindhi"],
          yearsExperience: 2,
          // no ratePerMinute here to exercise default
          rating: 4.93,
          reviewsCount: 214,
          speciality: "Tarot Reading",
          isOnline: true,
          role: "mediator",
        },
        {
          name: "Astro Ravi",
          image: avatar5,
          languages: ["English"],
          yearsExperience: 7,
          // no rating here to exercise dummy rating
          ratePerMinute: 30,
          reviewsCount: 1120,
          speciality: "Vedic Astrology",
          isOnline: true,
          role: "therapist",
        },
      ];
      // simulate small delay for UX
      setTimeout(() => {
        setData(sample);
        setLoading(false);
      }, 450);
      return;
    }

    const url = `${BASE_URL}/api/professionals/role/${encodeURIComponent(role)}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
      })
      .then((res) => {
        const list = res?.data ?? res?.results ?? res?.professionals ?? res ?? [];
        setData(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("HorizontalProfessionals fetch error:", err);
        setError("Unable to load results");
      })
      .finally(() => setLoading(false));
  }, [BASE_URL, role]);

  // avatar pool to ensure different avatar for each role when image missing
  const avatarPool = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
    avatar10,
  ];

  // role specific avatar groups (4 each)
  const roleAvatarMap = {
    lawyer: [avatar2, avatar3, avatar4, avatar5],
    counsellor: [avatar6, avatar7, avatar8, avatar9],
    mediator: [avatar1, avatar10, avatar3, avatar6],
    therapist: [avatar4, avatar8, avatar2, avatar7],
  };

  // helper: render star icons (full / half / empty)
  const renderStars = (rating) => {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const total = 5;
    const stars = [];

    for (let i = 0; i < full; i++) {
      stars.push(
        <svg key={`f${i}`} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .587l3.668 7.431L23.5 9.75l-5.75 5.6L19.5 24 12 19.897 4.5 24l1.75-8.65L.5 9.75l7.832-1.732z" />
        </svg>
      );
    }
    if (half) {
      const gid = `halfGrad-${Math.random().toString(36).slice(2, 9)}`;
      stars.push(
        <svg key="half" width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <defs>
            <linearGradient id={gid}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M12 .587l3.668 7.431L23.5 9.75l-5.75 5.6L19.5 24 12 19.897 4.5 24l1.75-8.65L.5 9.75l7.832-1.732z"
            fill={`url(#${gid})`}
            stroke="currentColor"
          />
        </svg>
      );
    }
    for (let i = stars.length; i < total; i++) {
      stars.push(
        <svg key={`e${i}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path d="M12 .587l3.668 7.431L23.5 9.75l-5.75 5.6L19.5 24 12 19.897 4.5 24l1.75-8.65L.5 9.75l7.832-1.732z" />
        </svg>
      );
    }
    return <StarRow>{stars}</StarRow>;
  };

  // default rate logic:
  const getRateDisplay = (pro) => {
    if (pro && pro.ratePerMinute) {
      return {
        perMin: Number(pro.ratePerMinute),
        text: `₹${Number(pro.ratePerMinute)}/Min`,
        priceFor30: Math.round(Number(pro.ratePerMinute) * 30),
        priceFor30Text: `₹${Math.round(Number(pro.ratePerMinute) * 30)} / 30 min`,
      };
    }
    const fallback30 = 1100;
    return {
      perMin: Math.ceil(fallback30 / 30),
      text: `₹${fallback30} / 30 min`,
      priceFor30: fallback30,
      priceFor30Text: `₹${fallback30} / 30 min`,
    };
  };

  // generate a dummy rating if none provided
  const getRating = (pro) => {
    if (pro && pro.rating) return Number(pro.rating);
    return Number((Math.random() * 0.39 + 4.6).toFixed(2));
  };

  // language badge helper
  const renderLanguageBadges = (languages = []) => {
    return (
      <LangWrap>
        {languages.map((lang, i) => {
          const code = (lang || "").toLowerCase();
          let short = lang;
          if (code.includes("hindi")) short = "HI";
          else if (code.includes("english")) short = "EN";
          else if (code.includes("sindhi")) short = "SN";
          else if (code.length <= 3) short = lang.toUpperCase();
          else short = lang.slice(0, 2).toUpperCase();

          return (
            <LangBadge key={i} title={lang}>
              <span className="short">{short}</span>
              <span className="full">{lang}</span>
            </LangBadge>
          );
        })}
      </LangWrap>
    );
  };

  // map role to "view all" path (keeps pluralization simple)
  const viewAllHref = `/${role}-list`;

  // skeleton for loading state (4 placeholders)
  const SkeletonCard = () => (
    <ProCardH className="skeleton" aria-hidden>
      <div style={{ width: 110, height: 110, borderRadius: 12, background: "#f3f3f3" }} />
      <div style={{ height: 10 }} />
      <div style={{ width: 140, height: 14, borderRadius: 6, background: "#f3f3f3" }} />
      <div style={{ height: 6 }} />
      <div style={{ width: 100, height: 12, borderRadius: 6, background: "#f3f3f3", marginTop: 8 }} />
      <div style={{ height: 12 }} />
      <div style={{ width: "70%", height: 36, borderRadius: 20, background: "#f3f3f3" }} />
    </ProCardH>
  );

  return (
    <ProSection ref={containerRef} aria-label={`${role} horizontal list`}>
      <HeaderRow>
        <h2 style={{ fontFamily: "Raleway", fontSize: "28px", fontWeight: "800", marginBottom: 0 }}>
          {role === "lawyer" && "Top Lawyers"}
          {role === "counsellor" && "Top Counsellors"}
          {role === "mediator" && "Top Mediators"}
          {role === "therapist" && "Top Therapists"}
        </h2>

        <ViewAll href={viewAllHref}>View All</ViewAll>
      </HeaderRow>

      <ProRow>
        {loading && data.length === 0 ? (
          // show 4 skeletons while initially loading
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div style={{ padding: 20, color: "#b33" }}>
            {error}
            <div style={{ marginTop: 8 }}>
              <OutlineBtn as="button" onClick={() => { fetchedRef.current = false; fetchData(); }} style={{ cursor: "pointer" }}>
                Retry
              </OutlineBtn>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: 12, color: "#666" }}>No professionals found.</div>
        ) : (
          data.slice(0, 4).map((pro, index) => {
            const rating = getRating(pro);
            const reviews = pro.reviewsCount || Math.floor(Math.random() * 1500) + 20;
            const rate = getRateDisplay(pro);
            const roleAvatars = roleAvatarMap[role] || avatarPool;
            const imageSrc = pro.image || roleAvatars[index % roleAvatars.length];
            const rawRole = pro.role || role || "";
            const displayedRole = rawRole ? String(rawRole).replace(/\b\w/g, (ch) => ch.toUpperCase()) : "";

            return (
              <ProCardH key={`${role}-${index}`}>
                <TopRow>
                  <Link
                    to={`/profile/${encodeURIComponent(pro._id ?? pro.id ?? index)}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <AvatarWrap>
                      <ProImg src={imageSrc} alt={pro.name || "profile"} loading="lazy" decoding="async" />
                      <OnlineDot className={pro.isOnline ? "online" : ""} />
                      <RatingBadge>
                        <strong>{Number(rating).toFixed(2)}</strong>
                        <span>|</span>
                        <small>{reviews.toLocaleString()}</small>
                      </RatingBadge>
                    </AvatarWrap>
                  </Link>

                  <FollowBtn type="button">+ Follow</FollowBtn>
                </TopRow>

                <ProTitle>{pro.name}</ProTitle>
                <ProSmall>{pro.speciality || ""}</ProSmall>
                {displayedRole && <ProRole>{displayedRole}</ProRole>}
                {renderLanguageBadges(pro.languages)}
                <ProSmall>{pro.yearsExperience ? `${pro.yearsExperience} Years` : ""}</ProSmall>

                <PriceAndActions>
                  <div>
                    <ProPriceSmall>{rate.text}</ProPriceSmall>
                  </div>

                  <Actions>
                    <ActionBtn title="Call" aria-label={`Call ${pro.name}`}>
                      <CallIcon viewBox="0 0 24 24" aria-hidden>
                        <path d="M6.6 10.8a15 15 0 006.6 6.6l2.1-2.1a1 1 0 011.1-.2c1.2.5 2.5.8 3.8.8a1 1 0 011 1v3.5a1 1 0 01-1 1C9.2 21.5 2.5 14.8 2.5 6a1 1 0 011-1H7a1 1 0 011 1c0 1.3.3 2.6.8 3.8.2.4 0 .9-.2 1.1L6.6 10.8z" fill="currentColor" />
                      </CallIcon>
                      <span>Call</span>
                    </ActionBtn>

                    <ActionBtn title="Video" aria-label={`Video call ${pro.name}`}>
                      <VideoIcon viewBox="0 0 24 24" aria-hidden>
                        <path d="M17 10.5V6a1 1 0 00-1-1H3a1 1 0 00-1 1v12a1 1 0 001 1h13a1 1 0 001-1v-4.5l4 4v-11l-4 4z" fill="currentColor" />
                      </VideoIcon>
                      <span>Video</span>
                    </ActionBtn>
                  </Actions>
                </PriceAndActions>

                <BookRow>
                  <Link
                    to={`/profile/${encodeURIComponent(pro._id ?? pro.id ?? index)}`}
                    style={{ textDecoration: "none", color: "inherit", width: "100%", textAlign: "center", }}
                  >
                    Book Professional
                  </Link>
                </BookRow>

                <StarArea>
                  {renderStars(rating)}
                  <ReviewCount>{reviews.toLocaleString()} reviews</ReviewCount>
                </StarArea>
              </ProCardH>
            );
          })
        )}
      </ProRow>
    </ProSection>
  );
}

/* ----------------- BookingCategories component (unchanged) ----------------- */

function BookingCategories() {
  const cards = [
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

  return (
    <BookingSection id="book">
      <BookingInner>
        <BookingTitle>Book Online Consultation</BookingTitle>
        <BookingSubtitle>When Relationships Get Tough — We're Here to Guide You.</BookingSubtitle>

        <Grid>
          {cards.map((c) => (
            <Card key={c.title}>
              <CardContent>
                <CardHeading>{c.title}</CardHeading>
                <CardDesc>{c.desc}</CardDesc>
                <BookNow href={c.href}>BOOK ONLINE</BookNow>
              </CardContent>

              <CardImageWrap>
                <CardImage src={c.img} alt={c.title} />
              </CardImageWrap>
            </Card>
          ))}
        </Grid>
      </BookingInner>
    </BookingSection>
  );
}

/* ----------------- Global styles + main layout (unchanged mostly) ----------------- */

const GlobalStyle = createGlobalStyle`
  :root{
    --bg:#fff;
    --accent:#CAAA93;
    --accent-dark:#b7957d;
    --text:#0f1724;
    --muted:#666;
  }

  /* Ensure root elements use Raleway */
  html, body, #root {
    height:100%;
    font-family: 'Raleway', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6,
  p, a, span, label, small, strong,
  button, input, textarea, select {
    font-family: inherit;
  }

  :root {
    --bg: #fff;
    --accent: #CAAA93;
    --accent-dark: #b7957d;
    --text: #0f1724;
    --muted: #666;
  }

  body {
    margin: 0;
    color: var(--text);
    background: var(--bg);
  }

  button, a[role="button"] {
    font-weight: 600;
  }

  .raleway, .use-raleway {
    font-family: 'Raleway', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  }

  :focus {
    outline: 3px solid rgba(202,170,147,0.25);
    outline-offset: 2px;
  }

  h1,h2,h3,h4,h5 { margin:0; }
  a { color:inherit; text-decoration:none; }
`;

/* ----------------- styles below are unchanged from your original file ----------------- */

const Main = styled.main`
  width:100%;
  overflow-x:hidden;
`;

const HeroSection = styled.section`
  position:relative;
  height:100vh;
  min-height:680px;
  background: linear-gradient(180deg, #fbf5ef 0%, #f7efe8 100%);
  display:block;
`;

const HeroBg = styled.div`
  position:absolute;
  inset:0;
  z-index:0;
  overflow:hidden;
  pointer-events:none;
`;

const HeroImg = styled.img`
  position:absolute;
  right:0;
  height:138%;
  width:auto;
  min-width:60%;
  object-fit:contain;
  object-position:right top;
  transform-origin: right top;
  filter: saturate(1.02);

  @media (max-width: 980px) {
    height: 120%;
    min-width: 40%;
    object-position: center top;
  }
`;

const HeroContainer = styled.div`
  position:relative;
  z-index:6;
  max-width:1400px;
  margin:0 auto;
  height:100%;
  display:grid;
  grid-template-columns: 1fr 48%;
  align-items:center;
  gap:24px;
  padding:48px 36px;
  box-sizing:border-box;

  @media (max-width:980px){
    grid-template-columns: 1fr;
    padding:28px 20px;
    align-items:start;
  }
`;

const HeroContent = styled.div`
  position:relative;
  padding-right:20px;
  z-index:7;
`;

const Title = styled.h1`
  font-family: 'Raleway', 'Poppins', sans-serif;
  font-weight:600;
  font-size: clamp(36px, 3.7vw, 64px);
  line-height:122.2%;
  letter-spacing:-0.01em;
  padding-left:5rem;
  color:var(--text);
  max-width:760px;
  overflow-wrap: break-word;

  span {
    display:block;
    font-weight:600;
    font-family: 'Raleway', 'Poppins', sans-serif;
  }

  @media (max-width:980px){
    padding-left:2rem;
    margin-top:-6rem;
    font-size: clamp(32px, 6.5vw, 56px);
    line-height:1.08;
  }

  @media (max-width:640px){
    font-size: clamp(28px, 9.5vw, 42px);
    padding-left:1rem;
    margin-top:15rem;
    max-width: 100%;
    line-height:1.05;
    white-space: normal;
    word-break: break-word;
  }
`;

const CTAWrap = styled.div`
  margin-top:26px;
  position:relative;
  z-index:9;
`;

const CTAButton = styled.a`
  display:inline-block;
  background: var(--accent);
  color:#111;
  padding:14px 28px;
  margin-left:5rem;
  border-radius:999px;
  font-weight:600;
  box-shadow: 0 12px 30px rgba(17,17,17,0.12);
  transition: transform .18s ease, background .18s ease;
  position:relative;
  z-index:9;

  &:hover{ transform:translateY(-3px); background:var(--accent-dark); }

  @media (max-width:640px){
    display:block;
    width:100%;
    text-align:center;
    margin-left:0;
  }
`;

const UnionImg = styled.img`
  position:absolute;
  left:-70px;
  top:-190px;
  width:1400px;
  height:auto;
  z-index:1;
  pointer-events:none;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.06));

  @media (max-width:980px){
    position:static;
    display:block;
    margin-bottom:12px;
    width:160px;
    filter:none;
  }
`;

const SlantedSection = styled.div`
  position:absolute;
  left:0;
  right:0;
  bottom:-230px;
  z-index:5;
  pointer-events:none;
`;

const SlantedInner = styled.div`
  width:100%;
  max-width: none;
  margin:0;
  padding:56px 90px;
  background: linear-gradient(90deg, #cfb093 0%, #d9bfa5 50%, #c4a082 100%);
  box-shadow: 0 18px 40px rgba(0,0,0,0.12);
  transform: skewY(2deg);
  pointer-events:auto;

  @media (max-width:980px){
    padding:28px 36px;
    transform: skewY(-3deg);
  }
`;

const WhyContents = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:28px;
  color:var(--text);

  @media (max-width:980px){
    flex-direction:column;
    align-items:flex-start;
    gap:12px;
  }
`;

const WhyLeft = styled.div`
  max-width:540px;
  h3{
    font-size:38px;
    padding-top:2rem;
    font-weight:900;
    letter-spacing:0.02em;
    color: #141C2C;
  }
  p{
    margin-top:6px;
    color: #141C2C;
    font-size:18px;
  }
`;

const WhyRight = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px 80px;
  max-width: 460px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 40px;
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 12px;
  }

  @media (max-width: 360px) {
    gap: 8px 8px;
  }
`;

const Stat = styled.div`
  text-align: center;
  background: linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.12));
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateX(4px) translateY(-4px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
  }

  h4 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
  }

  p {
    margin: 6px 0 0;
    font-size: 14px;
    color: rgba(15, 23, 36, 0.85);
  }
`;

const ServicesSection = styled.section`
  margin-top: 30px;
  padding: 80px 36px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  position: relative;
  z-index: 3;
`;

const ServicesTitle = styled.h2`
  text-align: left;
  font-family: 'Raleway', sans-serif;
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 10px;
  padding-left:30rem;
  color: #0f1724;

  @media (max-width: 980px) {
    padding-left: 0;
    text-align: center;
    font-size: clamp(34px, 6vw, 40px);
  }

  @media (max-width: 640px) {
    font-size: clamp(26px, 7.5vw, 34px);
    padding-left: 0;
    text-align: center;
    margin: 0 auto;
    max-width: 92%;
    line-height: 1.05;
  }
`;

const ServicesSubtitle = styled.p`
  text-align: left;
  font-size: 18px;
  color: rgba(15, 23, 36, 0.6);
  padding-left:32rem;
  padding-top:0.5rem;
  margin-bottom: 70px;

  @media (max-width: 980px) {
    padding-left: 0;
    text-align: center;
    font-size: 16px;
    margin-bottom: 40px;
  }

  @media (max-width: 640px) {
    font-size: 15px;
    padding-left: 0;
    text-align: center;
    margin-bottom: 28px;
    max-width: 92%;
    margin-left: auto;
    margin-right: auto;
  }
`;

const ServicesWrapper = styled.div`
  display:grid;
  grid-template-columns: 360px 1fr;
  gap:40px;
  align-items:start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap:20px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap:12px;
    padding: 0 12px;
  }
`;

const LeftBrand = styled.div`
  position:relative;
  display:flex;
  align-items:flex-start;
  justify-content:flex-start;
`;

const CircleBg = styled.img`
  width: 543px;
  height: 420px;
  margin-left: -3rem;
  object-fit: contain;
  display: block;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  background: #fff;
  z-index: 1;

  @media (max-width: 980px) {
    width: 360px;
    height: auto;
    margin-left: 0;
    margin-top: 0;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

const CardsColumn = styled.div`
  position:relative;
  z-index:2;
`;

const CardsGrid = styled.div`
  position:relative;
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:20px;

  @media (max-width: 980px) {
    grid-template-columns:1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns:1fr;
    gap:12px;
  }
`;

const ServiceCard = styled.div`
  background:#fff;
  border-radius:16px;
  padding:28px;
  box-shadow: 0 8px 20px rgba(11,16,20,0.04);
  display:flex;
  flex-direction: column;
  gap:12px;
  align-items:flex-start;
  border: 1px solid rgba(202,170,147,0.18);
  min-height: 140px;
  transition: transform .18s ease, box-shadow .18s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 60px rgba(15,23,36,0.12);
  }
`;

const IconWrap = styled.div`
  width:64px;
  height:64px;
  background: linear-gradient(180deg, rgba(202,170,147,0.12), rgba(202,170,147,0.06));
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:6px;
`;

const IconImg = styled.img`
  width:44px;
  height:44px;
  object-fit:contain;
`;
const CardTitle = styled.h4`
  margin:0 0 6px 0;
  font-size:18px;
  font-weight:800;
`;

const LearnMoreWrap = styled.div`
  text-align:center;
  margin-top:36px;
`;

const OutlineBtn = styled.a`
  display:inline-block;
  padding:12px 30px;
  border-radius:30px;
  background:#CAAA93;
  font-weight:600;
  color:var(--text);
  text-decoration:none;
  border:1px solid rgba(0,0,0,0.04);
`;

/* ---------- PROFESSIONAL HORIZONTAL SECTION ---------- */

const ProSection = styled.section`
  max-width: 1400px;
  margin: 80px auto 0;
  padding: 0 36px;
`;

const HeaderRow = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom: 14px;
`;

const ViewAll = styled.a`
  color: var(--accent);
  background: #fff;
  border:1px solid rgba(202,170,147,0.14);
  padding:8px 14px;
  border-radius:999px;
  text-decoration:none;
  font-weight:700;
  font-size:14px;
`;

const ProRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;

  @media(max-width: 900px) {
    display: flex;
    flex-direction: row;
    gap: 14px;
    overflow-x: auto;
    padding: 8px 6px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  @media(max-width: 600px) {
    padding-left: 12px;
    padding-right: 12px;
    gap: 12px;
  }

  &::-webkit-scrollbar { height: 8px; }
  &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 8px; }
`;

const ProCardH = styled.div`
  background: #fff;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 6px 14px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 260px;
  margin: 0 auto;
  width: 100%;

  @media(max-width: 900px) {
    min-width: 78%;
    max-width: 78%;
    scroll-snap-align: start;
    margin-right: 6px;
  }

  @media(max-width: 480px) {
    min-width: 86%;
    max-width: 86%;
  }

  @media(min-width: 901px) {
    max-width: 560px;
  }
`;

const ProImg = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 10px;
`;

const ProTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 4px;
  margin-top:8px;
`;

const ProSmall = styled.p`
  font-size: 12px;
  color: #6a6a6a;
  margin: 4px 0;
`;

const ProRole = styled.div`
  font-size: 12px;
  color: #0a7f5f;
  font-weight: 700;
  margin-top: 6px;
`;

const ProPriceSmall = styled.p`
  font-size: 15px;
  font-weight: 700;
  margin-top: 6px;
  color: #0a7f5f;
`;

const SmallNote = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const TopRow = styled.div`
  width:100%;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
  margin-bottom:6px;
`;

const AvatarWrap = styled.div`
  position:relative;
  display:flex;
  align-items:center;
  gap:8px;
`;

const OnlineDot = styled.span`
  position:absolute;
  right: -6px;
  top: -6px;
  width:12px;
  height:12px;
  border-radius:50%;
  background:#ccc;
  border:2px solid #fff;
  &.online { background:#25b13a; box-shadow:0 0 0 4px rgba(37,177,58,0.08); }
`;

const RatingBadge = styled.div`
  position:absolute;
  left:8px;
  bottom:-10px;
  background: linear-gradient(180deg, #ffffff, #f8faf9);
  border-radius:18px;
  padding:6px 10px;
  display:inline-flex;
  align-items:center;
  gap:6px;
  border:1px solid rgba(0,0,0,0.06);
  font-size:12px;
  box-shadow:0 6px 12px rgba(0,0,0,0.06);
  strong { color:#0f1724; font-weight:800; font-size:13px; }
  small { color:#6b7280; font-weight:600; font-size:12px; }
  span { color:#d1d5db; }
`;

const FollowBtn = styled.button`
  border:1px solid rgba(0,0,0,0.06);
  background:#fff;
  padding:6px 10px;
  border-radius:999px;
  font-weight:700;
  font-size:12px;
  cursor:pointer;
`;

const PriceAndActions = styled.div`
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-top:8px;
`;

const Actions = styled.div`
  display:flex;
  gap:6px;
  align-items:center;
`;

const ActionBtn = styled.button`
  display:flex;
  align-items:center;
  gap:6px;
  padding:6px 8px;
  border-radius:999px;
  border:1px solid rgba(10,127,95,0.12);
  background: #fff;
  cursor:pointer;
  font-weight:700;
  font-size:12px;
  svg { width:14px; height:14px; }
`;

const CallIcon = styled.svg`
  width:14px; height:14px; color:#0a7f5f;
`;
const VideoIcon = styled.svg`
  width:14px; height:14px; color:#0a7f5f;
`;

const BookRow = styled.div`
  display:flex;
  justify-content:center;
  margin-top:10px;
background: var(--accent);
  color: #111;
  padding:10px 12px;
  border-radius:999px;
  border: none;
  font-weight:700;
  cursor:pointer;
  box-shadow: 0 8px 18px rgba(17,17,17,0.08);
  font-size:13px;

  &:hover { background: var(--accent-dark); }
`;


const LangWrap = styled.div`
  display:flex;
  gap:8px;
  margin-top:6px;
  flex-wrap:wrap;
  justify-content:center;
`;

const LangBadge = styled.div`
  display:flex;
  align-items:center;
  gap:8px;
  padding:6px 8px;
  border-radius:10px;
  border:1px solid rgba(0,0,0,0.06);
  background:#fff;
  font-size:12px;
  color:#444;

  .short {
    width:20px;
    height:20px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-radius:6px;
    background:#f3f4f6;
    font-weight:700;
    font-size:11px;
    color:#111;
  }
  .full {
    display:inline-block;
    font-size:12px;
    color:#6a6a6a;
  }
`;

const StarRow = styled.div`
  display:flex;
  gap:4px;
  align-items:center;
  margin-top:10px;
  svg { color:#f6b400; }
`;

const StarArea = styled.div`
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  margin-top:8px;
  flex-direction:column;
`;

const ReviewCount = styled.div`
  font-size:12px;
  color:#6b7280;
  margin-top:4px;
`;

const BookingSection = styled.section`
  padding: 56px 36px;
  max-width: 1200px;
  margin: 2px auto 0;
  box-sizing: border-box;
`;

const BookingInner = styled.div`
  text-align: center;
  margin-bottom: 28px;
`;

const BookingTitle = styled.h2`
  font-family: 'Raleway', sans-serif;
  font-size: 44px;
  font-weight: 800;
  margin: 8px 0 6px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 980px) {
    font-size: clamp(28px, 6.5vw, 44px);
  }

  @media (max-width: 480px) {
    font-size: clamp(20px, 5.5vw, 32px);
  }
`;

const BookingSubtitle = styled.p`
  font-size: 18px;
  color: rgba(15,23,36,0.72);
  margin-bottom: 28px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    gap: 12px;
    padding: 0 12px;
  }
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  border-radius: 20px;
  overflow: visible;
  background: linear-gradient(180deg, #F6F1E6 70%, #CAAA93 100%);
  border: 1px solid rgba(15,23,36,0.12);
  min-height: 140px;
  box-shadow: 0 8px 24px rgba(11,16,20,0.04);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 60px rgba(15,23,36,0.18);
    border-color: rgba(15,23,36,0.28);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 12px;
  }
`;

const CardContent = styled.div`
  flex: 1 1 50%;
  padding: 5px 4px 2px 20px;
  text-align: left;
`;

const CardHeading = styled.h3`
  font-size: 24px;
  margin: 0 0 10px;
  font-weight: 800;
  color: #0f1724;
`;

const CardDesc = styled.p`
  margin: 0 0 18px;
  color: rgba(15,23,36,0.75);
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
`;

const CardImageWrap = styled.div`
  width: 46%;
  min-width: 160px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding-top: 14px;
  box-sizing: border-box;
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

/* ----------------- Main component export ----------------- */

export default function Homepage() {
  return (
    <Main>
      <GlobalStyle />
      <HeroSection>
        <HeroBg>
          <HeroImg src={heroImage} alt="" />
          <UnionImg src={union} />
        </HeroBg>

        <HeroContainer>
          <HeroContent>
            <Title>
              Ending a Marriage is
              <br />
              <span>
                hard. We make the
                <br />
                journey smoother.
              </span>
            </Title>

            <CTAWrap>
              <CTAButton href="#book">Start Your Consultation</CTAButton>
            </CTAWrap>
          </HeroContent>

          <div />
        </HeroContainer>

        <SlantedSection>
          <SlantedInner>
            <WhyContents>
              <WhyLeft>
                <h3>
                  WHY CHOOSE
                  <br />
                  SHAADI UNDO
                </h3>
                <p>Breaking Free, Without Breaking Down</p>
              </WhyLeft>

              <WhyRight>
                <Stat>
                  <h4>25</h4>
                  <p>Years of Experience</p>
                </Stat>
                <Stat>
                  <h4>4K+</h4>
                  <p>Happy Clients</p>
                </Stat>
                <Stat>
                  <h4>3K+</h4>
                  <p>Cases Solved Last Year</p>
                </Stat>
                <Stat>
                  <h4>50+</h4>
                  <p>Marriage Consultants</p>
                </Stat>
              </WhyRight>
            </WhyContents>
          </SlantedInner>
        </SlantedSection>
      </HeroSection>

      <div style={{ height: 40, marginTop: "150px" }} />

      <HorizontalProfessionals role="lawyer" />
      <HorizontalProfessionals role="counsellor" />
      <HorizontalProfessionals role="mediator" />
      <HorizontalProfessionals role="therapist" />

      <ServicesSection>
        <ServicesTitle>Guided Divorce Care</ServicesTitle>
        <ServicesSubtitle>Helping You Find Freedom & a New Beginning</ServicesSubtitle>

        <ServicesWrapper>
          <LeftBrand>
            <CircleBg src={circleBg} alt="circle-bg" />
          </LeftBrand>

          <CardsColumn>
            <CardsGrid>
              <ServiceCard>
                <IconWrap>
                  <IconImg src={heartsRow2} alt="Marriage Counselling icon" />
                </IconWrap>

                <CardContent>
                  <CardTitle>Marriage Counselling</CardTitle>
                  <CardDesc>To help you understand your options</CardDesc>
                </CardContent>
              </ServiceCard>

              <ServiceCard>
                <IconWrap>
                  <IconImg src={waveLines2} alt="Mediation icon" />
                </IconWrap>

                <CardContent>
                  <CardTitle>Mediation/Settlement</CardTitle>
                  <CardDesc>To help you understand your options</CardDesc>
                </CardContent>
              </ServiceCard>

              <ServiceCard>
                <IconWrap>
                  <IconImg src={heartsRow} alt="Divorce consultation icon" />
                </IconWrap>

                <CardContent>
                  <CardTitle>Divorce consultation</CardTitle>
                  <CardDesc>To help you understand your options</CardDesc>
                </CardContent>
              </ServiceCard>

              <ServiceCard>
                <IconWrap>
                  <IconImg src={waveLines} alt="Support groups icon" />
                </IconWrap>

                <CardContent>
                  <CardTitle>Mental Health & Support Groups</CardTitle>
                  <CardDesc>To help you understand your options</CardDesc>
                </CardContent>
              </ServiceCard>
            </CardsGrid>

            <LearnMoreWrap>
              <OutlineBtn href="#more">Learn More →</OutlineBtn>
            </LearnMoreWrap>
          </CardsColumn>
        </ServicesWrapper>
      </ServicesSection>

      <BookingCategories />
      <KnowledgeCentre />
      <SuccessfulStories />
    </Main>
  );
}