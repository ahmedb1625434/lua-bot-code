const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Hier werden die Ziel-IDs gespeichert
let currentTarget = {
    placeId: "Noch nicht gesetzt",
    jobId: "Noch nicht gesetzt",
    updatedBy: "Niemand"
};

// API Endpunkt für Roblox / Executor
app.get('/get-target', (req, res) => {
    res.json(currentTarget);
});

app.listen(PORT, () => console.log(`[HTTP Server] API läuft auf Port ${PORT}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`[Discord Bot] Eingeloggt als ${client.user.tag}`);
});

// Nachricht auswerten (!set)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!set') {
        const embed = new EmbedBuilder()
            .setTitle("⚙️ Server-Einstellungen")
            .setDescription(`**Aktuelle Einstellungen:**\n• **Place ID:** \`${currentTarget.placeId}\`\n• **Job ID:** \`${currentTarget.jobId}\`\n\nKlicke auf den Button unten, um die IDs zu ändern.`)
            .setColor(0x3498db);

        const btn = new ButtonBuilder()
            .setCustomId('open_set_modal')
            .setLabel('IDs eintragen / ändern')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(btn);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// Interaktionen verarbeiten (Button & Modal)
client.on('interactionCreate', async (interaction) => {
    
    // 1. Wenn der Button geklickt wird -> Formular anzeigen
    if (interaction.isButton() && interaction.customId === 'open_set_modal') {
        const modal = new ModalBuilder()
            .setCustomId('set_ids_modal')
            .setTitle('Place & Job ID festlegen');

        const placeInput = new TextInputBuilder()
            .setCustomId('input_place')
            .setLabel('Place ID')
            .setStyle(TextInputStyle.Short)
            .setValue(currentTarget.placeId !== "Noch nicht gesetzt" ? currentTarget.placeId : '')
            .setRequired(true);

        const jobInput = new TextInputBuilder()
            .setCustomId('input_job')
            .setLabel('Job ID')
            .setStyle(TextInputStyle.Short)
            .setValue(currentTarget.jobId !== "Noch nicht gesetzt" ? currentTarget.jobId : '')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(placeInput),
            new ActionRowBuilder().addComponents(jobInput)
        );

        await interaction.showModal(modal);
    }

    // 2. Wenn das Formular abgeschickt wird -> Daten speichern
    if (interaction.isModalSubmit() && interaction.customId === 'set_ids_modal') {
        const newPlaceId = interaction.fields.getTextInputValue('input_place');
        const newJobId = interaction.fields.getTextInputValue('input_job');

        currentTarget.placeId = newPlaceId;
        currentTarget.jobId = newJobId;
        currentTarget.updatedBy = interaction.user.tag;

        const successEmbed = new EmbedBuilder()
            .setTitle("✅ Erfolgreich aktualisiert!")
            .addFields(
                { name: "Place ID", value: `\`${newPlaceId}\``, inline: true },
                { name: "Job ID", value: `\`${newJobId}\``, inline: true }
            )
            .setFooter({ text: `Geändert von ${interaction.user.tag}` })
            .setColor(0x2ecc71);

        await interaction.reply({ embeds: [successEmbed], ephemeral: false });
    }
});

client.login('MTU1NTU3OTIwNjIzMjk3MzQ3Mw.G9mvUp.IqdmQlysxseWYDyxCd0uwgSFgbQjE5Y6lBOzXM');