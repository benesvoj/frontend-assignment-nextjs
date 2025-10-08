/**
 * Utility functions for user-related operations
 */

/**
 * Extract display name from Supabase user metadata or email
 * @param userMetadata - Supabase user metadata object
 * @param email - User's email address
 * @returns Display name for the user
 */
export function getUserDisplayName(
  userMetadata: { name?: string } | null | undefined,
  email: string
): string {
  return userMetadata?.name || email.split('@')[0];
}

/**
 * Transform Supabase user to application User type
 * @param supabaseUser - Supabase user object
 * @returns Application User object
 */
export function transformSupabaseUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
}): {
  id: string;
  email: string;
  name: string;
} {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: getUserDisplayName(supabaseUser.user_metadata, supabaseUser.email!),
  };
}
