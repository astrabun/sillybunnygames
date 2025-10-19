async function generateWikiSpeedrunPath(difficulty = 3000, numberArticles = 2) {
	const generateWikiSpeedrunPathUrl = 'https://wikispeedruns.com/api/generator/prompt?difficulty=3000&num_articles=2';
	const response = await fetch(generateWikiSpeedrunPathUrl);
	const data = await response.json();
	return data as string[];
}

type WikipediaParseResponse = {
	parse: {
		title: string;
		pageid?: number;
		redirects?: Array<{from: string; to: string}>;
		displaytitle?: string;
	};
};

async function resolveWikipediaRedirects(page: string) {
	const wikipediaRedirectResolveUrl = new URL('https://en.wikipedia.org/w/api.php');
	wikipediaRedirectResolveUrl.searchParams.append('redirects', '1');
	wikipediaRedirectResolveUrl.searchParams.append('format', 'json');
	wikipediaRedirectResolveUrl.searchParams.append('origin', '*');
	wikipediaRedirectResolveUrl.searchParams.append('action', 'parse');
	wikipediaRedirectResolveUrl.searchParams.append('prop', 'displaytitle');
	wikipediaRedirectResolveUrl.searchParams.append('page', page);
	const response = await fetch(wikipediaRedirectResolveUrl);
	const data = await response.json() as WikipediaParseResponse;
	return data;
}

function generateQuickPlayUrl(start: string, end: string) {
	const url = new URL('https://wikispeedruns.com/play/quick_play');
	url.searchParams.append('prompt_start', start);
	url.searchParams.append('prompt_end', end);
	url.searchParams.append('lang', 'en');
	return url.toString();
}

export {
	type WikipediaParseResponse,
	generateWikiSpeedrunPath,
	resolveWikipediaRedirects,
	generateQuickPlayUrl,
};
