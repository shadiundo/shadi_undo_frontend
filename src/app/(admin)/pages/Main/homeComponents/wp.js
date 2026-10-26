// src/homeComponents/wp.js
export const WP_BASE = 'https://knowledgecenter.shaadiundo.com/wp-json/wp/v2';

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`WP fetch failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function fetchKnowledge({ page = 1, per_page = 12, categories } = {}) {
  let url = `${WP_BASE}/knowledge?per_page=${per_page}&page=${page}`;
  if (categories) {
    url += `&categories=${encodeURIComponent(categories)}`;
  }
  return fetchJson(url);
}

export function mapWPPostToArticle(post) {
  const acf = post.acf || {};
  let heroImageUrl = null;
  if (acf.hero_image) {
    if (typeof acf.hero_image === 'string') heroImageUrl = acf.hero_image;
    else if (acf.hero_image.url) heroImageUrl = acf.hero_image.url;
    else if (acf.hero_image.sizes?.medium) heroImageUrl = acf.hero_image.sizes.medium;
  }
  let featuredVideo = null;
  if (acf.featured_video) {
    if (typeof acf.featured_video === 'string') featuredVideo = acf.featured_video;
    else if (acf.featured_video.url) featuredVideo = acf.featured_video.url;
  }
  let category = 'General';
  if (Array.isArray(acf.category_select) && acf.category_select.length > 0) {
    category = acf.category_select[0].name;
  } else if (post._embedded?.['wp:term']?.[0]?.[0]?.name) {
    category = post._embedded['wp:term'][0][0].name;
  }
  const rawExcerpt = (acf.excerpt_text && String(acf.excerpt_text)) || (post.excerpt && post.excerpt.rendered) || '';
  const excerpt = rawExcerpt.replace(/(<([^>]+)>)/gi, '').trim();
  return {
    id: post.id,
    title: post.title?.rendered || '',
    excerpt,
    category,
    image: heroImageUrl || post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    content: post.content?.rendered || '',
    featuredVideo,
    acf
  };
}


export async function fetchCategories() {
  const page1 = await fetchJson(`${WP_BASE}/categories?per_page=100&hide_empty=0&page=1`);
  let results = [...page1];

  if (page1.length === 100) {
    try {
      const page2 = await fetchJson(`${WP_BASE}/categories?per_page=100&hide_empty=0&page=2`);
      results = results.concat(page2);
    } catch {}
  }

  return results.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat.count || 0
  }));
}

