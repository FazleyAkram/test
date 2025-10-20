import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import SummaryPDF from '@/components/summary/SummaryPDF';

// api route to generate PDF from summary data
export async function POST(req: NextRequest) {
  try {
    // from the request, summary data and report data are retrieved
    const { summaryData, reportData } = await req.json();

    if (!summaryData) {
      return NextResponse.json({ error: 'No summary data provided' }, { status: 400 });
    }

    
    // react component renderToBuffer converts React PDF component to binary
    const pdfBuffer = await renderToBuffer(
      React.createElement(SummaryPDF, { data: summaryData, reportData: reportData || null }) as any
    );

    // pdf returned as downloadable file
    return new Response(pdfBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="retrospective-analysis-${Date.now()}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
