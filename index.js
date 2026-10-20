const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Hier werden die aktuellen IDs zwischengespeichert
let serverData = {
    placeId: null,
    jobId: null
};

// --- WEBSERVER (Für Roblox & Hosting) ---
app.get('/get-target', (req, res) => {
    res.json(serverData);
});

app.get('/', (req, res) => {
    res.send('Bot läuft und ist bereit!');
});

app.listen(PORT, () => {
    console.log(`Webserver läuft auf Port ${PORT}`);
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
    console.log(`Eingeloggt als ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    // Ignoriere Bots und Nachrichten ohne das Präfix
    if (message.author.bot || !message.content.startsWith('!set')) return;

    // Beispiel für den Befehl: !set <placeId> <jobId>
    const args = message.content.slice(4).trim().split(' ');
    const placeId = args[0];
    const jobId = args[1];

    if (!placeId || !jobId) {
        return message.reply('Bitte gib PlaceId und JobId an! Beispiel: `!set 12345678 deine-job-id`');
    }

    // Werte speichern
    serverData.placeId = placeId;
    serverData.jobId = jobId;

    message.reply(`Erfolgreich aktualisiert!\n**PlaceId:** ${placeId}\n**JobId:** ${jobId}`);
});

// WICHTIG: Der Token wird hier sicher über die Umgebungsvariable geladen (nicht im Code eintragen!)
client.login(process.env.DISCORD_TOKEN);