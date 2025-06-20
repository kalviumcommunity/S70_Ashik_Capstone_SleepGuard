// langchain/sleepAdvisor.js

const { OpenAI } = require("langchain/llms/openai");
require("dotenv").config();

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
});

async function getSleepAdvice(userNote) {
  const prompt = `Analyze this sleep log and provide tips for better sleep:\n\n${userNote}`;
  const response = await model.call(prompt);
  return response;
}

module.exports = { getSleepAdvice };
