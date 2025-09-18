import { NextRequest, NextResponse } from "next/server";
import '@/types/csv_data'
import { saveCommPlaceSummaries, saveGlobalSummaries, saveTutorSummaries } from "@/lib/summarizeAI";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
    try {
        const { summaryType, surveyQuestions, batchIndex = 0, batchSize = 15 } = await request.json();

        let summaries: any[] = []
        let processingDone: boolean = false;

        if (summaryType === "global") {
            summaries = await saveGlobalSummaries(surveyQuestions);
            processingDone = true;
        }
        else if (summaryType === "tutor") {
            const { summaries: summariesCreated, done } = await saveTutorSummaries(surveyQuestions, batchIndex, batchSize);
            summaries = summariesCreated;
            processingDone = done;
        }
        else if (summaryType === "commPlace") {
            summaries = await saveCommPlaceSummaries(surveyQuestions);
            processingDone = true;
        }
        else {
            return NextResponse.json({ message: 'Invalid summaryType' },
                { status: 400 });
        }

        return NextResponse.json({ summaries, processingDone }, { status: 200 });
    }
    catch (e: any) {
        console.log(e);
        return NextResponse.json(
            { message: e.message || 'Unknown error' },
            { status: 500 }
        )
    }
}
