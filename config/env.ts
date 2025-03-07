import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    openaiApiKey: string;
    whatsappSessionDataPath: string;
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    whatsappSessionDataPath: process.env.WHATSAPP_SESSION_DATA_PATH ||
        path.join(process.cwd(), '.wwebjs_auth'),
};

// Validate required environment variables
const validateConfig = (): void => {
    if (!config.openaiApiKey) {
        throw new Error('OPENAI_API_KEY is required');
    }
};

export { config, validateConfig };
