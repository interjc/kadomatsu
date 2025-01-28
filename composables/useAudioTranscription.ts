import { useRuntimeConfig } from '#app'

export const useAudioTranscription = () => {
  const transcribeAudio = async (audioFile: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', audioFile)

    const response = await useFetch('/api/transcribe', {
      method: 'POST',
      body: formData
    })

    if (response.error.value) {
      throw new Error(response.error.value.message || '转写失败')
    }

    return response.data.value?.vtt
  }

  return {
    transcribeAudio
  }
}
