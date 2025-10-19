import {type CommandInteraction, SlashCommandBuilder} from 'discord.js';
import {generateQuickPlayUrl, generateWikiSpeedrunPath, resolveWikipediaRedirects} from '../wikispeedruns/index.js';

async function createGame() {
	const randomPath = await generateWikiSpeedrunPath();
	const startPoint = await resolveWikipediaRedirects(randomPath[0] ?? '');
	const endPoint = await resolveWikipediaRedirects(randomPath[1] ?? '');
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
	.setDescription('Try to get from one article to another as quickly and in as few clicks as possible!');

export async function execute(interaction: CommandInteraction) {
	const {message, link} = await createGame();
	return interaction.reply(`${message}\n\n${link}`);
}
