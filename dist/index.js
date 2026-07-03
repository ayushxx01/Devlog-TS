"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const service_1 = require("./service");
const aiservice_1 = require("./services/aiservice");
const discord_js_1 = require("discord.js");
const node_cron_1 = __importDefault(require("node-cron"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds]
});
client.once("ready", async () => {
    if (!client.user) {
        console.warn('Client ready but user is null');
        return;
    }
    console.log(`logged in as ${client.user.tag}`);
});
node_cron_1.default.schedule('00 18 * * * ', async () => {
    console.log("Time to fetch today's summaries");
    console.log("Fetching today's commits from the database...");
    const summaries = await (0, service_1.fetchDailySummary)();
    const formattedSummaries = await (0, aiservice_1.generateSummary)(summaries);
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder().
        setCustomId(`approve`).
        setLabel("Approve").
        setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().
        setCustomId('skip').
        setLabel("Skip").
        setStyle(discord_js_1.ButtonStyle.Danger));
    const truncated = formattedSummaries.length > 3900
        ? formattedSummaries.slice(0, 3900) + '\n...(truncated)'
        : formattedSummaries;
    if (!channel || !(channel instanceof discord_js_1.TextChannel)) {
        return;
    }
    else {
        await channel.send({
            content: truncated,
            components: [row]
        });
    }
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton())
        return;
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const summary = interaction.message.content;
    console.log(interaction.customId, interaction.message.id);
    console.log(`Button Clicked: ${interaction.customId}`);
    if (interaction.customId === 'approve') {
        await db_1.default.query('INSERT INTO summaries (summary) VALUES ($1)', [summary]);
        await interaction.update({
            content: "✅ Summary approved and saved to the database!",
            components: []
        });
    }
    else {
        await interaction.update({
            content: `skipped`,
            components: []
        });
    }
});
app.post('/githook', async (req, res) => {
    try {
        console.log("🔥🔥🔥 WEBHOOK HIT 🔥🔥🔥");
        const { repository, head_commit } = req.body;
        const repoName = repository.full_name;
        const message = head_commit.message;
        const commitTime = head_commit.timestamp;
        await (0, service_1.saveCommit)(repoName, message, commitTime);
        res.status(200).send("Commit received");
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.get('/', (req, res) => {
    console.log("devlog running on render");
    res.status(200).send("devlog running on render");
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
app.get('/callback', (req, res) => {
    res.send('X OAuth callback');
});
app.get('/blogs', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const result = await db_1.default.query(`SELECT * FROM summaries ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json(result.rows);
});
client.login(process.env.DISCORD_TOKEN);
//# sourceMappingURL=index.js.map