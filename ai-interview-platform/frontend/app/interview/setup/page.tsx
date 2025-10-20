'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  VideoCameraIcon, 
  MicrophoneIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface MediaDevices {
  video: boolean
  audio: boolean
  videoDevice?: MediaDeviceInfo
  audioDevice?: MediaDeviceInfo
}

export default function InterviewSetupPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [devices, setDevices] = useState<MediaDevices>({
    video: false,
    audio: false
  })
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    checkMediaDevices()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const checkMediaDevices = async () => {
    try {
      setIsLoading(true)
      
      // Check for media devices
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput')
      const audioDevices = mediaDevices.filter(device => device.kind === 'audioinput')
      
      setAvailableDevices([...videoDevices, ...audioDevices])

      // Request camera and microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      // Check if video and audio are working
      const videoTracks = mediaStream.getVideoTracks()
      const audioTracks = mediaStream.getAudioTracks()

      setDevices({
        video: videoTracks.length > 0 && videoTracks[0].enabled,
        audio: audioTracks.length > 0 && audioTracks[0].enabled,
        videoDevice: videoDevices[0],
        audioDevice: audioDevices[0]
      })

      toast.success('Camera and microphone access granted!')
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast.error('Please allow camera and microphone access to continue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInterview = () => {
    if (devices.video && devices.audio) {
      router.push('/interview/session')
    } else {
      toast.error('Please ensure both camera and microphone are working')
    }
  }

  const retrySetup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    checkMediaDevices()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your camera and microphone...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Setup
          </h1>
          <p className="text-gray-600">
            Let's make sure your camera and microphone are working properly
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Camera Preview
            </h2>
            <div className="video-container aspect-video mb-4">
              {devices.video ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <VideoCameraIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <VideoCameraIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {devices.videoDevice?.label || 'Camera'}
                </span>
              </div>
              <div className="flex items-center">
                {devices.video ? (
                  <CheckCircleIcon className="h-5 w-5 text-success-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-error-500" />
                )}
                <span className={`ml-1 text-sm ${devices.video ? 'text-success-600' : 'text-error-600'}`}>
                  {devices.video ? 'Working' : 'Not Working'}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Status */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Microphone Status
            </h2>
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg mb-4">
              <MicrophoneIcon className="h-16 w-16 text-gray-400" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MicrophoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {devices.audioDevice?.label || 'Microphone'}
                </span>
              </div>
              <div className="flex items-center">
                {devices.audio ? (
                  <CheckCircleIcon className="h-5 w-5 text-success-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-error-500" />
                )}
                <span className={`ml-1 text-sm ${devices.audio ? 'text-success-600' : 'text-error-600'}`}>
                  {devices.audio ? 'Working' : 'Not Working'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Device List */}
        {availableDevices.length > 0 && (
          <div className="card mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Devices
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {availableDevices.map((device, index) => (
                <div key={device.deviceId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="mr-3">
                    {device.kind === 'videoinput' ? (
                      <VideoCameraIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <MicrophoneIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {device.label || `${device.kind} ${index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {device.kind === 'videoinput' ? 'Camera' : 'Microphone'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Setup Instructions
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  Make sure you're in a well-lit area with good lighting on your face
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  Position yourself so your face and upper body are clearly visible
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  Ensure there's minimal background noise for clear audio
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
              </div>
              <div className="ml-3">
                <p className="text-gray-700">
                  Test your setup by speaking and moving slightly to ensure everything works
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={retrySetup}
            className="btn-secondary"
          >
            Retry Setup
          </button>
          <button
            onClick={handleStartInterview}
            disabled={!devices.video || !devices.audio}
            className="btn-primary flex items-center justify-center"
          >
            Start Interview
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
        </div>

        {(!devices.video || !devices.audio) && (
          <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-warning-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-warning-800">
                  Setup Required
                </h3>
                <p className="text-sm text-warning-700 mt-1">
                  Please ensure both your camera and microphone are working before starting the interview.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}