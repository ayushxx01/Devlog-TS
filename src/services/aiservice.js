const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();
console.log(process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function generateSummary(commits) {


const prompt = `You are a developer journal generator.

Given the following Git commits grouped by repository, write a concise engineering summary for each repository.

Rules:
- One section per repository
- 1-3 sentences of technical summary only
- Ignore: test, testing, typo, docs, formatting, dependency bumps
- No business impact, no speculation, no invented context
- Use developer-focused language

Commit Data:
${commits}

Output Format:
## Repository Name
Summary here.`;
console.log(commits);
console.log("Generating summary with Gemini API...");
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    console.log(response);

    return response.text;
}

module.exports = {
    generateSummary
};