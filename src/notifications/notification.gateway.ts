// src/notifications/notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendToUser(userId: number, data: { title: string; message: string }) {
    this.server.emit(`notification-${userId}`, data); // canal personnalisé
  }
}
