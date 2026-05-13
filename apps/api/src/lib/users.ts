import { db, users, eq, sql } from '@eventio/db';

export async function syncUser(userData: {
  googleId: string;
  email: string;
  isSubscribed?: boolean;
}) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.googleId, userData.googleId))
    .limit(1);

  if (existing.length > 0) {
    const updated = await db
      .update(users)
      .set({
        email: userData.email,
        isSubscribed: userData.isSubscribed ?? existing[0].isSubscribed,
        updatedAt: new Date(),
      })
      .where(eq(users.googleId, userData.googleId))
      .returning();
    return updated[0];
  }

  const inserted = await db
    .insert(users)
    .values({
      googleId: userData.googleId,
      email: userData.email,
      isSubscribed: userData.isSubscribed ?? false,
    })
    .returning();
  return inserted[0];
}

export async function getUser(googleId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.googleId, googleId))
    .limit(1);
  return result[0] || null;
}
