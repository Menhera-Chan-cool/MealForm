import { createDashboardGasClient, createDashboardHandler, createGasReader, dashboardConfiguration } from './security.mjs';

const callGas = createDashboardGasClient({
  url: process.env.GAS_API_URL,
  secret: process.env.GAS_DASHBOARD_HMAC_SECRET
});

export default createDashboardHandler({
  secret: process.env.SESSION_SECRET,
  callGas,
  readViewerData: createGasReader({ url: process.env.GAS_API_URL, secret: process.env.GAS_HMAC_SECRET }),
  configuration: dashboardConfiguration(process.env)
});
