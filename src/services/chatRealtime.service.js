import logger from '../utils/logger.js';

let realtimeAdapter = null;

export const setChatRealtimeAdapter = (adapter) => {
  realtimeAdapter = adapter || null;
};

export const emitChatMessageNew = async (payload) => {
  if (!realtimeAdapter?.emitChatMessageNew) {
    return;
  }

  try {
    await realtimeAdapter.emitChatMessageNew(payload);
  } catch (error) {
    logger.warn(`Chat realtime adapter failed: ${error.message}`);
  }
};

export default {
  setChatRealtimeAdapter,
  emitChatMessageNew,
};
