import {OAuth2Client} from 'google-auth-library';
import {createDashboardGasClient,createSessionHandler} from './security.mjs';
const google=new OAuth2Client();
export default createSessionHandler({
  secret:process.env.SESSION_SECRET,
  clientId:process.env.GOOGLE_OAUTH_CLIENT_ID,
  callGas:createDashboardGasClient({url:process.env.GAS_API_URL,secret:process.env.GAS_DASHBOARD_HMAC_SECRET}),
  verifyGoogle:async credential=>(await google.verifyIdToken({idToken:credential,audience:process.env.GOOGLE_OAUTH_CLIENT_ID})).getPayload()
});
