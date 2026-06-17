const {
  listConversations,
  getMessages,
  sendMessage,
  startConversation,
  getOrCreateConversation,
} = require('../services/messagesService');

function statusFromError(e) {
  if (e && e.status) return e.status;
  return 500;
}

async function list(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;
    const conversations = await listConversations(db, userId);
    res.json(conversations);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getConversationMessages(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const messages = await getMessages(db, conversationId, userId);
    res.json(messages);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function send(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { content } = req.body;
    const message = await sendMessage(db, conversationId, userId, content);
    res.status(201).json(message);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function start(req, res) {
  const db = req.app.locals.db;
  try {
    const senderId = req.user.id;
    const { recipient_id, content } = req.body;
    if (!recipient_id) return res.status(400).json({ error: 'recipient_id is required' });
    const result = await startConversation(db, senderId, recipient_id, content);
    res.status(201).json(result);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getOrCreate(req, res) {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;
    const { recipient_id } = req.body;
    if (!recipient_id) return res.status(400).json({ error: 'recipient_id is required' });
    const conversationId = await getOrCreateConversation(db, userId, recipient_id);
    res.json({ conversationId });
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = { list, getConversationMessages, send, start, getOrCreate };