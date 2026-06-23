import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface RoomLobbyProps {
  onJoinRoom: (roomId: string) => void
  onCreateRoom: () => void
  currentRoomId: string | null
  onLeaveRoom: () => void
}

export function RoomLobby({ onJoinRoom, onCreateRoom, currentRoomId, onLeaveRoom }: RoomLobbyProps) {
  const [roomInput, setRoomInput] = useState('')

  if (currentRoomId) {
    return (
      <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
        <div className="text-white text-sm">
          Sala: <span className="font-mono text-green-400 font-bold">{currentRoomId}</span>
        </div>
        <Button variant="destructive" size="sm" onClick={onLeaveRoom}>Sair da Sala</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
      <Button variant="outline" size="sm" onClick={onCreateRoom} className="text-slate-200 border-slate-600 hover:bg-slate-700">
        Criar Sala
      </Button>
      <div className="flex gap-1">
        <input
          type="text"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="CÓDIGO"
          className="bg-slate-900 border border-slate-700 text-white px-2 py-1 text-sm font-mono w-20 rounded"
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={roomInput.length < 3}
          onClick={() => onJoinRoom(roomInput)}
        >
          Entrar
        </Button>
      </div>
    </div>
  )
}
