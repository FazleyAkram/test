import { prisma } from "@/lib/prisma";
import { Report, ReportType, DataImport } from "@prisma/client";

export async function getReportType(id: number): Promise<Report> {

    const report = await prisma.report.findUnique({
        where: {
            id
        }
    })

    if (!report) {
        throw new Error(`Report with ID ${id} not found`);
    }

    return report;
}

export async function getReportTypes(): Promise<{ value: ReportType, label: string }[]> {
    return Object.values(ReportType).map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    }));
}

export async function getImportLogs(): Promise<DataImport[]> {
    return await prisma.dataImport.findMany({
        include: {
            marketingSessions: true
        }
    });
}

export async function getReport(id: number): Promise<Report> {
    const report = await prisma.report.findUnique({
        where: {
            id
        },
        include: {
            campaign: true,
            user: true
        }
    })

    if (!report) {
        throw new Error(`Report with ID ${id} not found`);
    }

    return report;
}

export async function getReports(filters: any): Promise<Report[]> {
    const reports = await prisma.report.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
        include: {
            campaign: true,
            user: true,
        }
    })

    return reports;
}