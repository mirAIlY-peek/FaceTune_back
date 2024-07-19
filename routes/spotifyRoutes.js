// // routes/spotifyRoutes.js
// const express = require('express');
// const axios = require('axios');
// const querystring = require('querystring');
// const router = express.Router();
//
// const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
// const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// const REDIRECT_URI = 'http://localhost:5173/search';
// const FRONTEND_URI = 'http://localhost:5173';
//
// router.get('/login', (req, res) => {
//     const scope = 'user-read-private user-read-email playlist-read-private';
//     const authQueryParameters = querystring.stringify({
//         response_type: 'code',
//         client_id: CLIENT_ID,
//         scope: scope,
//         redirect_uri: REDIRECT_URI,
//         state: 'some-state-of-my-choice'
//     });
//
//     res.redirect(`https://accounts.spotify.com/authorize?${authQueryParameters}`);
// });
//
// router.get('/spotify/callback', async (req, res) => {
//     const code = req.query.code;
//     const redirect_uri = 'http://localhost:5173/search'; // Убедитесь, что этот URI совпадает с вашим REDIRECT_URI
//
//     try {
//         const response = await axios.post('https://accounts.spotify.com/api/token', null, {
//             params: {
//                 grant_type: 'authorization_code',
//                 code: code,
//                 redirect_uri: redirect_uri,
//                 client_id: process.env.SPOTIFY_CLIENT_ID,
//                 client_secret: process.env.SPOTIFY_CLIENT_SECRET,
//             },
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//         });
//
//         const { access_token, refresh_token } = response.data;
//         res.json({ access_token, refresh_token });
//     } catch (error) {
//         console.error('Error fetching Spotify tokens:', error.response?.data || error.message);
//         res.status(500).json({ error: 'Failed to fetch Spotify tokens' });
//     }
// });
//
// router.get('/playlists', async (req, res) => {
//     const access_token = req.query.access_token;
//
//     try {
//         const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
//             headers: {
//                 'Authorization': `Bearer ${access_token}`
//             }
//         });
//
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch playlists' });
//     }
// });
//
// router.get('/search', async (req, res) => {
//     const access_token = req.query.access_token;
//     const query = req.query.query;
//
//     try {
//         const response = await axios.get(`https://api.spotify.com/v1/search?type=track&limit=10&q=${query}`, {
//             headers: {
//                 'Authorization': `Bearer ${access_token}`
//             }
//         });
//
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to search tracks' });
//     }
// });
//
// module.exports = router;
