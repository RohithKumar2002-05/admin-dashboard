import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
    if (socket?.connected) return socket;

    const BASE = process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '') ?? '';

    socket = io(BASE, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
    });

    socket.on('connect', () => console.log('[Socket] Connected:', socket?.id));
    socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));

    return socket;
};

export const disconnectSocket = (): void => {
    socket?.disconnect();
    socket = null;
};
