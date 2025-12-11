import { useEffect, useState } from "react";

const useWebSocket = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log("✅ WebSocket connected to", url);
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          console.error("❌ Failed to parse WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
      };

      socket.onclose = () => {
        console.log("⚠️ WebSocket closed. Reconnecting...");
        setTimeout(connect, 3000); 
      };

      setWs(socket);
    };

    connect();

    return () => {
      ws?.close();
    };
  }, [url]);

  return { ws, messages }; 
};

export default useWebSocket;