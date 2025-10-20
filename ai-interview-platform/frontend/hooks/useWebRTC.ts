import { useRef, useCallback, useState, useEffect } from 'react'
import RecordRTC from 'recordrtc'

interface UseWebRTCOptions {
  video?: boolean
  audio?: boolean
  videoConstraints?: MediaTrackConstraints
  audioConstraints?: MediaTrackConstraints
}

interface UseWebRTCReturn {
  stream: MediaStream | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  isStreamActive: boolean
  error: string | null
  isRecording: boolean
}

export const useWebRTC = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseWebRTCOptions = {}
): UseWebRTCReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreamActive, setIsStreamActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<RecordRTC | null>(null)

  const {
    video = true,
    audio = true,
    videoConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'
    },
    audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  } = options

  // Initialize media stream
  const initializeStream = useCallback(async () => {
    try {
      setError(null)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: video ? videoConstraints : false,
        audio: audio ? audioConstraints : false
      })

      setStream(mediaStream)
      setIsStreamActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      return mediaStream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access media devices'
      setError(errorMessage)
      throw err
    }
  }, [video, audio, videoConstraints, audioConstraints, videoRef])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (!stream) {
        await initializeStream()
      }

      if (stream) {
        const recorder = new RecordRTC(stream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000,
          timeSlice: 1000, // Record in 1-second chunks
          ondataavailable: (blob) => {
            // Handle data chunks for real-time processing
            console.log('Recording chunk available:', blob.size, 'bytes')
          }
        })

        recorderRef.current = recorder
        recorder.startRecording()
        setIsRecording(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
      setError(errorMessage)
      throw err
    }
  }, [stream, initializeStream])

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (recorderRef.current) {
        return new Promise<void>((resolve, reject) => {
          recorderRef.current!.stopRecording(() => {
            const blob = recorderRef.current!.getBlob()
            console.log('Recording stopped, final blob size:', blob.size, 'bytes')
            
            // Here you would typically upload the blob to your server
            // For now, we'll just log it
            
            recorderRef.current = null
            setIsRecording(false)
            resolve()
          })
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (recorderRef.current) {
        recorderRef.current.destroy()
      }
    }
  }, [stream])

  // Initialize stream on mount
  useEffect(() => {
    initializeStream()
  }, [initializeStream])

  return {
    stream,
    startRecording,
    stopRecording,
    isStreamActive,
    error,
    isRecording
  }
}