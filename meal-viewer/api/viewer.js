import { createGasReader, createViewerHandler } from './security.mjs';

const readViewerData = createGasReader({
  url: process.env.GAS_API_URL,
  secret: process.env.GAS_HMAC_SECRET
});

export default createViewerHandler({
  secret: process.env.SESSION_SECRET,
  readViewerData
});

