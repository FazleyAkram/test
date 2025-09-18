import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketingDataParser } from '@/lib/marketingDataParser';
import { MarketingDataValidator } from '@/lib/marketingDataValidator';
import { MarketingAnalyticsCalculator } from '@/lib/marketingAnalytics';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files: { [key: string]: string } = {};
    
    // Extract CSV files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.name.endsWith('.csv')) {
        const csvText = await value.text();
        files[value.name] = csvText;
      }
    }
    
    if (Object.keys(files).length === 0) {
      return NextResponse.json(
        { error: 'No CSV files provided' },
        { status: 400 }
      );
    }
    
    // Parse all marketing data
    const parsedData = await MarketingDataParser.parseAllMarketingData(files);
    
    // Validate the data
    const validationResult = MarketingDataValidator.validateAllMarketingData(parsedData);
    
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          error: 'Data validation failed',
          details: validationResult.errors,
          warnings: validationResult.warnings
        },
        { status: 400 }
      );
    }
    
    // Create or find a data source for marketing imports
    let dataSource = await prisma.dataSource.findFirst({
      where: {
        name: 'Marketing CSV Import',
        provider: 'CUSTOM'
      }
    });

    if (!dataSource) {
      dataSource = await prisma.dataSource.create({
        data: {
          name: 'Marketing CSV Import',
          provider: 'CUSTOM',
          isActive: true,
          config: {},
          userId: 1, // Default user ID - you might want to get this from auth
          syncStatus: 'SUCCESS'
        }
      });
    }

    // Create data import record
    const dataImport = await prisma.dataImport.create({
      data: {
        sourceId: dataSource.id,
        fileName: Object.keys(files).join(', '),
        importType: 'MANUAL_UPLOAD',
        status: 'PROCESSING',
        recordCount: Object.values(parsedData).flat().length,
        metadata: {
          files: Object.keys(files),
          validationWarnings: validationResult.warnings.map(warning => ({
            message: warning.message,
            field: warning.field,
            value: warning.value
          }))
        }
      }
    });
    
    // Store data in database
    await prisma.$transaction(async (tx) => {
      // Store sessions data
      if (parsedData.sessions.length > 0) {
        await tx.marketingSession.createMany({
          data: parsedData.sessions.map(session => ({
            date: new Date(session.date),
            sessions: session.sessions,
            users: session.users,
            pageViews: session.pageViews,
            avgSessionDuration: session.avgSessionDuration,
            bounceRate: session.bounceRate,
            conversions: session.conversions,
            importId: dataImport.id
          }))
        });
      }
      
      // Store campaigns data
      if (parsedData.campaigns.length > 0) {
        await tx.marketingCampaign.createMany({
          data: parsedData.campaigns.map(campaign => ({
            utmCampaign: campaign.utmCampaign,
            utmSource: campaign.utmSource,
            startDate: new Date(campaign.startDate),
            endDate: new Date(campaign.endDate),
            importId: dataImport.id
          }))
        });
      }
      
      // Store events data
      if (parsedData.events.length > 0) {
        await tx.marketingEvent.createMany({
          data: parsedData.events.map(event => ({
            date: new Date(event.date),
            eventName: event.eventName,
            sessionsWithEvent: event.sessionsWithEvent,
            eventCount: event.eventCount,
            importId: dataImport.id
          }))
        });
      }
      
      // Store conversions data
      if (parsedData.conversions.length > 0) {
        await tx.marketingConversion.createMany({
          data: parsedData.conversions.map(conversion => ({
            date: new Date(conversion.date),
            conversionName: conversion.conversionName,
            conversions: conversion.conversions,
            revenue: conversion.revenue,
            importId: dataImport.id
          }))
        });
      }
      
      // Store benchmarks data
      if (parsedData.benchmarks.length > 0) {
        await tx.marketingBenchmark.createMany({
          data: parsedData.benchmarks.map(benchmark => ({
            metric: benchmark.metric,
            targetValue: benchmark.targetValue,
            unit: benchmark.unit,
            importId: dataImport.id
          }))
        });
      }
    });
    
    // Calculate analytics and store summary
    const metrics = MarketingAnalyticsCalculator.calculateMetrics(
      parsedData.sessions,
      parsedData.events,
      parsedData.conversions,
      parsedData.benchmarks,
      parsedData.campaigns
    );
    
    // Store analytics summary
    const analyticsData = parsedData.sessions.map(session => ({
      date: new Date(session.date),
      totalSessions: session.sessions,
      totalUsers: session.users,
      totalPageViews: session.pageViews,
      avgSessionDuration: session.avgSessionDuration,
      avgBounceRate: session.bounceRate,
      totalConversions: session.conversions,
      totalRevenue: parsedData.conversions
        .filter(c => c.date === session.date)
        .reduce((sum, c) => sum + c.revenue, 0),
      conversionRate: session.sessions > 0 ? (session.conversions / session.sessions) * 100 : 0,
      revenuePerSession: session.sessions > 0 ? 
        parsedData.conversions
          .filter(c => c.date === session.date)
          .reduce((sum, c) => sum + c.revenue, 0) / session.sessions : 0,
      importId: dataImport.id
    }));
    
    await prisma.marketingAnalytics.createMany({
      data: analyticsData
    });
    
    // Update import status
    await prisma.dataImport.update({
      where: { id: dataImport.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        recordCount: Object.values(parsedData).flat().length
      }
    });
    
    return NextResponse.json({
      success: true,
      importId: dataImport.id,
      recordCount: Object.values(parsedData).flat().length,
      metrics: {
        totalSessions: metrics.totalSessions,
        totalUsers: metrics.totalUsers,
        totalRevenue: metrics.totalRevenue,
        conversionRate: metrics.conversionRate
      },
      warnings: validationResult.warnings
    });
    
  } catch (error: any) {
    console.error('Marketing data import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import marketing data', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const imports = await prisma.dataImport.findMany({
      where: {
        importType: 'MANUAL_UPLOAD',
        fileName: { contains: 'csv' }
      },
      orderBy: { startTime: 'desc' },
      take: 10,
      include: {
        marketingSessions: { take: 1 },
        marketingCampaigns: { take: 1 },
        marketingEvents: { take: 1 },
        marketingConversions: { take: 1 },
        marketingBenchmarks: { take: 1 }
      }
    });
    
    return NextResponse.json({ imports });
  } catch (error) {
    console.error('Error fetching marketing imports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing imports' },
      { status: 500 }
    );
  }
}
