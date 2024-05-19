const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whatsupdog')
		.setDescription('Is the server up, dog?'),
	async execute(interaction) {
        const response = await fetch('https://7jlr35l22girapb6nkvurb7efu0ysoav.lambda-url.us-west-2.on.aws/').then(response => response.json());
		console.log(response);
        const reply = `The server minecraft server is ${response.status === 'up' ? `up!\nYou can find it at ${response.public_ip}!` : 'down! Use /updog to bring the server up! (Still in development)'}`
		await interaction.reply(reply);
	},
};