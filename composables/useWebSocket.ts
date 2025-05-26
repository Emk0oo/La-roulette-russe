export const useWebSocket = () => {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const roomCode = ref("");
  const isHost = ref(false);
  const playerCount = ref(0);
  const error = ref("");

  const connect = () => {
    if (ws.value?.readyState === WebSocket.OPEN) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.value = new WebSocket(`${protocol}//${window.location.host}/game-ws`);
    
    ws.value.onopen = () => {
      isConnected.value = true;
      error.value = "";
    };
    
    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "room-created":
          roomCode.value = data.code;
          isHost.value = true;
          playerCount.value = 1;
          break;
          
        case "room-joined":
          roomCode.value = data.code;
          isHost.value = false;
          playerCount.value = data.playerCount;
          break;
          
        case "player-joined":
        case "player-left":
          playerCount.value = data.playerCount;
          break;
          
        case "host-changed":
          isHost.value = data.isHost;
          break;
          
        case "error":
          error.value = data.message;
          break;
      }
    };
    
    ws.value.onclose = () => {
      isConnected.value = false;
    };
    
    ws.value.onerror = () => {
      error.value = "Erreur de connexion";
      isConnected.value = false;
    };
  };

  const createRoom = (code: string) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
    
    ws.value.send(JSON.stringify({
      type: "create-room",
      code
    }));
  };

  const joinRoom = (code: string) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
    
    ws.value.send(JSON.stringify({
      type: "join-room",
      code
    }));
  };

  const sendGameAction = (action: any) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
    
    ws.value.send(JSON.stringify({
      type: "game-action",
      ...action
    }));
  };

  const leaveRoom = () => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
    
    ws.value.send(JSON.stringify({
      type: "leave-room"
    }));
    
    roomCode.value = "";
    isHost.value = false;
    playerCount.value = 0;
  };

  const disconnect = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    createRoom,
    joinRoom,
    sendGameAction,
    leaveRoom,
    disconnect,
    isConnected,
    roomCode,
    isHost,
    playerCount,
    error,
    ws
  };
};