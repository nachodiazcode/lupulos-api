import Chat from '../models/Chat.js';

export const GLOBAL_COMMUNITY_ROOM_KEY = 'community:global';
export const GLOBAL_COMMUNITY_ROOM_NAME = 'Comunidad Lúpulos';
export const CHAT_USER_SELECT = 'username profilePicture role';

export const populateChatQuery = (query) =>
  query
    .populate('participants', CHAT_USER_SELECT)
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: CHAT_USER_SELECT,
      },
    });

export const getGlobalCommunityChat = async () =>
  populateChatQuery(Chat.findOne({ globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY }));

export const ensureGlobalCommunityChat = async () => {
  try {
    return await populateChatQuery(
      Chat.findOneAndUpdate(
        { globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY },
        {
          $setOnInsert: {
            name: GLOBAL_COMMUNITY_ROOM_NAME,
            isGroup: true,
            chatType: 'community',
            globalRoomKey: GLOBAL_COMMUNITY_ROOM_KEY,
            participants: [],
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      )
    );
  } catch (error) {
    if (error?.code === 11000) {
      return getGlobalCommunityChat();
    }

    throw error;
  }
};

export const isGlobalCommunityChat = (chat) =>
  Boolean(chat?.globalRoomKey === GLOBAL_COMMUNITY_ROOM_KEY);

export const canAccessChat = (chat, userId) => {
  if (!chat || !userId) {
    return false;
  }

  if (isGlobalCommunityChat(chat)) {
    return true;
  }

  return (chat.participants || []).some(
    (participant) =>
      String(participant?._id || participant) === String(userId)
  );
};
