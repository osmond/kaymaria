import { SupabaseClient } from '@supabase/supabase-js';

export type GetUserIdResult =
  | { userId: string }
  | { error: 'unauthorized' | 'misconfigured' };

/**
 * Determine the current user's id based on SINGLE_USER_MODE and Supabase auth.
 * Returns explicit error types for unauthorized users or misconfigured server
 * state (e.g. SINGLE_USER_MODE without SINGLE_USER_ID).
 */
export async function getUserId(
  supabase: SupabaseClient
): Promise<GetUserIdResult> {
  const singleUser = process.env.SINGLE_USER_MODE === 'true';

  if (singleUser) {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      console.error(
        'SINGLE_USER_MODE enabled but SINGLE_USER_ID not set'
      );
      return { error: 'misconfigured' };
    }
    return { userId };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: 'unauthorized' };
  }
  return { userId: user.id };
}

