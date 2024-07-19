const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
    token: process.env.ACCESS_TOKEN_COPHERE,
});

router.post('/chat', async (req, res) => {
    const { prompt } = req.body;

    async function sendQueryApi(prompt) {
        const response = await cohere.chat({
            message: prompt,
            connectors: [{ id: 'web-search' }],
        });

        return response.text;
    }

    try {
        const result = await sendQueryApi(prompt);
        res.json({ response: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/classify-genres', async (req, res) => {
    const { genres } = req.body;

    const prompt = `Classify each of the following sets of music genres into one of these moods: happy, sad, disgust, neutral, fear, surprise, angry. Return only the mood for each entry.

Examples:
1. Rock, Alternative: neutral
2. Classical, Orchestral: neutral
3. Pop, Dance: happy
4. Metal, Hard Rock: angry
5. Blues, Jazz: sad

Now classify these:
${genres.map((genre, index) => `${index + 1}. ${genre}`).join('\n')}`;

    try {
        const response = await cohere.chat({
            message: prompt,
            connectors: [{ id: 'web-search' }],
        });

        // Разбор ответа для получения классификаций
        const classifications = response.text.split('\n').map(line => {
            const match = line.match(/\d+\.\s*(.+):\s*(\w+)/);
            return match ? match[2].toLowerCase() : 'neutral';
        });

        res.json({ classifications });
    } catch (error) {
        console.error('Error classifying genres:', error);
        res.status(500).json({ error: 'Error classifying genres' });
    }
});

module.exports = router;
