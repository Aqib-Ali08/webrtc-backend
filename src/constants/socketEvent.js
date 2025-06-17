const SocketEvents = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
  
    // Chat Events
    CHAT_JOIN: 'chat:joinRoom',
    CHAT_LEAVE: 'chat:leaveRoom',
    CHAT_SEND: 'chat:sendMessage',
    CHAT_RECEIVE: 'chat:receiveMessage',
    CHAT_TYPING: 'chat:typing',
    CHAT_STOP_TYPING: 'chat:stopTyping',
  
    // Friend Request Events
    FRIEND_REQUEST_SENT: 'friend:requestSent',
    FRIEND_REQUEST_RECEIVED: 'friend:requestReceived',
    FRIEND_REQUEST_ACCEPTED: 'friend:requestAccepted',
    FRIEND_REQUEST_CANCELED: 'friend:requestCanceled',
  
    // Meeting Events
    MEETING_JOIN: 'meeting:join',
    MEETING_LEAVE: 'meeting:leave',
    MEETING_STARTED: 'meeting:started',
    MEETING_ENDED: 'meeting:ended',
    MEETING_SIGNAL: 'meeting:signal', // for WebRTC signaling
  
    // Notifications
    NOTIFY: 'notify',
  
    // Error
    ERROR: 'error',
  };
  
  export default SocketEvents;
  