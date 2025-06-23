const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // store in .env
});
const openai = new OpenAIApi(configuration);

router.post('/autocomplete', async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 50,
    });

    res.json({ suggestion: completion.data.choices[0].text.trim() });
  } catch (err) {
    res.status(500).json({ error: 'AI suggestion failed', detail: err });
  }
});

module.exports = router;
