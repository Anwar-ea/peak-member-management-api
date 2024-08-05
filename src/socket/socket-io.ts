import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initializeSocket(httpServer: HTTPServer): void {
    const io = new Server(httpServer);

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle custom events
        socket.on('message', (msg) => {
            console.log('Message received:', msg);
            // Broadcast the message to all connected clients
            io.emit('message', msg);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });
}