import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSockets: Map<string, string> = new Map();
  constructor(private readonly chatService: ChatService) {}
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // Store user socket mapping
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);

      // Notify others that user is online
      client.broadcast.emit('userOnline', { userId });
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove user socket mapping
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.delete(userId);

      // Notify others that user is offline
      client.broadcast.emit('userOffline', { userId });
    }
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log(this.userSockets);
    return 'Hello world!';
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    client: any,
    payload: {chatId:string; senderId: string; receiverId: string; message: string },
  ) {

    // Handle case where payload is a JSON string
    let parsedPayload: {chatId:string; senderId: string; receiverId: string; message: string };
    if (typeof payload === 'string') {
      try {
        parsedPayload = JSON.parse(payload);
      } catch (error) {
        console.log('Failed to parse payload as JSON:', error);
        client.emit('error', { message: 'Invalid payload format' });
        return;
      }
    } else {
      parsedPayload = payload;
    }

    const receiverClientId = this.userSockets.get(parsedPayload.receiverId);
    if (receiverClientId) {
      this.server.to(receiverClientId).emit('receive-message', {
        senderId: parsedPayload.senderId,
        message: parsedPayload.message,
        timestamp: new Date().toISOString(),
      });
      await this.chatService.saveMessage(parsedPayload.chatId, parsedPayload.senderId, parsedPayload.receiverId, parsedPayload.message, new Date().toISOString());
      console.log(
        `Message sent to receiverId=${payload.receiverId}, clientId=${receiverClientId}`,
      );
    } else {
      console.log(`Receiver not found: receiverId=${payload.receiverId}`);
    }
  }
}
