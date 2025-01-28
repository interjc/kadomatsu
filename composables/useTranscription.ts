export const useTranscription = () => {
  const config = useRuntimeConfig()
  const workerUrl = 'https://your-worker.workers.dev'

  const validateFileSize = (file: File) => {
    return file.size <= config.public.maxFileSize
  }

  const transcribe = async (audioData: Blob) => {
    const formData = new FormData()
    formData.append('file', audioData)

    const response = await fetch(`${workerUrl}/api/transcribe`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Transcription failed')
    }

    return response.json()
  }

  const summarize = async (vtt: string) => {
    const response = await fetch(`${workerUrl}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vtt })
    })

    if (!response.ok) {
      throw new Error('Summarization failed')
    }

    return response.json()
  }

  return {
    transcribe,
    summarize,
    validateFileSize
  }
}
