import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

import { JWT_SECRET } from "./jwt-config";

interface ChatClient {
  ws: WebSocket;
  type: "visitor" | "admin";
  sessionId?: string;
  visitorId?: string;
  adminId?: string;
  adminName?: string;
}

const clients: ChatClient[] = [];

function broadcastToSession(sessionId: string, data: any, excludeWs?: WebSocket) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.ws.readyState !== WebSocket.OPEN) return;
    if (client.ws === excludeWs) return;
    if (client.type === "visitor" && client.sessionId === sessionId) {
      client.ws.send(message);
    }
    if (client.type === "admin") {
      client.ws.send(message);
    }
  });
}

function broadcastToAdmins(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.ws.readyState !== WebSocket.OPEN) return;
    if (client.type === "admin") {
      client.ws.send(message);
    }
  });
}

export function setupChatWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const type = url.searchParams.get("type") as "visitor" | "admin";
    const token = url.searchParams.get("token");

    const chatClient: ChatClient = { ws, type: type || "visitor" };

    if (type === "admin" && token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        chatClient.adminId = decoded.userId;
        chatClient.adminName = decoded.name || decoded.email;
      } catch {
        ws.close(4001, "Invalid admin token");
        return;
      }
    }

    if (type === "visitor") {
      const visitorId = url.searchParams.get("visitorId");
      const sessionId = url.searchParams.get("sessionId");
      chatClient.visitorId = visitorId || undefined;
      chatClient.sessionId = sessionId || undefined;
    }

    clients.push(chatClient);

    ws.on("message", async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        switch (data.type) {
          case "visitor_start": {
            let session = await storage.getChatSessionByVisitorId(data.visitorId);
            if (!session) {
              session = await storage.createChatSession(data.visitorId, data.visitorName, data.visitorEmail);
            } else if (data.visitorName && data.visitorName !== "Visitor" && (session.visitorName === "Visitor" || !session.visitorName)) {
              await storage.updateChatSessionName(session.id, data.visitorName, data.visitorEmail);
              session = { ...session, visitorName: data.visitorName, visitorEmail: data.visitorEmail || session.visitorEmail };
            }
            chatClient.sessionId = session.id;
            chatClient.visitorId = data.visitorId;

            const messages = await storage.getChatMessages(session.id);
            ws.send(JSON.stringify({ type: "session_started", session, messages }));

            broadcastToAdmins({ type: "new_session", session });
            break;
          }

          case "visitor_message": {
            if (!chatClient.sessionId) break;
            const existingMessages = await storage.getChatMessages(chatClient.sessionId);
            const isFirstMessage = existingMessages.filter(m => m.senderType === "visitor").length === 0;

            const msg = await storage.addChatMessage(
              chatClient.sessionId,
              "visitor",
              data.visitorName || "Visitor",
              data.message
            );
            broadcastToSession(chatClient.sessionId, {
              type: "new_message",
              sessionId: chatClient.sessionId,
              message: msg,
            }, ws);
            ws.send(JSON.stringify({
              type: "message_sent",
              message: msg,
            }));

            if (isFirstMessage) {
              setTimeout(async () => {
                try {
                  const autoReply = await storage.addChatMessage(
                    chatClient.sessionId!,
                    "admin",
                    "MetaEdge Support",
                    "Hi there! Thanks for reaching out. We're right here and will reply to you shortly. Please feel free to share more details in the meantime!"
                  );
                  broadcastToSession(chatClient.sessionId!, {
                    type: "new_message",
                    sessionId: chatClient.sessionId,
                    message: autoReply,
                  });
                } catch (err) {
                  console.error("Auto-reply error:", err);
                }
              }, 1500);

              const { sendNotificationEmail } = await import("./resend-email");
              sendNotificationEmail(
                `New Chat Message from ${data.visitorName || "Visitor"}`,
                `<h2>New Live Chat Message</h2>
                <p><strong>Visitor:</strong> ${data.visitorName || "Visitor"}</p>
                <p><strong>Session:</strong> ${chatClient.sessionId}</p>
                <h3>Message:</h3>
                <p>${data.message}</p>
                <p><em>Reply from the admin chat panel.</em></p>`,
                "support"
              );
            }
            break;
          }

          case "admin_message": {
            if (!data.sessionId || !chatClient.adminName) break;
            const msg = await storage.addChatMessage(
              data.sessionId,
              "admin",
              chatClient.adminName,
              data.message
            );
            broadcastToSession(data.sessionId, {
              type: "new_message",
              sessionId: data.sessionId,
              message: msg,
            }, ws);
            ws.send(JSON.stringify({
              type: "message_sent",
              sessionId: data.sessionId,
              message: msg,
            }));
            break;
          }

          case "admin_join": {
            break;
          }

          case "close_session": {
            if (!data.sessionId) break;
            await storage.closeChatSession(data.sessionId);
            broadcastToSession(data.sessionId, {
              type: "session_closed",
              sessionId: data.sessionId,
            });
            break;
          }

          case "load_messages": {
            if (!data.sessionId) break;
            const messages = await storage.getChatMessages(data.sessionId);
            ws.send(JSON.stringify({
              type: "messages_loaded",
              sessionId: data.sessionId,
              messages,
            }));
            break;
          }
        }
      } catch (err) {
        console.error("Chat WS error:", err);
      }
    });

    ws.on("close", () => {
      const idx = clients.indexOf(chatClient);
      if (idx !== -1) clients.splice(idx, 1);
    });

    ws.on("error", () => {
      const idx = clients.indexOf(chatClient);
      if (idx !== -1) clients.splice(idx, 1);
    });
  });

  return wss;
}
