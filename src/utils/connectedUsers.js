// utils/connectedUsers.js
const connectedUsers = new Map(); // Map<userId, Set<socketId>>

export const addUserSocket = (userId, socketId) => {
    if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socketId);
};

export const removeUserSocket = (userId, socketId) => {
    if (connectedUsers.has(userId)) {
        const socketSet = connectedUsers.get(userId);
        socketSet.delete(socketId);
        if (socketSet.size === 0) {
            connectedUsers.delete(userId);
        }
    }
};

export const getConnectedUsers = () => connectedUsers;

export const isUserOnline = (userId) => connectedUsers.has(userId);
export const getUserSockets = (userId) => {
    return connectedUsers.get(userId) || new Set();
};
