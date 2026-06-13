// test.js
require('dotenv').config();
const pool = require('./db');
const {saveCommit, getTodayCommits, buildSummary, fetchDailySummary} = require('./service');
const { generateSummary } = require('./services/aiservice');
const { Client, GatewayIntentBits,   ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle } = require('discord.js');
const cron = require('node-cron');
const summaryReal = '';
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

(async () => {

    const commits = await fetchDailySummary();

    const summaries = await generateSummary(commits);

    console.log(summaries);
})();

client.once("clientReady", async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});


cron.schedule('30 14 * * *', async () => {
    console.log("Time to fetch today's summaries");
    console.log("Fetching today's commits from the database...");
    const res = await fetchDailySummary();
    const summary = await generateSummary(res);

    const channel = await client.channels.fetch(process.env.CHANNEL_ID);

        const row = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder().
        setCustomId(`approve: ${res[0].repo}`).
        setLabel("Approve").
        setStyle(ButtonStyle.Success),

        new ButtonBuilder().
        setCustomId('skip').
        setLabel("Skip").
        setStyle(ButtonStyle.Danger)
    );
    await channel.send({
        content: summary,
        components: [row]
    });




});

client.on('interactionCreate', async(interaction)=> {

     if(!interaction.isButton()) return;
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        const summary = interaction.message.content;
       

            console.log(
        interaction.customId,
        interaction.message.id
    );
        console.log(`Button Clicked: ${interaction.customId}`);

     if(interaction.customId.startsWith('approve:')) {

        await pool.query(
            'INSERT INTO summaries (repo, summary) VALUES ($1, $2)',
            [interaction.customId.split(':')[1], summary]
        )
    
        await interaction.update({
            content: "✅ Summary approved and saved to the database!",
            components: []
        })
    }
else {
  
    await interaction.update({
        content: `skipped`,
        components: []
    });
}});