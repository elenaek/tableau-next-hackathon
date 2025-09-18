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

  constructor(config: SalesforceConfig) {
    this.config = {
      apiVersion: 'v62.0',
      ...config,
    };
    console.log(this.config);
  }

  private async authenticate(): Promise<void> {
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
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data: SalesforceTokenResponse = await response.json();
    console.log(data);
    this.accessToken = data.access_token;
    this.instanceUrl = data.instance_url;
    // Token expires in 2 hours, refresh after 1.5 hours
    this.tokenExpiry = Date.now() + 90 * 60 * 1000;
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
    console.log("Authenticating", this.accessToken, this.tokenExpiry, Date.now());
  }

  async query(soql: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const url = `${this.instanceUrl}/services/data/${this.config.apiVersion}/query?q=${encodeURIComponent(soql)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDataCloudData(endpoint: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const url = `${this.instanceUrl}/services/data/${this.config.apiVersion}/datacloud/${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Data Cloud request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async callAgentforceModel(prompt: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const url = `https://api.salesforce.com/einstein/platform/v1/models/sfdc_ai__DefaultGPT35Turbo/generations`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'x-sfdc-app-context': 'EinsteinGPT',
        'x-client-feature-id': 'ai-platform-models-connected-app'
      },
      body: JSON.stringify({
        prompt: prompt
      }),
    });

    if (!response.ok) {
      throw new Error(`Agentforce Model API failed: ${response.statusText}`);
    }

    return response.json();
  }
}