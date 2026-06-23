import { useState, useCallback, useEffect } from 'react'

export function useMultiplayerRooms(chatRef: any) {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)

  // Custom event listener for socket messages
  useEffect(() => {
    // This is a simplified approach, since useChatConnection already handles messages,
    // ideally the backend responds to 'join-room'. We will mock the state here for the UI
    // to function until backend is also updated.
  }, [])

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = useCallback(() => {
    const newRoomId = generateRoomId()
    setCurrentRoomId(newRoomId)
    chatRef.current?.send?.({ type: 'join-room', roomId: newRoomId })
  }, [chatRef])

  const joinRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId)
    chatRef.current?.send?.({ type: 'join-room', roomId })
  }, [chatRef])

  const leaveRoom = useCallback(() => {
    if (currentRoomId) {
      chatRef.current?.send?.({ type: 'leave-room', roomId: currentRoomId })
      setCurrentRoomId(null)
    }
  }, [chatRef, currentRoomId])

  const sendGameStart = useCallback((mode: string, dayNumber: number) => {
    if (currentRoomId) {
      chatRef.current?.send?.({ type: 'game-start', roomId: currentRoomId, mode, dayNumber })
    }
  }, [chatRef, currentRoomId])

  return {
    currentRoomId,
    createRoom,
    joinRoom,
    leaveRoom,
    sendGameStart
  }
}
