// src/app/(admin)/pages/Main/homeComponents/newsService.js

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search';

// Query for "Divorce", "Relationship Dispute", "Court Judgments", etc.
// Sources: The Hindu, Indian Express, BBC.
const QUERY = '(Divorce OR "relationship dispute" OR "family court judgment" OR "alimony" OR "maintenance case" OR "dowry harassment" OR "child custody" OR "annulment" OR "judicial separation" OR "bigamy") (site:thehindu.com OR site:indianexpress.com OR site:bbc.com)';

const RELEVANT_KEYWORDS = [
    "divorce", "relationship", "court", "alimony", "maintenance",
    "dowry", "custody", "annulment", "separation", "husband",
    "wife", "marriage", "family", "bigamy", "high court", "supreme court",
    "matrimonial", "living-in", "live-in", "partner", "spouse", "legal"
];

export async function fetchLiveNews() {
    try {
        const rssUrl = `${GOOGLE_NEWS_RSS}?q=${encodeURIComponent(QUERY)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok') {
            const items = data.items.map(item => {
                // Try to find an image in the description if enclosure/thumbnail is missing
                let imageUrl = item.enclosure?.link;

                // If rss2json returns thumbnail separately
                if (!imageUrl && item.thumbnail) {
                    imageUrl = item.thumbnail;
                }

                // If still no image, try to parse from description HTML
                if (!imageUrl && item.description) {
                    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) {
                        imageUrl = imgMatch[1];
                    }
                }

                return {
                    id: item.guid,
                    title: item.title,
                    excerpt: item.description ? item.description.replace(/<[^>]+>/g, '').substring(0, 120) + '...' : '',
                    category: 'Legal & Society',
                    image: imageUrl || null,
                    content: item.content,
                    link: item.link,
                    date: item.pubDate,
                    source: item.source || 'News'
                };
            });

            // Strict Filter: Ensure the news is actually relevant
            const filteredItems = items.filter(item => {
                const text = (item.title + " " + item.excerpt).toLowerCase();
                return RELEVANT_KEYWORDS.some(keyword => text.includes(keyword));
            });

            return filteredItems;

        } else {
            console.error("News fetch failed:", data.message);
            return [];
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}
