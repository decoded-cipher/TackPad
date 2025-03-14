import { PROFILE } from '~/server/database/schema';
import { useDrizzle, eq } from '~/server/utils/drizzle';

export default defineEventHandler(async (event) => {
  // Get profileId from context (added by auth middleware)
  const profileId = event.context.session?.secure?.profileId;
  
  if (!profileId) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated or no profile found'
    });
  }
  
  const db = useDrizzle();
  const profile = await db.select().from(PROFILE).where(eq(PROFILE.id, profileId)).limit(1);
  
  if (!profile.length) {
    throw createError({
      statusCode: 404,
      message: 'Profile not found'
    });
  }
  
  return {
    id: profile[0].id,
    firstName: profile[0].firstName,
    email: profile[0].email,
    createdAt: profile[0].createdAt,
  }
});