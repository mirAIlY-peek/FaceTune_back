const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const { CohereClient } = require('cohere-ai');


const cohere = new CohereClient({
    token: process.env.ACCESS_TOKEN_COPHERE,
});



router.post('/chat',async(req,res)=>{
    const {prompt} = req.body;


    async function sendQueryApi(prompt) {
        const response = await cohere.chat({

            message: prompt,
            // perform web search before answering the question. You can also use your own custom connector.
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
})



module.exports = router

