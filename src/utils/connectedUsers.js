// utils/connectedUsers.js
const connectedUsers = new Map(); // Map<userId, Set<socketId>>

export const addUserSocket = (userId, socketId) => {
    let isFirstConnection = false;

    if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
        isFirstConnection = true; // first socket for this user
    }

    connectedUsers.get(userId).add(socketId);
    return isFirstConnection;
};

export const removeUserSocket = (userId, socketId) => {
    if (!connectedUsers.has(userId)) return false;

    const socketSet = connectedUsers.get(userId);
    socketSet.delete(socketId);

    let isNowOffline = false;

    if (socketSet.size === 0) {
        connectedUsers.delete(userId);
        isNowOffline = true; // no more active sockets
    }

    return isNowOffline;
};

export const getConnectedUsers = () => connectedUsers;

export const isUserOnline = (userId) => connectedUsers.has(userId);

export const getUserSockets = (userId) => {
    return connectedUsers.get(userId) || new Set();
};
