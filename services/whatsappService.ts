import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { config } from '../config/env';
import logger from '../utils/logger';
import { MessageData } from '../types';
import path from 'path';

class WhatsAppService {
    private client: Client;
    private isReady: boolean = false;
    private messageHandler?: (messageData: MessageData) => Promise<void>;

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: config.whatsappSessionDataPath
            }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.initializeClient();
    }

    private initializeClient(): void {
        this.client.on('qr', (qr) => {
            logger.info('QR Code received, scan to login:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.isReady = true;
            logger.info('WhatsApp client is ready!');
        });

        this.client.on('authenticated', () => {
            logger.info('WhatsApp client authenticated');
        });

        this.client.on('auth_failure', (msg) => {
            logger.error(`WhatsApp authentication failed: ${msg}`);
        });

        this.client.on('disconnected', (reason) => {
            this.isReady = false;
            logger.warn(`WhatsApp client disconnected: ${reason}`);
        });

        this.client.on('message', async (message: Message) => {
            try {
                if (this.messageHandler) {
                    const chat = await message.getChat();

                    const messageData: MessageData = {
                        from: message.from,
                        body: message.body,
                        isGroup: chat.isGroup,
                        groupName: chat.isGroup ? chat.name : undefined,
                        timestamp: message.timestamp
                    };

                    await this.messageHandler(messageData);
                }
            } catch (error) {
                logger.error({ error }, 'Error processing incoming message');
            }
        });
    }

    async initialize(): Promise<void> {
        try {
            logger.info('Initializing WhatsApp client...');
            await this.client.initialize();
        } catch (error) {
            logger.error({ error }, 'Failed to initialize WhatsApp client');
            throw error;
        }
    }

    setMessageHandler(handler: (messageData: MessageData) => Promise<void>): void {
        this.messageHandler = handler;
        logger.debug('Message handler set');
    }

    async sendMessage(to: string, text: string): Promise<void> {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            logger.debug(`Sending message to ${to}: ${text.substring(0, 50)}...`);
            await this.client.sendMessage(to, text);
            logger.debug(`Message sent to ${to}`);
        } catch (error) {
            logger.error({ error, to }, 'Failed to send WhatsApp message');
            throw error;
        }
    }
}

export default new WhatsAppService();
