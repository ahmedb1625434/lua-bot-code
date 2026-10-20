const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Temporary storage for the server IDs
let serverData = {
    placeId: null,
    jobId: null
};

// --- WEBSERVER (For Roblox) ---
app.get('/get-target', (req, res) => {
    res.json(serverData);
});

app.get('/', (req, res) => {
    res.send('Bot is running!');
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

// Command '!set' to send the menu with the button
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!set') {
        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('⚙️ Server Settings')
            .setDescription(`**Current Settings:**\n• **Place ID:** ${serverData.placeId ? `\`${serverData.placeId}\`` : 'Not set yet'}\n• **Job ID:** ${serverData.jobId ? `\`${serverData.jobId}\`` : 'Not set yet'}\n\nClick the button below to change the IDs.`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_modal')
                .setLabel('Set / Change IDs')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// Handle interactions (Buttons and Modals)
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'open_modal') {
        const modal = new ModalBuilder()
            .setCustomId('id_modal')
            .setTitle('Change Server IDs');

        const placeIdInput = new TextInputBuilder()
            .setCustomId('placeId_input')
            .setLabel('Place ID')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter Place ID here...')
            .setRequired(true);

        const jobIdInput = new TextInputBuilder()
            .setCustomId('jobId_input')
            .setLabel('Job ID')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter Job ID here...')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(placeIdInput),
            new ActionRowBuilder().addComponents(jobIdInput)
        );

        await interaction.showModal(modal);
    } else if (interaction.isModalSubmit() && interaction.customId === 'id_modal') {
        serverData.placeId = interaction.fields.getTextInputValue('placeId_input');
        serverData.jobId = interaction.fields.getTextInputValue('jobId_input');

        await interaction.reply({ content: `✅ Successfully updated!\n**Place ID:** ${serverData.placeId}\n**Job ID:** ${serverData.jobId}`, ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);