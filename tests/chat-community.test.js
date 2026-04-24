import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_SECRET = 'test-refresh-secret';
process.env.SESSION_SECRET = 'test-session-secret';

const { default: Chat } = await import('../src/models/Chat.js');
const { default: Message } = await import('../src/models/Message.js');
const {
  ensureGlobalCommunityChat,
  GLOBAL_COMMUNITY_ROOM_KEY,
} = await import('../src/services/communityChat.service.js');
const {
  getUserChats,
  getChatMessages,
  sendMessage,
} = await import('../src/controllers/chat.controller.js');
const { default: authMiddleware } = await import('../src/middlewares/authMiddleware.js');

const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

const createChainableQuery = (result) => ({
  populate() {
    return this;
  },
  sort() {
    return this;
  },
  skip() {
    return this;
  },
  limit() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(result).then(resolve, reject);
  },
  catch(reject) {
    return Promise.resolve(result).catch(reject);
  },
});

const createRejectingQuery = (error) => ({
  populate() {
    return this;
  },
  then(resolve, reject) {
    return Promise.reject(error).then(resolve, reject);
  },
  catch(reject) {
    return Promise.reject(error).catch(reject);
  },
});

const stubMethod = (t, object, methodName, implementation) => {
  const original = object[methodName];
  object[methodName] = implementation;
  t.after(() => {
    object[methodName] = original;
  });
};

test('ensureGlobalCommunityChat creates the global room automatically', async (t) => {
  const createdChat = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Comunidad Lúpulos',
    isGroup: true,
    chatType: 'community',
    globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY,
    participants: [],
    toObject() {
      return this;
    },
  };

  stubMethod(t, Chat, 'findOneAndUpdate', (filter, update, options) => {
    assert.deepEqual(filter, { globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY });
    assert.equal(update.$setOnInsert.name, 'Comunidad Lúpulos');
    assert.equal(update.$setOnInsert.isGroup, true);
    assert.equal(options.upsert, true);

    return createChainableQuery(createdChat);
  });

  const chat = await ensureGlobalCommunityChat();

  assert.equal(chat._id, createdChat._id);
  assert.equal(chat.globalRoomKey, GLOBAL_COMMUNITY_ROOM_KEY);
});

test('getUserChats returns the global community chat consistently', async (t) => {
  const globalChat = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Comunidad Lúpulos',
    isGroup: true,
    chatType: 'community',
    globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY,
    participants: [],
    lastMessage: null,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    toObject() {
      return this;
    },
  };

  const directChat = {
    _id: '507f191e810c19729de860ea',
    name: '',
    isGroup: false,
    chatType: 'community',
    participants: [
      {
        _id: '507f1f77bcf86cd799439012',
        username: 'nacho',
        profilePicture: '/uploads/profiles/nacho.png',
      },
    ],
    lastMessage: null,
    createdAt: new Date('2026-01-02T10:00:00.000Z'),
    updatedAt: new Date('2026-01-02T10:00:00.000Z'),
    toObject() {
      return this;
    },
  };

  stubMethod(t, Chat, 'findOneAndUpdate', () => createChainableQuery(globalChat));
  stubMethod(t, Chat, 'find', () => createChainableQuery([directChat]));

  const req = {
    user: { id: '507f1f77bcf86cd799439012' },
    query: { type: 'community' },
  };
  const res = createMockResponse();

  await getUserChats(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.length, 2);
  assert.equal(res.body.data[0].name, 'Comunidad Lúpulos');
  assert.equal(res.body.data[0].chatType, 'community');
  assert.equal(res.body.data[0].isGroup, true);
});

