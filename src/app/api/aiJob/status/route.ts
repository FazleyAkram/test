import { jobStatus } from '@/lib/aiJob';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
    try {
        const pendingJobsCount = await jobStatus();

        return NextResponse.json(
            { pendingJobsCount },
            { status: 200 }
        );
    } catch (e: any) {
        console.log(e);
        return NextResponse.json(
            { message: e.message || 'Unknown error' },
            { status: 500 }
        )
    }
}