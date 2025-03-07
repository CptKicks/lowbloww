import express from 'express';
import { config, validateConfig } from './config/env';
import logger from './utils/logger';
import messageController from './controllers/messageController';

async function startServer() {
    try {
        // Validate required environment variables
        validateConfig();

        // Initialize the Express app
        const app = express();

        // Basic middleware
        app.use(express.json());

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // Start the server
        const server = app.listen(config.port, () => {
            logger.info(`Server started on port ${config.port} in ${config.nodeEnv} mode`);
        });

        // Initialize message controller and WhatsApp integration
        await messageController.initialize();
        logger.info('WhatsApp bot initialized successfully');

        // Handle graceful shutdown
        const shutdownGracefully = async () => {
            logger.info('Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdownGracefully);
        process.on('SIGINT', shutdownGracefully);

    } catch (error) {
        logger.error({ error }, 'Failed to start the application');
        process.exit(1);
    }
}

startServer();
