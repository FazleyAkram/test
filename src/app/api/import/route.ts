import { NextRequest, NextResponse } from "next/server";
import { getImportLogs } from "@/lib/loaders";
import { DataImport } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const importLogs: DataImport[] = await getImportLogs();

        return NextResponse.json({ importLogs }, { status: 200 });
    }
    catch (e: any) {
        console.log(e);
        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        )
    }
}