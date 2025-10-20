import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketingDataParser } from '@/lib/marketingDataParser';
import { MarketingDataValidator } from '@/lib/marketingDataValidator';
import { MarketingAnalyticsCalculator } from '@/lib/marketingAnalytics';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Marketing import request received for user:', user.id);

    const formData = await request.formData();
    const files: { [key: string]: string } = {};
    
    // Extract CSV files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.name.endsWith('.csv')) {
        const csvText = await value.text();
        files[value.name] = csvText;
        console.log('Processed file:', value.name, 'size:', csvText.length);
      }
    }
    
    console.log('Total files processed:', Object.keys(files).length);
    console.log('File names:', Object.keys(files));
    
    if (Object.keys(files).length === 0) {
      return NextResponse.json(
        { error: 'No CSV files provided' },
        { status: 400 }
      );
    }
    
    // Parse all marketing data
    console.log('Starting data parsing...');
    const parsedData = await MarketingDataParser.parseAllMarketingData(files);
    console.log('Data parsed successfully:', {
      sessions: parsedData.sessions.length,
      campaigns: parsedData.campaigns.length,
      events: parsedData.events.length,
      conversions: parsedData.conversions.length,
      benchmarks: parsedData.benchmarks.length
    });
    
    // Validate the data
    console.log('Starting data validation...');
    const validationResult = MarketingDataValidator.validateAllMarketingData(parsedData);
    console.log('Validation result:', {
      isValid: validationResult.isValid,
      errors: validationResult.errors.length,
      warnings: validationResult.warnings.length
    });
    
    if (!validationResult.isValid) {
      console.log('Validation failed:', validationResult.errors);
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
        provider: 'CUSTOM',
        userId: user.id
      }
    });

    if (!dataSource) {
      dataSource = await prisma.dataSource.create({
        data: {
          name: 'Marketing CSV Import',
          provider: 'CUSTOM',
          isActive: true,
          config: {},
          userId: user.id,
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
    }, {
      timeout: 30000, // 30 seconds
      maxWait:10000, // 10 seconds max wait
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
    // Auth: return imports only for the current user
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imports = await prisma.dataImport.findMany({
      where: { dataSource: { userId: user.id } }, // include ALL import types (CSV + GA)
      orderBy: { startTime: 'desc' },
      take: 20,
      include: {
        dataSource: { select: { provider: true, name: true } },
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

export async function DELETE(request: NextRequest) {
  try {
    // Auth: delete imports only for the current user (all sources: CSV + GA)
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all imports for this user regardless of importType
    const imports = await prisma.dataImport.findMany({
      where: { dataSource: { userId: user.id } },
      select: { id: true }
    });

    const importIds = imports.map((i) => i.id);
    if (importIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    // Delete children first to avoid orphans
    await prisma.$transaction([
      prisma.marketingAnalytics.deleteMany({ where: { importId: { in: importIds } } }),
      prisma.marketingBenchmark.deleteMany({ where: { importId: { in: importIds } } }),
      prisma.marketingCampaign.deleteMany({ where: { importId: { in: importIds } } }),
      prisma.marketingConversion.deleteMany({ where: { importId: { in: importIds } } }),
      prisma.marketingEvent.deleteMany({ where: { importId: { in: importIds } } }),
      prisma.marketingSession.deleteMany({ where: { importId: { in: importIds } } }),
    ]);

    // Delete imports last
    const result = await prisma.dataImport.deleteMany({
      where: { id: { in: importIds } }
    });

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error: any) {
    console.error('Error deleting all marketing imports:', error);
    return NextResponse.json(
      { error: 'Failed to delete imports', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
