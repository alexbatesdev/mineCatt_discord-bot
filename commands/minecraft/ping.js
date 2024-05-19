// This code was written by an AI assistant.
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whatsupdog')
		.setDescription('Is the server up, dog?'),
	async execute(interaction) {
		try {
			// Defer the reply to give us more time to process
			await interaction.deferReply();

			// Fetch the server status
			const response = await fetch('https://7jlr35l22girapb6nkvurb7efu0ysoav.lambda-url.us-west-2.on.aws/')
				.then(response => response.json());

			// Construct the reply based on the server status
			const reply = response.status === 'up' 
				? `The server is up!\nYou can find it at ${response.public_ip}!` 
				: 'The server is down! Use /updog to bring the server up!';

			// Send the reply
			await interaction.editReply(reply);
		} catch (error) {
			console.error(error);
			await interaction.editReply('There was an error and now the dog is in a quantum superposition of up and down.');
		}
	},
};
// This code was written by an AI assistant.
