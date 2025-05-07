const PUBLIC_ROUTES = [
  "/api/_auth",
  "/api/board",
  "/api/bookmark",
  "/api/metadata",
  "/api/save",
  "/api/backup/export",
];

export default defineEventHandler(async (event) => {
  // Skip auth check during prerendering
  if (process.env.prerender) {
    return;
  }
  // Only apply to API routes
  if (!event.path.startsWith("/api/")) {
    return;
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    if (typeof route === "string") {
      return event.path.startsWith(route);
    }
    return event.path === route.path && event.method === route.method;
  });

  if (isPublicRoute) {
    return;
  }
  try {
    const session = await getUserSession(event);
    console.log("Session:", session);

    if (!session?.user?.providerID) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized - No valid session",
      });
    }

    // Get user profile
    const db = useDrizzle();

    const profile = await db.query.PROFILE.findFirst({
      where: eq(tables.PROFILE.providerID, session.user.providerID.toString()),
    });
    console.log("Profile:", profile);
    if (!profile) {
      // Instead of throwing error, set session without profile
      event.context = event.context || {};
      event.context.session = {
        user: session.user,
        secure: {
          role: null,
          profileId: null,
        },
      };
      return;
    }

    // Ensure context exists
    event.context = event.context || {};

    // Set session in context
    event.context.session = {
      user: session.user, // Keep the original user object
      secure: {
        profileId: profile.id,
      },
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    throw error;
  }
});
