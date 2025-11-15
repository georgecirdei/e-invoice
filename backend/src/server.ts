import dotenv from 'dotenv';
import app from './app';
import logger from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 8000;

// Note: Payload CMS is installed but needs additional configuration
// For now, running without Payload to keep your working platform stable
// Payload can be fully integrated in a dedicated session

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api/v1`);
  logger.info(`ℹ️  Payload CMS: Ready for integration (see PAYLOAD_CMS_*.md guides)`);
});

