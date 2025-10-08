import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types';

/**
 * Transform Supabase user to application User type
 */
export const transformSupabaseUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email!,
  name: supabaseUser.user_metadata.name || supabaseUser.email!.split('@')[0],
});
