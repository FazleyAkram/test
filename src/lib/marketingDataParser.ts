import { parse } from 'papaparse';

export interface MarketingSessionData {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversions: number;
}

export interface MarketingCampaignData {
  utmCampaign: string;
  utmSource: string;
  startDate: string;
  endDate: string;
}

export interface MarketingEventData {
  date: string;
  eventName: string;
  sessionsWithEvent: number;
  eventCount: number;
}

export interface MarketingConversionData {
  date: string;
  conversionName: string;
  conversions: number;
  revenue: number;
}

export interface MarketingBenchmarkData {
  metric: string;
  targetValue: number;
  unit: string;
}

export interface ParsedMarketingData {
  sessions: MarketingSessionData[];
  campaigns: MarketingCampaignData[];
  events: MarketingEventData[];
  conversions: MarketingConversionData[];
  benchmarks: MarketingBenchmarkData[];
}

export class MarketingDataParser {
  static async parseSessionsCSV(csvText: string): Promise<MarketingSessionData[]> {
    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            
            const sessions: MarketingSessionData[] = results.data.map((row: any) => ({
              date: row.date,
              sessions: parseInt(row.sessions) || 0,
              users: parseInt(row.users) || 0,
              pageViews: parseInt(row.page_views) || 0,
              avgSessionDuration: parseFloat(row.avg_session_duration) || 0,
              bounceRate: parseFloat(row.bounce_rate) || 0,
              conversions: parseInt(row.conversions) || 0,
            }));
            resolve(sessions);
          } catch (error) {
            reject(new Error(`Failed to parse sessions data: ${error}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  static async parseCampaignsCSV(csvText: string): Promise<MarketingCampaignData[]> {
    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const campaigns: MarketingCampaignData[] = results.data.map((row: any) => ({
              utmCampaign: row.utm_campaign,
              utmSource: row.utm_source,
              startDate: row.start_date,
              endDate: row.end_date,
            }));
            resolve(campaigns);
          } catch (error) {
            reject(new Error(`Failed to parse campaigns data: ${error}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  static async parseEventsCSV(csvText: string): Promise<MarketingEventData[]> {
    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const events: MarketingEventData[] = results.data.map((row: any) => ({
              date: row.date,
              eventName: row.event_name,
              sessionsWithEvent: parseInt(row.sessions_with_event) || 0,
              eventCount: parseInt(row.event_count) || 0,
            }));
            resolve(events);
          } catch (error) {
            reject(new Error(`Failed to parse events data: ${error}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  static async parseConversionsCSV(csvText: string): Promise<MarketingConversionData[]> {
    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const conversions: MarketingConversionData[] = results.data.map((row: any) => ({
              date: row.date,
              conversionName: row.conversion_name,
              conversions: parseInt(row.conversions) || 0,
              revenue: parseFloat(row.revenue) || 0,
            }));
            resolve(conversions);
          } catch (error) {
            reject(new Error(`Failed to parse conversions data: ${error}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  static async parseBenchmarksCSV(csvText: string): Promise<MarketingBenchmarkData[]> {
    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const benchmarks: MarketingBenchmarkData[] = results.data.map((row: any) => ({
              metric: row.metric,
              targetValue: parseFloat(row.target_value) || 0,
              unit: row.unit,
            }));
            resolve(benchmarks);
          } catch (error) {
            reject(new Error(`Failed to parse benchmarks data: ${error}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  static async parseAllMarketingData(files: { [key: string]: string }): Promise<ParsedMarketingData> {
    const result: ParsedMarketingData = {
      sessions: [],
      campaigns: [],
      events: [],
      conversions: [],
      benchmarks: []
    };

    try {
      if (files['sessions_daily.csv']) {
        result.sessions = await this.parseSessionsCSV(files['sessions_daily.csv']);
      }
      if (files['campaign_catalog.csv']) {
        result.campaigns = await this.parseCampaignsCSV(files['campaign_catalog.csv']);
      }
      if (files['events_daily.csv']) {
        result.events = await this.parseEventsCSV(files['events_daily.csv']);
      }
      if (files['conversions_daily.csv']) {
        result.conversions = await this.parseConversionsCSV(files['conversions_daily.csv']);
      }
      if (files['benchmarks.csv']) {
        result.benchmarks = await this.parseBenchmarksCSV(files['benchmarks.csv']);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to parse marketing data: ${error}`);
    }
  }
}
