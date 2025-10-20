import { prisma } from '@/lib/prisma';

export interface GADataSource {
  id: string;
  name: string;
  config: any;
  userId: number;
}

export class GoogleAnalyticsService {

  // -------- Aggregation helpers (period-based) --------
  private static determineAggregationPeriod(startDate: string, endDate: string): 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
    if (diffDays <= 90) return 'DAILY';
    if (diffDays <= 365) return 'WEEKLY';
    if (diffDays <= 730) return 'MONTHLY';
    return 'QUARTERLY';
  }

  private static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day; // start on Sunday
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0,0,0,0);
    return start;
  }

  private static getWeekEnd(date: Date): Date {
    const start = this.getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    return end;
  }

  private static getMonthStart(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setHours(0,0,0,0);
    return d;
  }

  private static getMonthEnd(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    d.setHours(23,59,59,999);
    return d;
  }

  private static getQuarterStart(date: Date): Date {
    const quarter = Math.floor(date.getMonth() / 3);
    const d = new Date(date.getFullYear(), quarter * 3, 1);
    d.setHours(0,0,0,0);
    return d;
  }

  private static getQuarterEnd(date: Date): Date {
    const quarter = Math.floor(date.getMonth() / 3);
    const d = new Date(date.getFullYear(), quarter * 3 + 3, 0);
    d.setHours(23,59,59,999);
    return d;
  }

  private static getPeriodKey(date: Date, periodType: 'DAILY'|'WEEKLY'|'MONTHLY'|'QUARTERLY'): string {
    if (periodType === 'DAILY') return date.toISOString().slice(0,10);
    if (periodType === 'WEEKLY') return `W:${this.getWeekStart(date).toISOString().slice(0,10)}`;
    if (periodType === 'MONTHLY') return `M:${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
    // QUARTERLY
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q:${date.getFullYear()}-Q${q}`;
  }

  private static aggregateSessions(daily: any[], periodType: 'DAILY'|'WEEKLY'|'MONTHLY'|'QUARTERLY') {
    const map = new Map<string, any>();
    daily.forEach((d) => {
      const date = new Date(d.date);
      const key = this.getPeriodKey(date, periodType);
      if (!map.has(key)) {
        let periodStart: Date, periodEnd: Date;
        if (periodType === 'DAILY') { periodStart = new Date(date); periodEnd = new Date(date); }
        else if (periodType === 'WEEKLY') { periodStart = this.getWeekStart(date); periodEnd = this.getWeekEnd(date); }
        else if (periodType === 'MONTHLY') { periodStart = this.getMonthStart(date); periodEnd = this.getMonthEnd(date); }
        else { periodStart = this.getQuarterStart(date); periodEnd = this.getQuarterEnd(date); }
        map.set(key, { periodStart, periodEnd, periodType, sessions: 0, users: 0, pageViews: 0, avgSessionDuration: 0, bounceRate: 0, conversions: 0, dayCount: 0 });
      }
      const agg = map.get(key)!;
      agg.sessions += d.sessions || 0;
      agg.users += d.users || 0;
      agg.pageViews += d.pageViews || 0;
      agg.avgSessionDuration += d.avgSessionDuration || 0;
      agg.bounceRate += d.bounceRate || 0;
      agg.conversions += d.conversions || 0;
      agg.dayCount += 1;
    });
    return Array.from(map.values()).map(p => ({
      ...p,
      // Store a representative date for non-null schema field; use periodStart
      date: p.periodStart,
      avgSessionDuration: p.dayCount ? p.avgSessionDuration / p.dayCount : 0,
      bounceRate: p.dayCount ? p.bounceRate / p.dayCount : 0,
    }));
  }

  private static aggregateEvents(daily: any[], periodType: 'DAILY'|'WEEKLY'|'MONTHLY'|'QUARTERLY') {
    const map = new Map<string, any>();
    daily.forEach((d) => {
      const date = new Date(d.date);
      const key = this.getPeriodKey(date, periodType) + `|${d.eventName}`;
      if (!map.has(key)) {
        let periodStart: Date, periodEnd: Date;
        if (periodType === 'DAILY') { periodStart = new Date(date); periodEnd = new Date(date); }
        else if (periodType === 'WEEKLY') { periodStart = this.getWeekStart(date); periodEnd = this.getWeekEnd(date); }
        else if (periodType === 'MONTHLY') { periodStart = this.getMonthStart(date); periodEnd = this.getMonthEnd(date); }
        else { periodStart = this.getQuarterStart(date); periodEnd = this.getQuarterEnd(date); }
        map.set(key, { periodStart, periodEnd, periodType, date: periodStart, eventName: d.eventName, sessionsWithEvent: 0, eventCount: 0 });
      }
      const agg = map.get(key)!;
      agg.sessionsWithEvent += d.sessionsWithEvent || 0;
      agg.eventCount += d.eventCount || 0;
    });
    return Array.from(map.values());
  }

  private static aggregateConversions(daily: any[], periodType: 'DAILY'|'WEEKLY'|'MONTHLY'|'QUARTERLY') {
    const map = new Map<string, any>();
    daily.forEach((d) => {
      const date = new Date(d.date);
      const key = this.getPeriodKey(date, periodType) + `|${d.conversionName}`;
      if (!map.has(key)) {
        let periodStart: Date, periodEnd: Date;
        if (periodType === 'DAILY') { periodStart = new Date(date); periodEnd = new Date(date); }
        else if (periodType === 'WEEKLY') { periodStart = this.getWeekStart(date); periodEnd = this.getWeekEnd(date); }
        else if (periodType === 'MONTHLY') { periodStart = this.getMonthStart(date); periodEnd = this.getMonthEnd(date); }
        else { periodStart = this.getQuarterStart(date); periodEnd = this.getQuarterEnd(date); }
        map.set(key, { periodStart, periodEnd, periodType, date: periodStart, conversionName: d.conversionName, conversions: 0, revenue: 0 });
      }
      const agg = map.get(key)!;
      agg.conversions += d.conversions || 0;
      agg.revenue += d.revenue || 0;
    });
    return Array.from(map.values());
  }
  static async getDataSource(userId: number): Promise<GADataSource | null> {
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        userId,
        provider: 'GOOGLE_ANALYTICS',
        isActive: true
      }
    });

    return dataSource as GADataSource | null;
  }

  static async refreshTokenIfNeeded(dataSource: GADataSource): Promise<string> {
    const tokenExpiry = new Date(dataSource.config.tokenExpiry);
    const now = new Date();
    
    // Refresh token if it expires in the next 5 minutes
    if (tokenExpiry.getTime() - now.getTime() < 5 * 60 * 1000) {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: dataSource.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const tokens = await response.json();
      
      if (response.ok) {
        // Update the data source with new tokens
        await prisma.dataSource.update({
          where: { id: dataSource.id },
          data: {
            config: {
              ...dataSource.config,
              accessToken: tokens.access_token,
              tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            }
          }
        });

        return tokens.access_token;
      }
    }

    return dataSource.config.accessToken;
  }

  static async fetchAnalyticsData(userId: number, propertyId: string, startDate: string, endDate: string) {
    const dataSource = await this.getDataSource(userId);
    if (!dataSource) {
      throw new Error('Google Analytics not connected');
    }

    const accessToken = await this.refreshTokenIfNeeded(dataSource);

    // Auto-detect/normalize property ID if requested or malformed
    let effectivePropertyId = propertyId;
    const needsAutoDetect = !effectivePropertyId || effectivePropertyId === 'auto-detect' || effectivePropertyId.startsWith('accounts/') || !/^\d+$/.test(effectivePropertyId);
    if (needsAutoDetect) {
      const accountsResp = await fetch('https://analyticsadmin.googleapis.com/v1beta/accounts', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!accountsResp.ok) {
        const t = await accountsResp.text();
        throw new Error(`Failed to list GA accounts: ${t}`);
      }
      const accountsData = await accountsResp.json();
      const firstAccount = accountsData.accounts?.[0]?.name; // e.g. accounts/123
      if (!firstAccount) throw new Error('No GA accounts found');

      // Try standard properties listing under the account
      let firstPropertyName: string | undefined;
      {
        const propsResp = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${firstAccount}/properties`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (propsResp.ok) {
          const propsData = await propsResp.json();
          firstPropertyName = propsData.properties?.[0]?.name;
        } else {
          // Fallback: use global properties endpoint with parent filter (some projects return 404 on the nested path)
          const altResp = await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:${encodeURIComponent(firstAccount)}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          if (altResp.ok) {
            const altData = await altResp.json();
            firstPropertyName = altData.properties?.[0]?.name;
          } else {
            const t = await altResp.text();
            throw new Error(`Failed to list GA properties: ${t}`);
          }
        }
      }

      if (!firstPropertyName) throw new Error('No GA4 properties found');
      effectivePropertyId = firstPropertyName.replace(/^properties\//, '');
    }

    // Helper to fetch JSON with descriptive error on non-OK or non-JSON bodies
    const fetchJsonOrThrow = async (url: string, init: any, label: string) => {
      const resp = await fetch(url, init);
      const contentType = resp.headers.get('content-type') || '';
      if (!resp.ok) {
        const text = await resp.text().catch(() => '<no body>');
        throw new Error(`${label} failed (${resp.status} ${resp.statusText}): ${text}`);
      }
      if (!contentType.includes('application/json')) {
        const text = await resp.text().catch(() => '<no body>');
        throw new Error(`${label} returned non-JSON (${resp.status}): ${text}`);
      }
      return resp.json();
    };

    // Fetch sessions data
    const sessionsData = await fetchJsonOrThrow(
      `https://analyticsdata.googleapis.com/v1beta/properties/${effectivePropertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
            { name: 'conversions' }
          ]
        })
      },
      'Sessions report'
    );

    // Fetch events data
    const eventsData = await fetchJsonOrThrow(
      `https://analyticsdata.googleapis.com/v1beta/properties/${effectivePropertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [
            { name: 'date' },
            { name: 'eventName' }
          ],
          metrics: [
            { name: 'eventCount' },
            { name: 'sessions' }
          ]
        })
      },
      'Events report'
    );

    // Fetch conversions data (prefer purchaseRevenue, fallback to totalRevenue)
    const conversionsData = await fetchJsonOrThrow(
      `https://analyticsdata.googleapis.com/v1beta/properties/${effectivePropertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [ { name: 'date' }, { name: 'eventName' } ],
          metrics: [ { name: 'conversions' }, { name: 'purchaseRevenue' }, { name: 'totalRevenue' } ],
          dimensionFilter: {
            filter: {
              fieldName: 'isConversionEvent',
              stringFilter: { matchType: 'EXACT', value: 'true' }
            }
          }
        })
      },
      'Conversions report'
    );

    return {
      sessions: this.parseSessionsData(sessionsData),
      events: this.parseEventsData(eventsData),
      conversions: this.parseConversionsData(conversionsData)
    };
  }

  private static parseSessionsData(data: any) {
    if (!data.rows) return [];
    const parseDate = (d: string) => (d?.length === 8 ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : d);
    return data.rows.map((row: any) => ({
      date: parseDate(row.dimensionValues[0].value),
      sessions: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
      pageViews: parseInt(row.metricValues[2].value),
      avgSessionDuration: parseFloat(row.metricValues[3].value),
      bounceRate: parseFloat(row.metricValues[4].value) * 100, // Convert to percentage
      conversions: parseInt(row.metricValues[5].value)
    }));
  }

  private static parseEventsData(data: any) {
    if (!data.rows) return [];
    const parseDate = (d: string) => (d?.length === 8 ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : d);
    return data.rows.map((row: any) => ({
      date: parseDate(row.dimensionValues[0].value),
      eventName: row.dimensionValues[1].value,
      eventCount: parseInt(row.metricValues[0].value),
      sessionsWithEvent: parseInt(row.metricValues[1].value)
    }));
  }

  private static parseConversionsData(data: any) {
    if (!data.rows) return [];
    const parseDate = (d: string) => (d?.length === 8 ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : d);
    return data.rows.map((row: any) => ({
      date: parseDate(row.dimensionValues[0].value),
      conversionName: row.dimensionValues[1].value,
      conversions: parseInt(row.metricValues[0].value),
      // metricValues[1] = purchaseRevenue (preferred), metricValues[2] = totalRevenue (fallback)
      revenue: (parseFloat(row.metricValues?.[1]?.value) || 0) || (parseFloat(row.metricValues?.[2]?.value) || 0)
    }));
  }

  static async syncDataToDatabase(userId: number, propertyId: string, startDate: string, endDate: string) {
    const dataSource = await this.getDataSource(userId);
    if (!dataSource) {
      throw new Error('Google Analytics not connected');
    }

    const analyticsData = await this.fetchAnalyticsData(userId, propertyId, startDate, endDate);
    const periodType = this.determineAggregationPeriod(startDate, endDate);
    const aggregatedSessions = this.aggregateSessions(analyticsData.sessions, periodType);
    const aggregatedEvents = this.aggregateEvents(analyticsData.events, periodType);
    const aggregatedConversions = this.aggregateConversions(analyticsData.conversions, periodType);

    // Create data import record
    const dataImport = await prisma.dataImport.create({
      data: {
        sourceId: dataSource.id,
        fileName: `Google Analytics - ${propertyId}`,
        importType: 'GOOGLE_ANALYTICS',
        status: 'PROCESSING',
        startTime: new Date(),
        recordCount: analyticsData.sessions.length + analyticsData.events.length + analyticsData.conversions.length,
        metadata: {
          propertyId,
          startDate,
          endDate,
          source: 'Google Analytics API'
        }
      }
    });

    // Store data in database
    await prisma.$transaction(async (tx) => {
      // Store sessions data (aggregated)
      if (aggregatedSessions.length > 0) {
        await tx.marketingSession.createMany({
          data: aggregatedSessions.map((p: any) => ({
            date: new Date(p.date),
            periodStart: new Date(p.periodStart),
            periodEnd: new Date(p.periodEnd),
            periodType: p.periodType,
            sessions: p.sessions,
            users: p.users,
            pageViews: p.pageViews,
            avgSessionDuration: p.avgSessionDuration,
            bounceRate: p.bounceRate,
            conversions: p.conversions,
            importId: dataImport.id
          }))
        });
      }

      // Store events data (aggregated)
      if (aggregatedEvents.length > 0) {
        await tx.marketingEvent.createMany({
          data: aggregatedEvents.map((e: any) => ({
            date: new Date(e.date),
            periodStart: new Date(e.periodStart),
            periodEnd: new Date(e.periodEnd),
            periodType: e.periodType,
            eventName: e.eventName,
            sessionsWithEvent: e.sessionsWithEvent,
            eventCount: e.eventCount,
            importId: dataImport.id
          }))
        });
      }

      // Store conversions data (aggregated)
      if (aggregatedConversions.length > 0) {
        await tx.marketingConversion.createMany({
          data: aggregatedConversions.map((c: any) => ({
            date: new Date(c.date),
            periodStart: new Date(c.periodStart),
            periodEnd: new Date(c.periodEnd),
            periodType: c.periodType,
            conversionName: c.conversionName,
            conversions: c.conversions,
            revenue: c.revenue,
            importId: dataImport.id
          }))
        });
      }
    });

    // Update import status
    await prisma.dataImport.update({
      where: { id: dataImport.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date()
      }
    });

    return dataImport.id;
  }
}

