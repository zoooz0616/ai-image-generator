import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/chat';

/**
 * Creates or updates a user profile
 */
export async function createOrUpdateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const profileData = {
    id: user.id,
    email: user.email!,
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profileData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save user profile: ${error.message}`);
  }

  return data;
}

/**
 * Fetches the current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile doesn't exist yet, create a basic one
      return await createOrUpdateUserProfile({
        email: user.email!,
        full_name: user.user_metadata?.full_name,
      });
    }
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}

/**
 * Updates user profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return data;
}