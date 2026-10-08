import { createGasReader, createHistoryHandler } from './security.mjs';

export default createHistoryHandler({
  secret: process.env.SESSION_SECRET,
  readViewerData: createGasReader({ url: process.env.GAS_API_URL, secret: process.env.GAS_HMAC_SECRET })
});
