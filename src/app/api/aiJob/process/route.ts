import { processJobs } from '@/lib/aiJob';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
    try {
        const processed = await processJobs();

        return NextResponse.json(
            { processed },
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