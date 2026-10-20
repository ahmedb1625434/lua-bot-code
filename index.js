const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Temporary storage for the server IDs
let serverData = {
    placeId: null,
    jobId: null
};

// --- WEBSERVER (For Roblox & Hosting) ---
app.get('/get-target', (req, res) => {
    res.json(serverData);
});

app.get('/', (req, res) => {
    res.send('Bot is running and ready!');
});

app.listen(PORT, () => {
    console.log(`Webserver running on port ${PORT}`);
});

// --- DISCORD BOT ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    // Ignore bots and messages without the !set prefix
    if (message.author.bot || !message.content.startsWith('!set')) return;

    // Command format: !set <placeId> <jobId>
    const args = message.content.slice(4).trim().split(' ');
    const placeId = args[0];
    const jobId = args[1];

    if (!placeId || !jobId) {
        return message.reply('Please provide PlaceId and JobId! Example: `!set 12345678 your-job-id`');
    }

    // Save values
    serverData.placeId = placeId;
    serverData.jobId = jobId;

    message.reply(`Successfully updated!\n**PlaceId:** ${placeId}\n**JobId:** ${jobId}`);
});

// Securely loads the token from the Render environment variable
client.login(process.env.DISCORD_TOKEN);