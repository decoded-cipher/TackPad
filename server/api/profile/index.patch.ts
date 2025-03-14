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
  
  // Get the data from request body
  const body = await readBody(event);
  
  // Validate required fields
  if (!body || Object.keys(body).length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Request body is required'
    });
  }
  
  // Create an update object with only allowed fields
  const updateData: Record<string, any> = {};
  
  // Only allow updating firstName field
  if (body.firstName !== undefined) updateData.firstName = body.firstName;
  
  // Check if profile exists
  const db = useDrizzle();
  const existingProfile = await db.select().from(PROFILE).where(eq(PROFILE.id, profileId)).limit(1);
  
  if (!existingProfile.length) {
    throw createError({
      statusCode: 404,
      message: 'Profile not found'
    });
  }

  // Allow updating email for GitHub users with empty email
  if (body.email !== undefined && 
      existingProfile[0].authProvider === 'github' && 
      (!existingProfile[0].email || existingProfile[0].email === '')) {
    updateData.email = body.email;
  }
  
  // Update the profile
  await db.update(PROFILE)
    .set(updateData)
    .where(eq(PROFILE.id, profileId));
  
  // Return the updated profile
  const updatedProfile = await db.select().from(PROFILE).where(eq(PROFILE.id, profileId)).limit(1);
  return {
    id: updatedProfile[0].id,
    firstName: updatedProfile[0].firstName,
    email: updatedProfile[0].email,
    createdAt: updatedProfile[0].createdAt,
  }
});