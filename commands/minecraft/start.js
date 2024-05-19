const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updog')
        .setDescription("What's updog? The server, that is!"),
    async execute(interaction) {
        // Defer the reply to allow time for server startup and IP retrieval
        await interaction.reply('Starting the server... (This can take a few minutes)');
        
        try {
            // Make the API call to start the server and get the IP address
            const response = await fetch('https://5bz6qzi222gwpvjypdhutf6j4e0yyrly.lambda-url.us-west-2.on.aws/')
                .then(response => response.json());
            console.log(response);
            
            // Construct the reply with the server IP address
            const reply = `The Minecraft server is up! (It can take ~20 seconds after this message before it becomes joinable)\nYou can find it at ${response.public_ip}!`;
            
            // Edit the initial reply to include the IP address
            await interaction.editReply(reply);
        } catch (error) {
            // Handle any errors that occur during the API call
            await interaction.editReply('Failed to start the server or retrieve the IP address. Please try again later.');
        }
    },
};
