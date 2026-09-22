import 'dotenv/config';
import {fetchDailySummary, saveCommit} from './service';
import {generateSummary} from './services/aiservice';
import { Client, GatewayIntentBits,   ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle, TextChannel} from 'discord.js';
import {schedule} from 'node-cron';
import  express  from 'express';
import cors from 'cors';
import pool from './db';
const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async() => {
    if (!client.user) {
        console.warn('Client ready but user is null');
        return;
    }
    console.log(`logged in as ${client.user.tag}`);
});

schedule('00 18 * * *', async()=> {
    
    try {
        console.log("Time to fetch today's summaries");
    console.log("Fetching today's commits from the database...");

    const summaries = await fetchDailySummary();
    const formattedSummaries = await generateSummary(summaries);

     const channel = await client.channels.fetch(process.env.CHANNEL_ID!);

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
        new ButtonBuilder().
        setCustomId(`approve`).
        setLabel("Approve").
        setStyle(ButtonStyle.Success),

        new ButtonBuilder().
        setCustomId('skip').
        setLabel("Skip").
        setStyle(ButtonStyle.Danger)
    );

    const truncated = formattedSummaries.length > 3900 
    ? formattedSummaries.slice(0, 3900) + '\n...(truncated)' 
    : formattedSummaries;

    if (!channel || !(channel instanceof TextChannel)) {
        return;
    }
    else {
        await channel.send({
        content: truncated,
        components: [row]
    });
    }
    } catch (erros){
        console.error("Error fetching or sending summaries:", erros);
    }
   
});

client.on('interactionCreate', async(interaction)=> {

     if(!interaction.isButton()) return;
        const channel = await client.channels.fetch(process.env.CHANNEL_ID!);
        const summary = interaction.message.content;
       

            console.log(
        interaction.customId,
        interaction.message.id
    );
        console.log(`Button Clicked: ${interaction.customId}`);

     if(interaction.customId === 'approve') {

        await pool.query(
            'INSERT INTO summaries (summary) VALUES ($1)',
            [summary]
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

app.post('/githook', async (req, res) => {
    try {
        console.log("🔥🔥🔥 WEBHOOK HIT 🔥🔥🔥");
        const { repository, head_commit } = req.body;

        if (!head_commit) {
            console.log("No head_commit in payload, skipping");
            res.status(200).send("No commit to process");
            return;
        }
        const repoName = repository.full_name;
        const message = head_commit.message;
        const commitTime = head_commit.timestamp;
        const commitHash = head_commit.id;

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