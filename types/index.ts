export interface ProcessingState {
  stage: 'idle' | 'extracting' | 'transcribing' | 'summarizing' | 'completed';
  progress: number;
  error?: string;
  fileInfo?: FileInfo;
  vtt?: string;
  chapters?: Chapter[];
}

export interface Chapter {
  time: string;
  title: string;
}

export interface TranscriptionResponse {
  vtt: string;
}

export interface SummaryResponse {
  summary: string;
}

export interface ProcessingResult {
  vtt?: string;
  txt?: string;
  chapters?: Chapter[];
}

export interface TranscriptionResult {
  vtt: string;
  chapters: any[];
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
}
