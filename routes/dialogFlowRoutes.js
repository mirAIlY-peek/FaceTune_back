// const express = require('express');
// const dotenv = require('dotenv');
// const dialogflow = require('dialogflow');
// const uuid = require('uuid');
//
//
//
// dotenv.config();
//
// const mira = express.Router();
//
//
//
// const {OpenAI} = require('openai');
//
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });
//
//
// const session_id = uuid.v4()
//
// const sessionClient = new dialogflow.SessionsClient({
//     key: process.env.DIALOGFLOW_API_KEY
// });
//
//
// const sessionPath = sessionClient.sessionPath(process.env.PROJECT_ID, session_id);
//
// mira.post('/dialog',async(req,res)=>{
//     const {prompt} = req.body;
//
//
//     async function sendQueryToDialogflow(prompt) {
//         const request = {
//             session: sessionPath,
//             queryInput: {
//                 text: {
//                     text: prompt,
//                     languageCode: 'ru'
//                 }
//             }
//         };
//
//         const responses = await sessionClient.detectIntent(request);
//         const result = responses[0].queryResult;
//         return result;
//     }
//
//     try {
//         const result = await sendQueryToDialogflow(prompt);
//         res.json({ response: result.fulfillmentText });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// })
//
// module.exports = mira
//
