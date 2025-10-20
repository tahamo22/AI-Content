import { useEffect, useRef, useState, useCallback } from 'react'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface UseWebSocketReturn {
  sendMessage: (message: any) => void
  lastMessage: MessageEvent | null
  connectionStatus: ConnectionStatus
  disconnect: () => void
  connect: () => void
}

export const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const isManualDisconnectRef = useRef(false)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionStatus('connecting')
      const ws = new WebSocket(url)
      
      ws.onopen = (event) => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        isManualDisconnectRef.current = false
        onOpen?.(event)
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected')
        setConnectionStatus('disconnected')
        onClose?.(event)

        // Attempt to reconnect if not manually disconnected
        if (!isManualDisconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionStatus('error')
          console.error('Max reconnection attempts reached')
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setConnectionStatus('error')
        onError?.(event)
      }

      ws.onmessage = (event) => {
        setLastMessage(event)
        onMessage?.(event)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }, [url, onOpen, onClose, onError, onMessage, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setConnectionStatus('disconnected')
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message)
        wsRef.current.send(messageString)
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Connect on mount
  useEffect(() => {
    connect()
  }, [connect])

  return {
    sendMessage,
    lastMessage,
    connectionStatus,
    disconnect,
    connect
  }
}