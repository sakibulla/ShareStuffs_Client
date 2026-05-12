import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

/**
 * Connect (or reconnect) the socket with the current JWT token.
 * Safe to call multiple times — reuses the existing connection if already open.
 */
export function connectSocket(token) {
    if (socket?.connected) return socket;

    // Disconnect stale socket before creating a new one
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function getSocket() {
    return socket;
}
