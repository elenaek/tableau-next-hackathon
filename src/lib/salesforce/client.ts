interface SalesforceTokenResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

interface SalesforceConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  apiVersion?: string;
}

export class SalesforceClient {
  private config: SalesforceConfig;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: SalesforceConfig) {
    this.config = {
      apiVersion: 'v62.0',
      ...config,
    };
  }

  private async authenticate(): Promise<void> {
    // Prevent concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performAuthentication();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performAuthentication(): Promise<void> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce authentication failed:', errorText);
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data: SalesforceTokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.instanceUrl = data.instance_url;
    // Token expires in 2 hours, refresh after 1.5 hours
    this.tokenExpiry = Date.now() + 90 * 60 * 1000;
    console.log('Salesforce token refreshed successfully, expires at:', new Date(this.tokenExpiry).toISOString());
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    await this.ensureAuthenticated();

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401, token might be expired, try refreshing once
    if (response.status === 401) {
      console.log('Received 401, refreshing token and retrying...');
      this.accessToken = null; // Force refresh
      this.tokenExpiry = null;
      await this.authenticate();

      // Retry the request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
    }

    return response;
  }

  async query(soql: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const url = `${this.instanceUrl}/services/data/${this.config.apiVersion}/ssot/queryv2`;

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: soql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce query failed:', errorText);
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDataCloudData(endpoint: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const url = `${this.instanceUrl}/services/data/${this.config.apiVersion}/datacloud/${endpoint}`;

    const response = await this.makeAuthenticatedRequest(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Data Cloud request failed:', errorText);
      throw new Error(`Data Cloud request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async callAgentforceModel(prompt: string): Promise<unknown> {
    const url = `https://api.salesforce.com/einstein/platform/v1/models/sfdc_ai__DefaultGPT35Turbo/generations`;

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sfdc-app-context': 'EinsteinGPT',
        'x-client-feature-id': 'ai-platform-models-connected-app'
      },
      body: JSON.stringify({
        prompt: prompt
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agentforce Model API failed:', errorText);
      throw new Error(`Agentforce Model API failed: ${response.statusText}`);
    }

    return response.json();
  }
}