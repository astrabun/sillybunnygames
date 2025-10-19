import {type Interaction, type ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';
import {
	generateQuickPlayUrl, generateWikiSpeedrunPath, resolveWikipediaRedirects, type WikipediaParseResponse,
} from '../wikispeedruns/index.js';

function extractTitleFromInput(input: string): string {
	// If it's a URL, try to extract the page title (/wiki/... or ?title=...)
	try {
		const url = new URL(input);

		// /wiki/Title
		if (url.pathname.includes('/wiki/')) {
			const seg = url.pathname.split('/wiki/')[1] ?? '';
			return decodeURIComponent(seg).replaceAll('_', ' ');
		}

		// ?title=Title (index.php style)
		const titleParameter = url.searchParams.get('title');
		if (titleParameter) {
			return decodeURIComponent(titleParameter).replaceAll('_', ' ');
		}

		// Fallback to last path segment
		const parts = url.pathname.split('/').filter(Boolean);
		if (parts.length > 0) {
			const last = parts.at(-1) ?? '';
			return decodeURIComponent(last).replaceAll('_', ' ');
		}
	} catch {
		// Not a URL — treat as plain title
	}

	return input;
}

async function createGameCustom(startArg?: string, endArg?: string) {
	let startInput = startArg;
	let endInput = endArg;

	// If either missing, get random path(s) and use the missing ones
	if (!startInput || !endInput) {
		const randomPath = await generateWikiSpeedrunPath();
		startInput ??= randomPath[0] ?? '';
		endInput ??= randomPath[1] ?? '';
	}

	const startCandidate = extractTitleFromInput(startInput);
	const endCandidate = extractTitleFromInput(endInput);

	// Resolve redirects, with safe fallbacks if resolution fails
	let startPoint: WikipediaParseResponse;
	let endPoint: WikipediaParseResponse;

	try {
		startPoint = await resolveWikipediaRedirects(startCandidate);
	} catch {
		const randomPath = await generateWikiSpeedrunPath();
		startPoint = await resolveWikipediaRedirects(randomPath[0] ?? '');
	}

	try {
		endPoint = await resolveWikipediaRedirects(endCandidate);
	} catch {
		const randomPath = await generateWikiSpeedrunPath();
		endPoint = await resolveWikipediaRedirects(randomPath[1] ?? '');
	}

	const startPointTitle = startPoint.parse.title;
	const endPointTitle = endPoint.parse.title;

	const playUrl = generateQuickPlayUrl(startPointTitle, endPointTitle);
	return {
		message: `Try to get from ${startPointTitle} to ${endPointTitle} both as fast as possible and with the fewest amount of page visits!`,
		link: playUrl,
	};
}

export const data = new SlashCommandBuilder()
	.setName('playwikigame')
	.setDescription('Start a wiki speedrun. Optional start and/or end article (title or URL).')
	.addStringOption(opt => opt.setName('start').setDescription('Start article title or URL').setRequired(false))
	.addStringOption(opt => opt.setName('end').setDescription('End article title or URL').setRequired(false));

export async function execute(interaction: Interaction) {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const chat = interaction as ChatInputCommandInteraction; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
	const start = chat.options.getString('start') ?? undefined;
	const end = chat.options.getString('end') ?? undefined;
	const {message, link} = await createGameCustom(start, end);
	return chat.reply(`${message}\n\n${link}`);
}
