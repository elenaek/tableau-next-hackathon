import { SalesforceClient } from './client';

let client: SalesforceClient | null = null;

export function getSalesforceClient(): SalesforceClient {
  if (!client) {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const tokenUrl = process.env.SALESFORCE_TOKEN_URL || 'https://login.salesforce.com/services/oauth2/token';

    if (!clientId || !clientSecret) {
      throw new Error('Missing Salesforce OAuth2 credentials in environment variables');
    }

    client = new SalesforceClient({
      clientId,
      clientSecret,
      tokenUrl,
    });
  }

  return client;
}

export { SalesforceClient } from './client';