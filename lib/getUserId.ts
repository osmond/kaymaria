import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

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

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set, skipping single user verification');
      return { userId };
    }

    try {
      const { createSupabaseAdminClient } = await import('./supabaseAdmin');
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error || !data.user) {
        const { error: createError } = await admin.auth.admin.createUser({
          id: userId,
          email: `${userId}@example.com`,
          password: randomUUID(),
          email_confirm: true,
        });
        if (createError) {
          console.error('Failed to ensure single user exists', createError);
          return { error: 'misconfigured' };
        }
      }
    } catch (e) {
      console.error('Failed to ensure single user exists', e);
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

