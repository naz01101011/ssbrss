import { createClient } from '@sanity/client';
import groq from 'groq';
import RSS from 'rss';

const sanity = createClient({
  projectId: 'w58sh5v7',
  dataset: 'production',
	useCdn: true,
});

export async function GET() {
  const feed = new RSS({
    title: 'Stiri de Sibiu', // The title of our rss feed
    site_url: 'https://stiridesibiu.ro', // Our base site url
    feed_url: 'https://rss.stiridesibiu.ro/feed.xml', // This links to our endpoint
  });

  const query = groq`
        *[_type == 'post']{
            title,
            excerpt,
            publishedAt,
            "slug": slug.current,
            "image": mainImage -> url,
        } | order(publishedAt desc) | [0...100]
    `;
  
  const posts = await sanity.fetch(query);

	for (const post of posts)
		feed.item({
			title: post.title,
			description: post.excerpt[0].children[0].text,
			date: post.publishedAt,
			url: `https://stiridesibiu.ro/stiri/${post.slug}`,
		});

	return new Response(feed.xml({ indent: true }), {
		status: 200,
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}

