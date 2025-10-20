import { MarketingSessionData, MarketingCampaignData, MarketingEventData, MarketingConversionData, MarketingBenchmarkData } from './marketingDataParser';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class MarketingDataValidator {
  static validateSessionsData(sessions: MarketingSessionData[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Allow empty sessions data - it's optional
    if (sessions.length === 0) {
      return { isValid: true, errors, warnings };
    }

    sessions.forEach((session, index) => {
      // Validate date
      if (!session.date || isNaN(Date.parse(session.date))) {
        errors.push({
          field: `sessions[${index}].date`,
          message: 'Invalid date format',
          value: session.date
        });
      }

      // Validate numeric fields
      if (session.sessions < 0) {
        errors.push({
          field: `sessions[${index}].sessions`,
          message: 'Sessions cannot be negative',
          value: session.sessions
        });
      }

      if (session.users < 0) {
        errors.push({
          field: `sessions[${index}].users`,
          message: 'Users cannot be negative',
          value: session.users
        });
      }

      if (session.pageViews < 0) {
        errors.push({
          field: `sessions[${index}].pageViews`,
          message: 'Page views cannot be negative',
          value: session.pageViews
        });
      }

      if (session.avgSessionDuration < 0) {
        errors.push({
          field: `sessions[${index}].avgSessionDuration`,
          message: 'Average session duration cannot be negative',
          value: session.avgSessionDuration
        });
      }

      if (session.bounceRate < 0 || session.bounceRate > 100) {
        errors.push({
          field: `sessions[${index}].bounceRate`,
          message: 'Bounce rate must be between 0 and 100',
          value: session.bounceRate
        });
      }

      if (session.conversions < 0) {
        errors.push({
          field: `sessions[${index}].conversions`,
          message: 'Conversions cannot be negative',
          value: session.conversions
        });
      }

      // Warnings for unusual data
      if (session.users > session.sessions) {
        warnings.push({
          field: `sessions[${index}].users`,
          message: 'Users count is higher than sessions count',
          value: session.users
        });
      }

      if (session.bounceRate > 80) {
        warnings.push({
          field: `sessions[${index}].bounceRate`,
          message: 'High bounce rate detected',
          value: session.bounceRate
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateCampaignsData(campaigns: MarketingCampaignData[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Allow empty campaigns data - it's optional
    if (campaigns.length === 0) {
      return { isValid: true, errors, warnings };
    }

    campaigns.forEach((campaign, index) => {
      // Validate required fields
      if (!campaign.utmCampaign || campaign.utmCampaign.trim() === '') {
        errors.push({
          field: `campaigns[${index}].utmCampaign`,
          message: 'UTM campaign is required',
          value: campaign.utmCampaign
        });
      }

      if (!campaign.utmSource || campaign.utmSource.trim() === '') {
        errors.push({
          field: `campaigns[${index}].utmSource`,
          message: 'UTM source is required',
          value: campaign.utmSource
        });
      }

      // Validate dates
      if (!campaign.startDate || isNaN(Date.parse(campaign.startDate))) {
        errors.push({
          field: `campaigns[${index}].startDate`,
          message: 'Invalid start date format',
          value: campaign.startDate
        });
      }

      if (!campaign.endDate || isNaN(Date.parse(campaign.endDate))) {
        errors.push({
          field: `campaigns[${index}].endDate`,
          message: 'Invalid end date format',
          value: campaign.endDate
        });
      }

      // Validate date logic
      if (campaign.startDate && campaign.endDate && 
          new Date(campaign.startDate) > new Date(campaign.endDate)) {
        errors.push({
          field: `campaigns[${index}].endDate`,
          message: 'End date must be after start date',
          value: campaign.endDate
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateEventsData(events: MarketingEventData[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Allow empty events data - it's optional
    if (events.length === 0) {
      return { isValid: true, errors, warnings };
    }

    events.forEach((event, index) => {
      // Validate date
      if (!event.date || isNaN(Date.parse(event.date))) {
        errors.push({
          field: `events[${index}].date`,
          message: 'Invalid date format',
          value: event.date
        });
      }

      // Validate event name
      if (!event.eventName || event.eventName.trim() === '') {
        errors.push({
          field: `events[${index}].eventName`,
          message: 'Event name is required',
          value: event.eventName
        });
      }

      // Validate numeric fields
      if (event.sessionsWithEvent < 0) {
        errors.push({
          field: `events[${index}].sessionsWithEvent`,
          message: 'Sessions with event cannot be negative',
          value: event.sessionsWithEvent
        });
      }

      if (event.eventCount < 0) {
        errors.push({
          field: `events[${index}].eventCount`,
          message: 'Event count cannot be negative',
          value: event.eventCount
        });
      }

      // Warnings for unusual data
      if (event.eventCount < event.sessionsWithEvent) {
        warnings.push({
          field: `events[${index}].eventCount`,
          message: 'Event count is less than sessions with event',
          value: event.eventCount
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateConversionsData(conversions: MarketingConversionData[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Allow empty conversions data - it's optional
    if (conversions.length === 0) {
      return { isValid: true, errors, warnings };
    }

    conversions.forEach((conversion, index) => {
      // Validate date
      if (!conversion.date || isNaN(Date.parse(conversion.date))) {
        errors.push({
          field: `conversions[${index}].date`,
          message: 'Invalid date format',
          value: conversion.date
        });
      }

      // Validate conversion name
      if (!conversion.conversionName || conversion.conversionName.trim() === '') {
        errors.push({
          field: `conversions[${index}].conversionName`,
          message: 'Conversion name is required',
          value: conversion.conversionName
        });
      }

      // Validate numeric fields
      if (conversion.conversions < 0) {
        errors.push({
          field: `conversions[${index}].conversions`,
          message: 'Conversions cannot be negative',
          value: conversion.conversions
        });
      }

      if (conversion.revenue < 0) {
        errors.push({
          field: `conversions[${index}].revenue`,
          message: 'Revenue cannot be negative',
          value: conversion.revenue
        });
      }

      // Warnings for unusual data
      if (conversion.conversions > 0 && conversion.revenue === 0) {
        warnings.push({
          field: `conversions[${index}].revenue`,
          message: 'Conversions exist but revenue is zero',
          value: conversion.revenue
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateBenchmarksData(benchmarks: MarketingBenchmarkData[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Allow empty benchmarks data - it's optional
    if (benchmarks.length === 0) {
      return { isValid: true, errors, warnings };
    }

    benchmarks.forEach((benchmark, index) => {
      // Validate metric name
      if (!benchmark.metric || benchmark.metric.trim() === '') {
        errors.push({
          field: `benchmarks[${index}].metric`,
          message: 'Metric name is required',
          value: benchmark.metric
        });
      }

      // Validate target value
      if (benchmark.targetValue < 0) {
        errors.push({
          field: `benchmarks[${index}].targetValue`,
          message: 'Target value cannot be negative',
          value: benchmark.targetValue
        });
      }

      // Validate unit
      if (!benchmark.unit || benchmark.unit.trim() === '') {
        errors.push({
          field: `benchmarks[${index}].unit`,
          message: 'Unit is required',
          value: benchmark.unit
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateAllMarketingData(data: {
    sessions: MarketingSessionData[];
    campaigns: MarketingCampaignData[];
    events: MarketingEventData[];
    conversions: MarketingConversionData[];
    benchmarks: MarketingBenchmarkData[];
  }): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];

    // Check if we have any data at all
    const hasAnyData = data.sessions.length > 0 || data.campaigns.length > 0 || 
                      data.events.length > 0 || data.conversions.length > 0 || 
                      data.benchmarks.length > 0;

    if (!hasAnyData) {
      allErrors.push({
        field: 'data',
        message: 'No valid marketing data found in uploaded files'
      });
      return {
        isValid: false,
        errors: allErrors,
        warnings: allWarnings
      };
    }

    // Validate each data type only if it has data
    if (data.sessions.length > 0) {
      const sessionsResult = this.validateSessionsData(data.sessions);
      allErrors.push(...sessionsResult.errors);
      allWarnings.push(...sessionsResult.warnings);
    }

    if (data.campaigns.length > 0) {
      const campaignsResult = this.validateCampaignsData(data.campaigns);
      allErrors.push(...campaignsResult.errors);
      allWarnings.push(...campaignsResult.warnings);
    }

    if (data.events.length > 0) {
      const eventsResult = this.validateEventsData(data.events);
      allErrors.push(...eventsResult.errors);
      allWarnings.push(...eventsResult.warnings);
    }

    if (data.conversions.length > 0) {
      const conversionsResult = this.validateConversionsData(data.conversions);
      allErrors.push(...conversionsResult.errors);
      allWarnings.push(...conversionsResult.warnings);
    }

    if (data.benchmarks.length > 0) {
      const benchmarksResult = this.validateBenchmarksData(data.benchmarks);
      allErrors.push(...benchmarksResult.errors);
      allWarnings.push(...benchmarksResult.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}
