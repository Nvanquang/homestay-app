import { Client } from "@stomp/stompjs";

let stompClient: Client | null = null;

// Chat WebSocket functions only
export const connectWS = (
  conversationId: number,
  onMessage: (msg: any) => void,
  onError?: (error: any) => void
): Promise<Client> => {
  return new Promise((resolve, reject) => {
    // Disconnect existing connection
    if (stompClient?.connected) {
      stompClient.deactivate();
    }

    stompClient = new Client({
      brokerURL: "ws://localhost:8080/chat",
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
          // Subscribe to conversation messages
          stompClient?.subscribe(
            `/topic/conversation.${conversationId}`, 
            (message) => {
              try {
                const parsedMessage = JSON.parse(message.body);
                onMessage(parsedMessage);
              } catch (error) {
                console.error("Error parsing message:", error);
              }
            }
          );
          resolve(stompClient!);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
        reject(error);
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        onError?.(frame);
        reject(new Error(`STOMP error: ${frame.headers.message}`));
      },

      onDisconnect: (frame) => {
        console.log("Disconnected from WebSocket:", frame);
      },
    });

    try {
      stompClient.activate();
    } catch (error) {
      console.error("Error activating client:", error);
      reject(error);
    }
  });
};

export const sendMessage = (
  conversationId: number,
  senderId: string,
  content: string,
  type: string = "TEXT"
): boolean => {
  if (!stompClient?.connected) {
    console.warn("STOMP client is not connected");
    return false;
  }

  try {
    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({
        conversationId,
        senderId,
        content,
        type,
      }),
    });
    
    console.log("Message sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

export const disconnectWS = (): void => {
  if (stompClient?.connected) {
    stompClient.deactivate();
    stompClient = null;
    console.log("🔌 WebSocket disconnected manually");
  }
};

export const isConnected = (): boolean => {
  return stompClient?.connected || false;
};

// Utility function to get connection state
export const getConnectionState = (): string => {
  if (!stompClient) return "NOT_INITIALIZED";
  if (stompClient.connected) return "CONNECTED";
  if (stompClient.active) return "CONNECTING";
  return "DISCONNECTED";
};