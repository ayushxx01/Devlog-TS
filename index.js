require('dotenv').config();
const pool = require('./db');
const {saveCommit, getTodayCommits, buildSummary, fetchDailySummary} = require('./service');
const { generateSummary } = require('./src/services/aiservice');
const { Client, GatewayIntentBits,   ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle } = require('discord.js');
const cron = require('node-cron');
const summaryReal = '';
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});


client.once("clientReady", async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});


cron.schedule('00 18 * * *', async () => {
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

// express configs
const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

app.post('/githook', async (req,res)=> {
 try {
        console.log("🔥🔥🔥 WEBHOOK HIT 🔥🔥🔥");
    const {repository, head_commit} = req.body;
    const repoName = repository.full_name;
    const commitHash = head_commit.id;
    const message = head_commit.message;
    const commitTime = head_commit.timestamp;

    await saveCommit(repoName, commitHash, message, commitTime);
    res.status(200).send("Commit received");
 } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
 }
});

app.get('/', (req,res)=> {
    console.log("devlog running on render");
        res.status(200).send("devlog running on render");
})

app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on port ${process.env.PORT}`);
})

app.get('/callback', (req, res) => {
    res.send('X OAuth callback');
});

app.get('/blogs', async (req,res)=> {
    
        const page = Number(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT * FROM summaries ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.json(result.rows);
});

client.login(process.env.DISCORD_TOKEN);