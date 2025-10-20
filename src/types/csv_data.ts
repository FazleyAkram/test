/**
 * CSV Data Type Definitions
 * These types define the structure of CSV data used throughout the application
 */

export interface CSVRow {
  [key: string]: string | number | boolean | null;
}

export interface CSVData {
  headers: string[];
  rows: CSVRow[];
  totalRows: number;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'yes_no';
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  questionId: string;
  response: string | number | boolean;
  timestamp: Date;
  userId?: string;
}

export interface SummaryData {
  id: string;
  type: 'global' | 'tutor' | 'commPlace';
  content: string;
  metadata: {
    questionCount: number;
    responseCount: number;
    generatedAt: Date;
    batchIndex?: number;
    batchSize?: number;
  };
}

export interface BatchProcessingResult {
  summaries: SummaryData[];
  done: boolean;
  nextBatchIndex?: number;
}

// Marketing Data Types (if needed)
export interface MarketingData {
  sessions?: any[];
  campaigns?: any[];
  events?: any[];
  conversions?: any[];
  benchmarks?: any[];
}

// Generic Data Import Types
export interface DataImport {
  id: string;
  sourceId: string;
  fileName: string;
  fileType: string;
  recordCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}