test('getChatMessages returns paginated global room messages in ascending order', async (t) => {
  const globalChat = {
    _id: '507f1f77bcf86cd799439011',
    globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY,
    isGroup: true,
    chatType: 'community',
    participants: [],
  };

  const messages = [
    {
      _id: '507f1f77bcf86cd799439021',
      chat: globalChat._id,
      content: 'hola',
      sender: {
        _id: '507f1f77bcf86cd799439012',
        username: 'nacho',
        profilePicture: '/uploads/profiles/nacho.png',
      },
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
      updatedAt: new Date('2026-01-01T10:00:00.000Z'),
      toObject() {
        return this;
      },
    },
    {
      _id: '507f1f77bcf86cd799439022',
      chat: globalChat._id,
      content: 'salud',
      sender: {
        _id: '507f1f77bcf86cd799439013',
        username: 'cata',
        profilePicture: '/uploads/profiles/cata.png',
      },
      createdAt: new Date('2026-01-01T10:01:00.000Z'),
      updatedAt: new Date('2026-01-01T10:01:00.000Z'),
      toObject() {
        return this;
      },
    },
  ];

  stubMethod(t, Chat, 'findById', () => Promise.resolve(globalChat));
  stubMethod(t, Message, 'countDocuments', () => Promise.resolve(2));
  stubMethod(t, Message, 'find', () => createChainableQuery(messages));

  const req = {
    user: { id: '507f1f77bcf86cd799439012' },
    params: { chatId: globalChat._id },
    query: { page: 1, limit: 30 },
  };
  const res = createMockResponse();

  await getChatMessages(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.length, 2);
  assert.equal(res.body.data[0].content, 'hola');
  assert.equal(res.body.data[1].content, 'salud');
  assert.equal(res.body.meta.order, 'asc');
});

test('sendMessage allows authenticated users to post in the global community chat', async (t) => {
  const globalChat = {
    _id: '507f1f77bcf86cd799439011',
    globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY,
    isGroup: true,
    chatType: 'community',
    participants: [],
  };

  const createdMessage = {
    _id: '507f1f77bcf86cd799439031',
    chat: globalChat._id,
    sender: '507f1f77bcf86cd799439012',
    type: 'text',
    content: 'hola a todos',
    readBy: [{ user: '507f1f77bcf86cd799439012' }],
  };

  const populatedMessage = {
    ...createdMessage,
    sender: {
      _id: '507f1f77bcf86cd799439012',
      username: 'nacho',
      profilePicture: '/uploads/profiles/nacho.png',
    },
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    toObject() {
      return this;
    },
  };

  stubMethod(t, Chat, 'findById', () => Promise.resolve(globalChat));
  stubMethod(t, Message, 'create', async (payload) => {
    assert.equal(payload.chat, globalChat._id);
    assert.equal(payload.content, 'hola a todos');
    return createdMessage;
  });
  stubMethod(t, Chat, 'updateOne', async () => ({ acknowledged: true }));
  stubMethod(t, Message, 'findById', () => createChainableQuery(populatedMessage));

  const req = {
    user: { id: '507f1f77bcf86cd799439012' },
    params: { chatId: globalChat._id },
    body: { content: 'hola a todos' },
  };
  const res = createMockResponse();

  await sendMessage(req, res, () => {});

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.data.message.content, 'hola a todos');
  assert.equal(res.body.data.message.sender.username, 'nacho');
});

test('message route rejects unauthenticated access before controller execution', async () => {
  const req = {
    header() {
      return undefined;
    },
    method: 'POST',
    originalUrl: '/api/chat/507f1f77bcf86cd799439011/messages',
  };
  const res = createMockResponse();

  await authMiddleware(req, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Access token not provided');
});

test('ensureGlobalCommunityChat falls back to the existing room on duplicate key race', async (t) => {
  const globalChat = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Comunidad Lúpulos',
    isGroup: true,
    chatType: 'community',
    globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY,
    participants: [],
  };

  stubMethod(t, Chat, 'findOneAndUpdate', () => {
    const error = new Error('duplicate key');
    error.code = 11000;
    return createRejectingQuery(error);
  });
  stubMethod(t, Chat, 'findOne', () => createChainableQuery(globalChat));

  const chat = await ensureGlobalCommunityChat();

  assert.equal(chat.globalRoomKey, GLOBAL_COMMUNITY_ROOM_KEY);
  assert.equal(chat.name, 'Comunidad Lúpulos');
});
