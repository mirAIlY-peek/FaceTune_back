const express = require('express');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEYS // This is also the default, can be omitted
});

router.post('/chat', async (req, res) => {
    const { prompt } = req.body;

    async function sendQueryApi(prompt) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4", // You can change this to other models like "gpt-4" if you have access
            messages: [{ role: "user", content: prompt }],
        });

        return completion.choices[0].message.content;
    }

    try {
        const result = await sendQueryApi(prompt);
        res.json({ response: result });
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
