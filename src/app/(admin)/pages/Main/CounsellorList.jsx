// src/pages/ProfessionalList.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom"; // <-- added Link

/* ----- avatar imports - update paths if needed ----- */
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

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

/* ----- API base ----- */
const BASE_URL = import.meta.env.VITE_API_URL || "";

/* ---------------- Styled components (responsive improvements) ---------------- */
const PageWrapper = styled.div`
  padding: 18px 28px;
  background: #faf7f5;
  box-sizing: border-box;
  min-height: 100vh;
`;

/* HERO - flexible and wraps on narrow screens */
const Hero = styled.header`
  width: 100%;
  background: linear-gradient(90deg, #CAAA93 0%, #BA8D6C 100%);
  padding: 20px 22px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 20px;
  border-radius: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

const HeroLeft = styled.div`
  flex: 0 0 240px;
  min-width: 160px;
  color: #fff;
  font-weight: 600;
  opacity: 0.95;
  font-size: clamp(12px, 1.1vw, 14px);
`;

const HeroControls = styled.div`
  flex: 1 1 420px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  flex-wrap: nowrap;

  @media (max-width: 820px) {
    width: 100%;
    justify-content: stretch;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const InputWrap = styled.div`
  position: relative;
  width: 44%;
  min-width: 160px;
  max-width: 640px;

  @media (max-width: 1100px) {
    width: 48%;
  }
  @media (max-width: 820px) {
    width: 100%;
  }
`;

const HeroInput = styled.input`
  width: 100%;
  padding: 12px 14px 12px 44px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.06);
  background: rgba(255,255,255,0.95);
  font-size: clamp(13px, 1.2vw, 14px);
  outline: none;
  box-sizing: border-box;
`;

const Icon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display:flex;
  align-items:center;
  justify-content:center;
  color: #9b8777;
`;

const SuggestionsBox = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  z-index: 60;
  max-height: 220px;
  overflow: auto;
`;

const SuggestionItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  &:hover { background: #f6f6f6; }
`;

const Verified = styled.div`
  min-width: 110px;
  color: #fff;
  font-weight: 600;
  display:flex;
  align-items:center;
  gap: 8px;
  justify-content:flex-end;

  @media (max-width: 820px) {
    width: 100%;
    justify-content: flex-start;
    margin-top: 6px;
  }
`;

/* LAYOUT */
const Layout = styled.div`
  display:flex;
  gap:28px;
  align-items:flex-start;
  @media(max-width:900px){ flex-direction:column; }
`;

const Sidebar = styled.aside`
  width:240px;
  background:white;
  border-radius:8px;
  padding:18px;
  box-shadow:0 6px 18px rgba(0,0,0,0.06);
  flex: 0 0 240px;

  @media(max-width:1200px){ width:220px; flex: 0 0 220px; }
  @media(max-width:900px){ width:100%; order:2; }
`;

const FiltersTitle = styled.h4`
  margin:0 0 12px 0;
  font-size:14px;
  color:#2b2b2b;
`;

const CheckboxRow = styled.label`
  display:flex; gap:8px; align-items:center; margin:8px 0; font-size:14px; color:#666;
  input{ width:16px; height:16px;}
`;

const Content = styled.main` flex:1; min-width:0; `;

/* GRID: fluid auto-fit layout */
const Grid = styled.div`
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap:26px;

  @media (min-width: 1600px) { gap: 32px; }
`;

/* CARD */
const Card = styled.article`
  background:white;
  border-radius:10px;
  padding:18px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  text-align:left;
  min-height:220px;
  position:relative;

  @media (max-width:420px){
    padding:12px;
    min-height: auto;
  }
`;

const CardTop = styled.div`
  display:flex;
  gap:14px;
  align-items:flex-start;
  width:100%;
`;

const AvatarWrap = styled.div`
  width:110px;
  display:flex;
  align-items:center;
  justify-content:center;

  @media (max-width:720px){ width:84px; }
  @media (max-width:420px){ width:64px; }
`;

const AvatarImg = styled.img`
  width:80px;
  height:80px;
  border-radius:50%;
  object-fit:cover;
  border:6px solid #fff;
  box-shadow:0 2px 6px rgba(0,0,0,0.08);
  background:#f2f2f2;

  @media (max-width:720px){ width:64px; height:64px; border-width:5px; }
  @media (max-width:420px){ width:52px; height:52px; border-width:4px; }
`;

const InfoCol = styled.div` flex:1; min-width:0; `;

const Name = styled.h3`
  margin:0;
  font-size:18px;
  color:#1b1b1b;
  font-weight:700;
  @media (min-width:1400px) { font-size:20px; }
`;

const RoleText = styled.div`
  color:#cfcfcf;
  margin-top:6px;
  font-size:13px;
`;

const LocationRow = styled.div`
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:8px;
  color:#6b6b6b;
  font-size:13px;
`;

const Rating = styled.span`
  display:inline-flex;
  align-items:center;
  gap:6px;
  background:#ffd97a;
  color:#5a3a05;
  padding:6px 10px;
  border-radius:12px;
  font-weight:700;
  margin-top:8px;
  font-size:13px;
`;

const MetaSmall = styled.div`
  margin-top:12px;
  color:#333;
  font-size:14px;
  @media (max-width:420px) { font-size:13px; }
`;

const TagRow = styled.div`
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin-top:12px;
  width:100%;
`;

const Tag = styled.span`
  background:#f2f4f5; color:#555; padding:6px 10px; border-radius:16px; font-size:12px;
`;

const Divider = styled.hr`
  width:100%; border:none; height:1px; background:#eee; margin:14px 0;
`;

const BookBtn = styled.button`
  width:100%;
  padding:12px 18px;
  border-radius:22px;
  border:none;
  background: #b77e62;
  color:white;
  font-weight:700;
  cursor:pointer;
  font-size:14px;

  @media (max-width:420px) { padding:10px; font-size:13px; border-radius:16px; }
`;

const Message = styled.div` padding:22px; text-align:center; color:#666; `;
const RetryBtn = styled.button` margin-top:12px; background:transparent; border:1px solid #b77e62; color:#b77e62; padding:8px 12px; border-radius:8px; cursor:pointer; `;

/* ---------------- Helpers ---------------- */
function stableRatingFromId(id) {
  if (!id) return 4.0;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h) + id.charCodeAt(i);
  h = Math.abs(h);
  const v = 35 + (h % 16);
  return (v / 10);
}
const safeGetLocation = (p) => p?.location ?? {};
const mapSpecialties = (s) => {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  if (typeof s === "string") return s.split(",").map(x => x.trim());
  return [String(s)];
};

/* ---------------- Component ---------------- */
export default function ProfessionalList({ role = "counsellor", title }) {
  const apiEndpoint = `${BASE_URL}/api/professionals/role/${encodeURIComponent(role)}`;

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(1000);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState({ q: "", country: [], state: [], city: [], specialty: [] });

  // pending UI filters
  const [pendingCountries, setPendingCountries] = useState([]);
  const [pendingStates, setPendingStates] = useState([]);
  const [pendingCities, setPendingCities] = useState([]);
  const [pendingSpecialties, setPendingSpecialties] = useState([]);
  const [pendingQuery, setPendingQuery] = useState("");
  const [pendingLocation, setPendingLocation] = useState("");

  // suggestions dropdown
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const sentinelRef = useRef(null);
  const abortRef = useRef(null);

  const pageParamName = "page";
  const pageSizeParamName = "limit";

  const buildUrl = useCallback((p, size, opts = {}) => {
    const url = new URL(apiEndpoint, window.location.origin);
    url.searchParams.set(pageParamName, p);
    url.searchParams.set(pageSizeParamName, size);
    url.searchParams.set("sort", "-createdAt");
    if (opts.q) url.searchParams.set("q", opts.q);

    const appendMulti = (name, val) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach(v => { if (v != null && v !== '') url.searchParams.append(name, v); });
      } else {
        url.searchParams.set(name, val);
      }
    };

    appendMulti("country", opts.country);
    appendMulti("state", opts.state);
    appendMulti("city", opts.city);
    appendMulti("specialty", opts.specialty);

    return url.toString();
  }, [apiEndpoint]);

  const loadPageWithFilters = useCallback(async (p, filters) => {
    setLoading(true);
    setError(null);
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const url = buildUrl(p, pageSize, filters);
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      let fetched = [];
      if (Array.isArray(data)) fetched = data;
      else if (Array.isArray(data.results)) fetched = data.results;
      else if (Array.isArray(data.data)) fetched = data.data;
      else if (Array.isArray(data.professionals)) fetched = data.professionals;
      else fetched = [];

      // client-side filter helper
      const passesFilters = (it, f) => {
        if (!f) return true;
        if (f.q) {
          const qlower = String(f.q).toLowerCase();
          const name = (it.name || it.fullName || "").toString().toLowerCase();
          if (name.includes(qlower)) return true;
          const exp = it.yearsExperience ?? (it.experience?.[0]?.years ?? null);
          if (exp != null && String(exp).toLowerCase().includes(qlower)) return true;
          const specs = mapSpecialties(it.specialties || it.specialization || it.specialities);
          if (specs.join(" ").toLowerCase().includes(qlower)) return true;
          return false;
        }

        const loc = safeGetLocation(it);
        if (Array.isArray(f.country) && f.country.length > 0) {
          if (!loc.country) return false;
          if (!f.country.includes(String(loc.country))) return false;
        }
        if (Array.isArray(f.state) && f.state.length > 0) {
          if (!loc.state) return false;
          if (!f.state.includes(String(loc.state))) return false;
        }
        if (Array.isArray(f.city) && f.city.length > 0) {
          if (!loc.city) return false;
          if (!f.city.includes(String(loc.city))) return false;
        }
        if (Array.isArray(f.specialty) && f.specialty.length > 0) {
          const specs = mapSpecialties(it.specialties || it.specialization || it.specialities);
          const hasAny = specs.some(s => f.specialty.includes(String(s)));
          if (!hasAny) return false;
        }
        return true;
      };

      if (filters && (
        (filters.q && String(filters.q).trim() !== "") ||
        (Array.isArray(filters.country) && filters.country.length > 0) ||
        (Array.isArray(filters.state) && filters.state.length > 0) ||
        (Array.isArray(filters.city) && filters.city.length > 0) ||
        (Array.isArray(filters.specialty) && filters.specialty.length > 0)
      )) {
        fetched = fetched.filter(it => passesFilters(it, filters));
      }

      // Sort by createdAt descending
      fetched.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return db - da;
      });

      setItems(prev => {
        if (p === 1) {
          const unique = [];
          const seen = new Set();
          fetched.forEach(it => {
            const key = it._id ?? it.id ?? JSON.stringify(it);
            if (!seen.has(key)) { seen.add(key); unique.push(it); }
          });
          return unique;
        }
        const combined = [...prev, ...fetched];
        const uniqueMap = new Map();
        combined.forEach(item => {
          const key = item._id ?? item.id ?? JSON.stringify(item);
          uniqueMap.set(key, item);
        });
        return Array.from(uniqueMap.values());
      });

      if (fetched.length < pageSize) {
        const totalFromMeta = data?.total ?? data?.meta?.total ?? null;
        if (totalFromMeta != null) {
          const loaded = (p - 1) * pageSize + fetched.length;
          setHasMore(loaded < totalFromMeta);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(true);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error(err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [buildUrl, pageSize]);

  // initial load (reload when role changes)
  useEffect(() => {
    setPage(1);
    loadPageWithFilters(1, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // pagination load
  useEffect(() => {
    if (page === 1) return;
    loadPageWithFilters(page, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loading && hasMore) {
          setPage(prev => prev + 1);
        }
      });
    }, { root: null, rootMargin: "200px", threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  // derive filter options
  const { states, cities, specialties, countries, names } = useMemo(() => {
    const s = new Set(), c = new Set(), sp = new Set(), co = new Set(), nm = new Set();
    items.forEach(p => {
      const loc = safeGetLocation(p);
      if (loc.state) s.add(loc.state);
      if (loc.city) c.add(loc.city);
      if (loc.country) co.add(loc.country);
      const arr = mapSpecialties(p.specialties || p.specialities || p.specialization || p.specialties);
      arr.forEach(t => sp.add(t));
      const name = p.name || p.fullName || null;
      if (name) nm.add(name);
    });
    return { states: Array.from(s), cities: Array.from(c), specialties: Array.from(sp), countries: Array.from(co), names: Array.from(nm) };
  }, [items]);

  const handleRetry = () => {
    setError(null);
    setPage(1);
    loadPageWithFilters(1, appliedFilters);
  };

  // togglePending: auto-apply on single selection or when cleared
  const togglePending = (type, value) => {
    if (!type) return;

    const applyIfNeeded = (nextArray) => {
      if (nextArray.length === 1 || nextArray.length === 0) {
        setAppliedFilters(prevApplied => {
          const newApplied = { ...prevApplied, [type]: nextArray };
          setPage(1);
          loadPageWithFilters(1, newApplied);
          return newApplied;
        });
      }
    };

    if (type === "country") {
      setPendingCountries(prev => {
        const next = prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value];
        applyIfNeeded(next);
        return next;
      });
      return;
    }
    if (type === "state") {
      setPendingStates(prev => {
        const next = prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value];
        applyIfNeeded(next);
        return next;
      });
      return;
    }
    if (type === "city") {
      setPendingCities(prev => {
        const next = prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value];
        applyIfNeeded(next);
        return next;
      });
      return;
    }
    if (type === "specialty") {
      setPendingSpecialties(prev => {
        const next = prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value];
        applyIfNeeded(next);
        return next;
      });
      return;
    }
  };

  const applyFilters = (overrides = {}) => {
    const qterm = (overrides.q != null)
      ? (overrides.q && String(overrides.q).trim() ? String(overrides.q).trim() : "")
      : ((pendingQuery && pendingQuery.trim()) ? pendingQuery.trim() : (pendingLocation && pendingLocation.trim() ? pendingLocation.trim() : ""));

    const newApplied = {
      q: qterm || "",
      country: overrides.country ?? pendingCountries,
      state: overrides.state ?? pendingStates,
      city: overrides.city ?? pendingCities,
      specialty: overrides.specialty ?? pendingSpecialties
    };

    setAppliedFilters(newApplied);
    setPage(1);
    loadPageWithFilters(1, newApplied);
  };

  const clearAll = () => {
    setPendingCountries([]); setPendingStates([]); setPendingCities([]); setPendingSpecialties([]);
    setPendingQuery(""); setPendingLocation("");
    const empty = { q: "", country: [], state: [], city: [], specialty: [] };
    setAppliedFilters(empty);
    setPage(1);
    loadPageWithFilters(1, empty);
  };

  // suggestions logic
  useEffect(() => {
    const q = pendingQuery.trim();
    if (q === "") {
      if (appliedFilters.q) {
        const newApplied = { ...appliedFilters, q: "" };
        setAppliedFilters(newApplied);
        setPage(1);
        loadPageWithFilters(1, newApplied);
      }
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    const lower = q.toLowerCase();
    const nameMatches = names.filter(n => n.toLowerCase().includes(lower)).slice(0, 6).map(x => ({ type: 'name', value: x }));
    const specMatches = specialties.filter(s => s.toLowerCase().includes(lower)).slice(0, 6).map(x => ({ type: 'spec', value: x }));
    const cityMatches = cities.filter(c => c.toLowerCase().includes(lower)).slice(0, 6).map(x => ({ type: 'city', value: x }));
    const merged = [...nameMatches, ...specMatches, ...cityMatches].slice(0, 8);
    setSuggestions(merged);
    setShowSuggestions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery, names, specialties, cities]);

  const chooseSuggestion = (sugg) => {
    setPendingQuery(sugg.value);
    setShowSuggestions(false);
    applyFilters({ q: sugg.value });
  };

  const handleHeroKeyDown = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const displayTitle = title ?? (role.charAt(0).toUpperCase() + role.slice(1));

  if (loading && items.length === 0) return <PageWrapper><Message>Loading {displayTitle}s…</Message></PageWrapper>;
  if (error && items.length === 0) return <PageWrapper><Message>Error: {error}<div><RetryBtn onClick={handleRetry}>Retry</RetryBtn></div></Message></PageWrapper>;

  return (
    <PageWrapper>
      <Hero>
        <HeroLeft>
          {displayTitle} Finder<br />Find the Help You Need—Now
        </HeroLeft>

        <HeroControls>
          <InputWrap style={{ position: 'relative' }}>
            <Icon aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9b8777" strokeWidth="1.2" fill="none" /></svg>
            </Icon>
            <HeroInput
              placeholder="Location (optional)"
              value={pendingLocation}
              onChange={(e) => setPendingLocation(e.target.value)}
              onKeyDown={handleHeroKeyDown}
            />
          </InputWrap>

          <InputWrap style={{ position: 'relative' }}>
            <Icon aria-hidden style={{ left: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="#9b8777" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="11" r="5" stroke="#9b8777" strokeWidth="1.4" /></svg>
            </Icon>
            <HeroInput
              placeholder={`Search ${displayTitle} by name, experience, or specialization`}
              value={pendingQuery}
              onChange={(e) => setPendingQuery(e.target.value)}
              onKeyDown={handleHeroKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            />

            {showSuggestions && suggestions.length > 0 && (
              <SuggestionsBox>
                {suggestions.map((s, i) => (
                  <SuggestionItem key={i} onClick={() => chooseSuggestion(s)}>
                    <strong style={{ textTransform: 'capitalize' }}>{s.type}</strong>: {s.value}
                  </SuggestionItem>
                ))}
              </SuggestionsBox>
            )}

          </InputWrap>

        </HeroControls>

        <Verified>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))" }}><circle cx="12" cy="12" r="10" fill="#4DD0E1" /><path d="M9.5 12.5l1.5 1.5 3.5-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Verified
        </Verified>
      </Hero>

      <Layout>
        <Sidebar>
          <FiltersTitle>Country</FiltersTitle>
          {countries.length === 0 ? <div style={{ color: "#999" }}>—</div> :
            countries.map(c => (
              <CheckboxRow key={c}>
                <input type="checkbox" checked={pendingCountries.includes(c)} onChange={() => togglePending("country", c)} />
                {c}
              </CheckboxRow>
            ))
          }

          <FiltersTitle style={{ marginTop: 16 }}>State</FiltersTitle>
          {states.length === 0 ? <div style={{ color: "#999" }}>—</div> :
            states.map(s => (
              <CheckboxRow key={s}>
                <input type="checkbox" checked={pendingStates.includes(s)} onChange={() => togglePending("state", s)} />
                {s}
              </CheckboxRow>
            ))
          }

          <FiltersTitle style={{ marginTop: 16 }}>City</FiltersTitle>
          {cities.length === 0 ? <div style={{ color: "#999" }}>—</div> :
            cities.map(c => (
              <CheckboxRow key={c}>
                <input type="checkbox" checked={pendingCities.includes(c)} onChange={() => togglePending("city", c)} />
                {c}
              </CheckboxRow>
            ))
          }

          <FiltersTitle style={{ marginTop: 16 }}>Specialization</FiltersTitle>
          {specialties.length === 0 ? <div style={{ color: "#999" }}>—</div> :
            specialties.map(sp => (
              <CheckboxRow key={sp}>
                <input type="checkbox" checked={pendingSpecialties.includes(sp)} onChange={() => togglePending("specialty", sp)} />
                {sp}
              </CheckboxRow>
            ))
          }

          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button onClick={() => applyFilters()} style={{ background: '#b77e62', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Apply</button>
            <button onClick={clearAll} style={{ background: 'transparent', border: '1px solid #ddd', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Clear</button>
          </div>

          <div style={{ marginTop: 12, color: '#888', fontSize: 13 }}>
            Tip: single checkbox selection auto-applies. Use Apply to apply multiple selections.
          </div>
        </Sidebar>

        <Content>
          {items.length === 0 ? (
            <Message>No {displayTitle.toLowerCase()}s found.<div><RetryBtn onClick={handleRetry}>Try again</RetryBtn></div></Message>
          ) : (
            <>
              <Grid>
                {items.map((p, idx) => {
                  const name = p.name || p.fullName || `${displayTitle} #${idx + 1}`;
                  const roleLabel = p.role || p.profession || role;
                  const loc = safeGetLocation(p);
                  const city = loc.city || "";
                  const state = loc.state || "";
                  const country = loc.country || "";

                  const specialtiesArr = mapSpecialties(p.specialties || p.specialization || p.specialities);
                  const experienceYears = p.yearsExperience ?? (p.experience?.[0]?.years ?? null) ?? (p.rateOptions?.yearsExperience ?? null);

                  let rating = (typeof p.rating === "number") ? p.rating : (p.rateOptions?.defaultRating ?? p.rateOptions?.defaultRate ?? null);
                  if (rating == null) rating = stableRatingFromId(p._id ?? p.id ?? String(idx));

                  const avatarSrc = p.image || p.avatar || AVATARS[idx % AVATARS.length];

                  return (

                    <Card>
                      <CardTop>
                        <Link
                          key={p._id ?? p.id ?? idx}
                          to={`/profile/${p._id ?? p.id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <AvatarWrap>
                            <AvatarImg src={avatarSrc} alt={name} loading="lazy" decoding="async" />
                          </AvatarWrap>
                        </Link>
                        <InfoCol>
                          <Name>{name}</Name>
                          <RoleText>{roleLabel}</RoleText>

                          <LocationRow>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#c39b81" strokeWidth="1.2" /></svg>
                            <div>{[city, state, country].filter(Boolean).join(", ") || "Location N/A"}</div>
                          </LocationRow>

                          <Rating style={{ marginLeft: 0 }}>⭐ {rating.toFixed(1)}</Rating>
                        </InfoCol>
                      </CardTop>

                      <MetaSmall>
                        {experienceYears ? `${experienceYears}+ yrs of Experience` : "Experience N/A"}
                        <div style={{ color: "#999", marginTop: 6 }}>1000+ Consultations</div>
                      </MetaSmall>

                      <TagRow>
                        {specialtiesArr.slice(0, 3).map((t, i) => <Tag key={i}>{t}</Tag>)}
                      </TagRow>

                      <Divider />

                      <Link to={`/profile/${p._id ?? p.id}`} style={{ textDecoration: "none", width: "100%", marginTop: "auto" }}>
                        <BookBtn>Book Consultation</BookBtn>
                      </Link>
                    </Card>

                  );
                })}

                {/* sentinel to load more */}
                <div ref={sentinelRef} style={{ height: 1, width: "100%" }} />
              </Grid>

              {loading && <Message>Loading more…</Message>}
              {!hasMore && <Message style={{ marginTop: 12 }}>No more results.</Message>}
            </>
          )}
        </Content>
      </Layout>
    </PageWrapper>
  );
}
