'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  VideoCameraIcon, 
  MicrophoneIcon, 
  StopIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useWebRTC } from '@/hooks/useWebRTC'
import { useWebSocket } from '@/hooks/useWebSocket'
import RealTimeFeedback from '@/components/InterviewSession/RealTimeFeedback'
import SessionControls from '@/components/InterviewSession/SessionControls'

interface InterviewSession {
  id: string
  status: 'preparing' | 'active' | 'paused' | 'completed'
  duration: number
  startTime?: Date
  endTime?: Date
}

interface RealTimeAnalysis {
  timestamp: number
  emotions: {
    happy: number
    sad: number
    angry: number
    surprised: number
    fearful: number
    disgusted: number
    neutral: number
  }
  pose: {
    confidence: number
    posture: 'good' | 'fair' | 'poor'
    eyeContact: number
  }
  speech: {
    confidence: number
    clarity: number
    pace: number
    volume: number
  }
}

export default function InterviewSessionPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [session, setSession] = useState<InterviewSession>({
    id: '',
    status: 'preparing',
    duration: 0
  })
  const [isRecording, setIsRecording] = useState(false)
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<RealTimeAnalysis | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  // Custom hooks for WebRTC and WebSocket
  const { 
    stream, 
    startRecording, 
    stopRecording, 
    isStreamActive,
    error: webrtcError 
  } = useWebRTC(videoRef)

  const { 
    sendMessage, 
    lastMessage, 
    connectionStatus 
  } = useWebSocket('ws://localhost:8000/ws/interview')

  // Initialize session
  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSession(prev => ({ ...prev, id: sessionId }))
  }, [])

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data)
        if (data.type === 'analysis') {
          setRealTimeAnalysis(data.payload)
        } else if (data.type === 'session_update') {
          setSession(prev => ({ ...prev, ...data.payload }))
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
  }, [lastMessage])

  // Handle WebRTC errors
  useEffect(() => {
    if (webrtcError) {
      toast.error(`WebRTC Error: ${webrtcError}`)
    }
  }, [webrtcError])

  // Handle connection status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast.success('Connected to AI analysis server')
    } else if (connectionStatus === 'disconnected') {
      toast.error('Disconnected from AI analysis server')
    }
  }, [connectionStatus])

  const handleStartSession = useCallback(async () => {
    try {
      if (!stream) {
        toast.error('Camera and microphone not available')
        return
      }

      setSession(prev => ({ 
        ...prev, 
        status: 'active', 
        startTime: new Date() 
      }))
      
      setIsRecording(true)
      await startRecording()
      
      // Send session start message
      sendMessage({
        type: 'session_start',
        payload: {
          sessionId: session.id,
          timestamp: Date.now()
        }
      })

      toast.success('Interview session started!')
    } catch (error) {
      console.error('Error starting session:', error)
      toast.error('Failed to start session')
    }
  }, [stream, session.id, startRecording, sendMessage])

  const handlePauseSession = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'paused' }))
    setIsRecording(false)
    
    sendMessage({
      type: 'session_pause',
      payload: {
        sessionId: session.id,
        timestamp: Date.now()
      }
    })

    toast.info('Session paused')
  }, [session.id, sendMessage])

  const handleResumeSession = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'active' }))
    setIsRecording(true)
    
    sendMessage({
      type: 'session_resume',
      payload: {
        sessionId: session.id,
        timestamp: Date.now()
      }
    })

    toast.info('Session resumed')
  }, [session.id, sendMessage])

  const handleEndSession = useCallback(async () => {
    try {
      setSession(prev => ({ 
        ...prev, 
        status: 'completed', 
        endTime: new Date() 
      }))
      
      setIsRecording(false)
      await stopRecording()
      
      // Send session end message
      sendMessage({
        type: 'session_end',
        payload: {
          sessionId: session.id,
          timestamp: Date.now()
        }
      })

      toast.success('Interview session completed!')
      
      // Navigate to feedback page
      setTimeout(() => {
        router.push(`/interview/feedback/${session.id}`)
      }, 2000)
    } catch (error) {
      console.error('Error ending session:', error)
      toast.error('Failed to end session')
    }
  }, [session.id, stopRecording, sendMessage, router])

  const toggleFeedback = () => {
    setShowFeedback(prev => !prev)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <VideoCameraIcon className="h-8 w-8 text-primary-400" />
              <h1 className="ml-2 text-xl font-bold">AI Interview Practice</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDuration(session.duration)}
              </div>
              <div className={`status-indicator ${
                session.status === 'active' ? 'status-active' :
                session.status === 'paused' ? 'status-pending' :
                session.status === 'completed' ? 'status-completed' : 'status-error'
              }`}>
                {session.status}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Container */}
          <div className="flex-1 relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Controls */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 pointer-events-auto">
                <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
                  <div className="flex items-center">
                    <VideoCameraIcon className="h-4 w-4 text-white mr-1" />
                    <span className="text-sm text-white">Camera</span>
                  </div>
                  <div className="flex items-center">
                    <MicrophoneIcon className="h-4 w-4 text-white mr-1" />
                    <span className="text-sm text-white">Microphone</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 pointer-events-auto">
                <button
                  onClick={toggleFeedback}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-lg px-3 py-2 flex items-center space-x-2 transition-colors"
                >
                  <ChartBarIcon className="h-4 w-4 text-white" />
                  <span className="text-sm text-white">
                    {showFeedback ? 'Hide' : 'Show'} Feedback
                  </span>
                </button>
              </div>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
                <motion.div
                  className="bg-error-600 text-white px-3 py-1 rounded-full flex items-center space-x-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">RECORDING</span>
                </motion.div>
              </div>
            )}
          </div>

          {/* Session Controls */}
          <SessionControls
            session={session}
            isRecording={isRecording}
            onStart={handleStartSession}
            onPause={handlePauseSession}
            onResume={handleResumeSession}
            onEnd={handleEndSession}
            disabled={!isStreamActive || connectionStatus !== 'connected'}
          />
        </div>

        {/* Real-time Feedback Sidebar */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 border-l border-gray-700 overflow-hidden"
            >
              <RealTimeFeedback
                analysis={realTimeAnalysis}
                session={session}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'connected' && (
        <div className="fixed bottom-4 right-4 bg-warning-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}