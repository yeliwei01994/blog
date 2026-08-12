export interface MessageRow {
  id: number;
  name: string;
  message: string;
  created_at: Date;
}

export interface MessageQueryClient {
  query: (sql: string, values?: string[]) => Promise<{ rows: MessageRow[] }>;
}

export async function listMessages(db: MessageQueryClient) {
  const result = await db.query(
    'SELECT id, name, message, created_at FROM guestbook_messages ORDER BY created_at DESC',
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function createMessage(db: MessageQueryClient, name: string, message: string) {
  const result = await db.query(
    'INSERT INTO guestbook_messages (name, message) VALUES ($1, $2) RETURNING id, name, message, created_at',
    [name, message],
  );
  const row = result.rows[0];
  return { id: row.id, name: row.name, message: row.message, createdAt: row.created_at.toISOString() };
}
