async function getOrCreateConversation(db, userId1, userId2) {
  const existing = await db.getAsync(`
    SELECT id FROM conversations
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `, [userId1, userId2, userId2, userId1]);

  if (existing) return existing.id;

  const r = await db.runAsync(
    'INSERT INTO conversations(user1_id, user2_id) VALUES (?,?)',
    [userId1, userId2]
  );
  return r.lastID;
}

async function listConversations(db, userId) {
  return await db.allAsync(`
    SELECT
      c.id,
      c.updated_at,
      CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END AS other_user_id,
      u.name AS other_user_name,
      u.picture AS other_user_picture,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_id != ?) AS unread_count
    FROM conversations c
    JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
    WHERE c.user1_id = ? OR c.user2_id = ?
    ORDER BY COALESCE(last_message_at, c.updated_at) DESC
  `, [userId, userId, userId, userId, userId]);
}

async function getMessages(db, conversationId, userId) {
  // Mark messages as read
  await db.runAsync(
    'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL',
    [conversationId, userId]
  );

  return await db.allAsync(`
    SELECT m.*, u.name AS sender_name, u.picture AS sender_picture
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `, [conversationId]);
}

async function sendMessage(db, conversationId, senderId, content) {
  if (!content || !content.trim()) {
    const err = new Error('content is required');
    err.status = 400;
    throw err;
  }

  const r = await db.runAsync(
    'INSERT INTO messages(conversation_id, sender_id, content) VALUES (?,?,?)',
    [conversationId, senderId, content.trim()]
  );

  await db.runAsync(
    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [conversationId]
  );

  return await db.getAsync(`
    SELECT m.*, u.name AS sender_name, u.picture AS sender_picture
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.id = ?
  `, [r.lastID]);
}

async function startConversation(db, senderId, recipientId, content) {
  const conversationId = await getOrCreateConversation(db, senderId, recipientId);
  const message = await sendMessage(db, conversationId, senderId, content);
  return { conversationId, message };
}

module.exports = {
  listConversations,
  getMessages,
  sendMessage,
  startConversation,
  getOrCreateConversation,
};