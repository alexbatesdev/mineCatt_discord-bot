const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription("Stop the minecraft server. (Don't abuse this command)"),
    async execute(interaction) {
        // Defer the reply to allow time for server startup and IP retrieval
        await interaction.reply('Stopping the server... (This takes about 40 seconds)');
        
        try {
            // Make the API call to start the server and get the IP address
            const response = await fetch('https://dts45otpkwa5mer2ahsbvgnnj40rgvwc.lambda-url.us-west-2.on.aws/')
                .then(response => response.json());
            console.log(response);
            
            // Construct the reply with the server IP address
            const reply = `The Minecraft server has been shut down. My wallet thanks thee.`;
            
            // Edit the initial reply to include the IP address
            await interaction.editReply(reply);
        } catch (error) {
            // Handle any errors that occur during the API call
            await interaction.editReply('Failed to stop the server. Please notify Alex.');
        }
    },
};
