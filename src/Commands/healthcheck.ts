import {type CommandInteraction, SlashCommandBuilder} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('healthcheck')
	.setDescription('Replies with OK to show it\'s online!');

export async function execute(interaction: CommandInteraction) {
	return interaction.reply('OK');
}
