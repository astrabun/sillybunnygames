import process from 'node:process';
import dotenvx from '@dotenvx/dotenvx';
import {
	REST, Routes, Client, Events, GatewayIntentBits,
} from 'discord.js';
import {commands} from './Commands/index.js';

dotenvx.config();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? ''; // eslint-disable-line @typescript-eslint/naming-convention
const TOKEN = process.env.DISCORD_TOKEN ?? ''; // eslint-disable-line @typescript-eslint/naming-convention

const commandsData = Object.values(commands).map(command =>
	// Ensure we send plain JSON (SlashCommandBuilder has toJSON)
	typeof command.data?.toJSON === 'function' ? command.data.toJSON() : command.data);

// Add a simple /help command description to the deployed commands list
const helpCommandData = {name: 'help', description: 'List available commands'};
commandsData.push(helpCommandData);

const rest = new REST({version: '10'}).setToken(TOKEN);

type DeployCommandsProps = {
	guildId: string;
};

export async function deployCommands({guildId}: DeployCommandsProps) {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, guildId),
			{
				body: commandsData,
			},
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
}

try {
	console.log('Started refreshing application (/) commands.');
	await rest.put(Routes.applicationCommands(CLIENT_ID), {body: commandsData});
	console.log('Successfully reloaded application (/) commands.');
} catch (error) {
	console.error(error);
}

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages]});

client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on('guildCreate', async guild => {
	await deployCommands({guildId: guild.id});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isCommand()) {
		return;
	}

	const {commandName} = interaction;

	// Handle the /help command
	if (commandName === 'help') {
		const list = commandsData.map(cmd => `/${cmd.name} — ${cmd.description ?? ''}`);
		await interaction.reply({content: `Available commands:\n${list.join('\n')}`, flags: ['Ephemeral']});
		return;
	}

	if (commands[commandName as keyof typeof commands]) {
		await commands[commandName as keyof typeof commands].execute(interaction);
	}
});

await client.login(TOKEN);
