import { MessageData } from '../types';
import whatsappService from '../services/whatsappService';
import openaiService from '../services/openaiService';
import logger from '../utils/logger';

const COMMAND_PREFIX = '!chatgpt';

class MessageController {
    async initialize(): Promise<void> {
        // Set up the message handler
        whatsappService.setMessageHandler(this.handleIncomingMessage.bind(this));

        // Initialize WhatsApp service
        await whatsappService.initialize();

        logger.info('MessageController initialized');
    }

    private async handleIncomingMessage(messageData: MessageData): Promise<void> {
        const { body, from, isGroup } = messageData;

        // Check if the message starts with the command prefix
        if (!body.trim().toLowerCase().startsWith(COMMAND_PREFIX)) {
            return;
        }

        try {
            // Extract the actual prompt (remove the command prefix)
            const prompt = body.substring(COMMAND_PREFIX.length).trim();

            if (!prompt) {
                await whatsappService.sendMessage(
                    from,
                    'Please provide a question or prompt after !chatgpt'
                );
                return;
            }

            // Inform the user that we're processing their request
            await whatsappService.sendMessage(
                from,
                '⏳ Processing your request, please wait...'
            );

            // Get response from OpenAI
            const response = await openaiService.generateResponse(prompt);

            // Send the response back to the user
            await whatsappService.sendMessage(from, response.text);

            // Log the interaction
            logger.info({
                from,
                isGroup,
                promptLength: prompt.length,
                responseLength: response.text.length,
                tokens: response.usage,
            }, 'Processed ChatGPT request');

        } catch (error) {
            logger.error({ error, from }, 'Error processing ChatGPT request');

            // Send error message to user
            await whatsappService.sendMessage(
                from,
                'Sorry, I encountered an error while processing your request. Please try again later.'
            );
        }
    }
}

export default new MessageController();
