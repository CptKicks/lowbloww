import OpenAI from 'openai';
import { config } from '../config/env';
import logger from '../utils/logger';
import { OpenAIResponse } from '../types';

class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey,
        });
    }

    async generateResponse(prompt: string): Promise<OpenAIResponse> {
        try {
            logger.debug(`Sending prompt to OpenAI: ${prompt.substring(0, 100)}...`);

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant responding to questions from WhatsApp users. Keep responses concise and helpful.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            const result: OpenAIResponse = {
                text: response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
                usage: {
                    promptTokens: response.usage?.prompt_tokens || 0,
                    completionTokens: response.usage?.completion_tokens || 0,
                    totalTokens: response.usage?.total_tokens || 0,
                }
            };

            logger.debug({
                message: 'Received response from OpenAI',
                tokens: result.usage,
            });

            return result;
        } catch (error) {
            logger.error({ error }, 'Error generating response from OpenAI');
            throw error;
        }
    }
}

export default new OpenAIService();
