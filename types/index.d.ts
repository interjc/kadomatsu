export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  extension: string
}

export interface Chapter {
  time: string
  title: string
}

export interface ProcessingState {
  stage: 'idle' | 'uploading' | 'transcribing' | 'summarizing' | 'completed'
  fileInfo?: FileInfo
  progress?: number
  error?: string
}

export interface TranscriptionResult {
  vtt?: string
  chapters?: Chapter[]
}
