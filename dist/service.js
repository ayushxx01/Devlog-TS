"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCommit = saveCommit;
exports.getTodayCommits = getTodayCommits;
exports.buildSummary = buildSummary;
exports.fetchDailySummary = fetchDailySummary;
const db_1 = __importDefault(require("./db"));
async function saveCommit(repo, message, commitTime) {
    await db_1.default.query('INSERT INTO commits (repo, message, commit_time) VALUES ($1, $2, $3)', [repo, message, commitTime]);
}
async function getTodayCommits() {
    const result = await db_1.default.query('SELECT repo,message,commit_time FROM commits WHERE commit_time >= CURRENT_DATE ORDER BY commit_time DESC');
    return result.rows;
}
function buildSummary(commits) {
    const grouped = {};
    commits.forEach(commit => {
        if (!grouped[commit.repo]) {
            grouped[commit.repo] = [];
        }
        grouped[commit.repo].push(commit.message);
    });
    let result = '';
    for (const [repo, messages] of Object.entries(grouped)) {
        result += `Repository: ${repo}\n`;
        messages.forEach(msg => {
            result += `- ${msg}\n`;
        });
        result += '\n';
    }
    return result;
}
async function fetchDailySummary() {
    const result = await getTodayCommits();
    const summary = buildSummary(result);
    return summary;
}
//# sourceMappingURL=service.js.map