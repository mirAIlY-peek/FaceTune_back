// src/controllers/generateController.js
const sunoApiService = require('../services/sunoApiService');
const DEFAULT_MODEL = "chirp-v3-5";

const generateAudio = async (req, res) => {
    try {
        const { prompt, make_instrumental, model, wait_audio } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const audioInfo = await sunoApiService.generate(prompt, Boolean(make_instrumental), model || DEFAULT_MODEL, Boolean(wait_audio));
        console.log('Generated audio info:', audioInfo);
        res.status(200).json(audioInfo);
    } catch (error) {
        console.error('Error generating custom audio:', error.response?.data);
        if (error.response?.status === 402) {
            return res.status(402).json({ error: error.response.data.detail });
        }
        res.status(500).json({ error: 'Internal server error: ' + error.response?.data.detail });
    }
};

module.exports = {
    generateAudio,
};
