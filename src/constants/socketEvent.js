const SocketEvents = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // ============================
  // 📤 Client → Server Events
  // ============================

  // Conversation Management
  CLIENT_CHAT_JOIN: 'client:chat:joinRoom',
  CLIENT_CHAT_LEAVE: 'client:chat:leaveRoom',

  // Messages
  CLIENT_CHAT_SEND: 'client:chat:sendMessage',
  CLIENT_CHAT_EDIT: 'client:chat:editMessage',
  CLIENT_CHAT_DELETE: 'client:chat:deleteMessage',
  CLIENT_CHAT_READ: 'client:chat:readMessage',

  // Typing Indicators
  CLIENT_CHAT_TYPING: 'client:chat:typing',
  CLIENT_CHAT_STOP_TYPING: 'client:chat:stopTyping',

  // Reactions
  CLIENT_CHAT_REACTION_ADD: 'client:chat:addReaction',
  CLIENT_CHAT_REACTION_REMOVE: 'client:chat:removeReaction',

  // Friend Requests
  CLIENT_FRIEND_REQUEST_SENT: 'client:friend:requestSent',
  CLIENT_FRIEND_REQUEST_ACCEPTED: 'client:friend:requestAccepted',

  // Meeting (WebRTC)
  CLIENT_MEETING_JOIN: 'client:meeting:join',
  CLIENT_MEETING_LEAVE: 'client:meeting:leave',
  CLIENT_MEETING_SIGNAL: 'client:meeting:signal',

  // ============================
  // 📥 Server → Client Events
  // ============================

  // Conversation Updates
  SERVER_CHAT_CONVERSATION_UPDATED: 'server:chat:update',
  SERVER_CHAT_MEMBER_JOINED: 'server:chat:memberJoined',
  SERVER_CHAT_MEMBER_LEFT: 'server:chat:memberLeft',

  // Messages
  SERVER_CHAT_RECEIVE: 'server:chat:receiveMessage',
  SERVER_CHAT_MESSAGE_STATUS: 'server:chat:messageStatus',

  // Typing Indicators
  SERVER_CHAT_TYPING: 'server:chat:typing',
  SERVER_CHAT_STOP_TYPING: 'server:chat:stopTyping',

  // Reactions
  SERVER_CHAT_REACTION_ADD: 'server:chat:addReaction',
  SERVER_CHAT_REACTION_REMOVE: 'server:chat:removeReaction',

  // Presence
  SERVER_USER_ONLINE: 'server:user:online',
  SERVER_USER_OFFLINE: 'server:user:offline',
  // ====================================================>>>>>>>>>>>>>>>>>>>>>>>>>>

  // Friend Request Events
  FRIEND_REQUEST_SENT: 'friend:requestSent',
  // FRIEND_REQUEST_RECEIVED: 'friend:requestReceived',
  FRIEND_REQUEST_ACCEPTED: 'friend:requestAccepted',
  // FRIEND_REQUEST_CANCELED: 'friend:requestCanceled',

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
