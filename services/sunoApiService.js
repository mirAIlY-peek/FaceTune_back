// src/services/sunoApiService.js
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const UserAgent = require('user-agents');
const pino = require('pino');
const logger = pino();

const BASE_URL = 'https://studio-api.suno.ai';
const CLERK_BASE_URL = 'https://clerk.suno.com';
const DEFAULT_MODEL = "chirp-v3-5";

const sleep = (x, y) => {
    let timeout = x * 1000;
    if (y !== undefined && y !== x) {
        const min = Math.min(x, y);
        const max = Math.max(x, y);
        timeout = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
    }
    logger.info(`Sleeping for ${timeout / 1000} seconds`);
    return new Promise(resolve => setTimeout(resolve, timeout));
};

class SunoApiService {
    constructor(cookie) {
        const cookieJar = new CookieJar();
        const randomUserAgent = new UserAgent(/Chrome/).random().toString();
        this.client = wrapper(axios.create({
            jar: cookieJar,
            withCredentials: true,
            headers: {
                'User-Agent': randomUserAgent,
                'Cookie': cookie
            }
        }));
        this.client.interceptors.request.use((config) => {
            if (this.currentToken) {
                config.headers['Authorization'] = `Bearer ${this.currentToken}`;
            }
            return config;
        });
    }

    async init() {
        await this.getAuthToken();
        await this.keepAlive();
        return this;
    }

    async getAuthToken() {
        const getSessionUrl = `${CLERK_BASE_URL}/v1/client?_clerk_js_version=4.73.3`;
        const sessionResponse = await this.client.get(getSessionUrl);
        if (!sessionResponse?.data?.response?.['last_active_session_id']) {
            throw new Error("Failed to get session id, you may need to update the SUNO_COOKIE");
        }
        this.sid = sessionResponse.data.response['last_active_session_id'];
    }

    async keepAlive(isWait) {
        if (!this.sid) {
            throw new Error("Session ID is not set. Cannot renew token.");
        }
        const renewUrl = `${CLERK_BASE_URL}/v1/client/sessions/${this.sid}/tokens?_clerk_js_version==4.73.3`;
        const renewResponse = await this.client.post(renewUrl);
        logger.info("KeepAlive...\n");
        if (isWait) {
            await sleep(1, 2);
        }
        this.currentToken = renewResponse.data['jwt'];
    }

    async generate(prompt, make_instrumental = false, model, wait_audio = false) {
        await this.keepAlive(false);
        const startTime = Date.now();
        const audios = await this.generateSongs(prompt, false, undefined, undefined, make_instrumental, model, wait_audio);
        const costTime = Date.now() - startTime;
        logger.info("Generate Response:\n" + JSON.stringify(audios, null, 2));
        logger.info("Cost time: " + costTime);
        return audios;
    }

    async generateSongs(prompt, isCustom, tags, title, make_instrumental, model, wait_audio = false) {
        await this.keepAlive(false);
        const payload = {
            make_instrumental: make_instrumental === true,
            mv: model || DEFAULT_MODEL,
            prompt: ""
        };
        if (isCustom) {
            payload.tags = tags;
            payload.title = title;
            payload.prompt = prompt;
        } else {
            payload.gpt_description_prompt = prompt;
        }
        logger.info("generateSongs payload:\n" + JSON.stringify({
            prompt,
            isCustom,
            tags,
            title,
            make_instrumental,
            wait_audio,
            payload,
        }, null, 2));
        const response = await this.client.post(`${BASE_URL}/api/generate/v2/`, payload, { timeout: 10000 });
        logger.info("generateSongs Response:\n" + JSON.stringify(response.data, null, 2));
        if (response.status !== 200) {
            throw new Error("Error response:" + response.statusText);
        }
        const songIds = response.data['clips'].map(audio => audio.id);
        if (wait_audio) {
            const startTime = Date.now();
            let lastResponse = [];
            await sleep(5, 5);
            while (Date.now() - startTime < 100000) {
                const response = await this.get(songIds);
                const allCompleted = response.every(audio => audio.status === 'streaming' || audio.status === 'complete');
                const allError = response.every(audio => audio.status === 'error');
                if (allCompleted || allError) {
                    return response;
                }
                lastResponse = response;
                await sleep(3, 6);
                await this.keepAlive(true);
            }
            return lastResponse;
        } else {
            await this.keepAlive(true);
            return response.data['clips'].map(audio => ({
                id: audio.id,
                title: audio.title,
                image_url: audio.image_url,
                lyric: audio.metadata.prompt ? this.parseLyrics(audio.metadata.prompt) : "",
                audio_url: audio.audio_url,
                video_url: audio.video_url,
                created_at: audio.created_at,
                model_name: audio.model_name,
                status: audio.status,
                gpt_description_prompt: audio.metadata.gpt_description_prompt,
                prompt: audio.metadata.prompt,
                type: audio.metadata.type,
                tags: audio.metadata.tags,
                duration: audio.metadata.duration,
                error_message: audio.metadata.error_message,
            }));
        }
    }

    async get(songIds) {
        await this.keepAlive(false);
        let url = `${BASE_URL}/api/feed/`;
        if (songIds) {
            url = `${url}?ids=${songIds.join(',')}`;
        }
        logger.info("Get audio status: " + url);
        const response = await this.client.get(url, { timeout: 3000 });
        const audios = response.data;
        return audios.map(audio => ({
            id: audio.id,
            title: audio.title,
            image_url: audio.image_url,
            lyric: audio.metadata.prompt ? this.parseLyrics(audio.metadata.prompt) : "",
            audio_url: audio.audio_url,
            video_url: audio.video_url,
            created_at: audio.created_at,
            model_name: audio.model_name,
            status: audio.status,
            gpt_description_prompt: audio.metadata.gpt_description_prompt,
            prompt: audio.metadata.prompt,
            type: audio.metadata.type,
            tags: audio.metadata.tags,
            duration: audio.metadata.duration,
            error_message: audio.metadata.error_message,
        }));
    }

    parseLyrics(prompt) {
        const lines = prompt.split('\n').filter(line => line.trim() !== '');
        return lines.join('\n');
    }
}

module.exports = new SunoApiService(process.env.SUNO_COOKIE || '');
