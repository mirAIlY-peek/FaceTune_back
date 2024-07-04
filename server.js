const express = require('express');
const cors = require('cors');
const pino = require('pino');
const dotenv = require('dotenv');
const { newSunoApi } = require("./SunoApi.js");
const { DEFAULT_MODEL } = require('/utils');
const router = require('./routes/chatRoutes');


dotenv.config();
const logger = pino();

const app = express();
app.use(express.json());
app.use(cors());

if (!process.env.SUNO_COOKIE) {
    console.log("Environment does not contain SUNO_COOKIE.", process.env)
}

const sunoApi = newSunoApi(process.env.SUNO_COOKIE || '');

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, make_instrumental, model, wait_audio } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const audioInfo = await (await sunoApi).generate(prompt, Boolean(make_instrumental), model || DEFAULT_MODEL, Boolean(wait_audio));
        console.log('Generated audio info:', audioInfo);
        res.status(200).json(audioInfo);
    } catch (error) {
        console.error('Error generating custom audio:', error.response?.data);
        if (error.response?.status === 402) {
            return res.status(402).json({ error: error.response.data.detail });
        }
        res.status(500).json({ error: 'Internal server error: ' + error.response?.data.detail });
    }
});

app.options('/api/generate', (req, res) => {
    res.set(corsHeaders).sendStatus(200);
});

app.use('/', router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
