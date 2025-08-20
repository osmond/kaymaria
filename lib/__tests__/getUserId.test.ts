import { getUserId } from "../getUserId";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("getUserId", () => {
  const mockSupabase = () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "auth-user" } }, error: null }),
    },
  }) as unknown as SupabaseClient;

  afterEach(() => {
    delete process.env.SINGLE_USER_MODE;
    delete process.env.SINGLE_USER_ID;
  });

  it("returns misconfigured when SINGLE_USER_ID is missing", async () => {
    process.env.SINGLE_USER_MODE = "true";
    const supabase = mockSupabase();

    const res = await getUserId(supabase);
    expect(res).toEqual({ error: "misconfigured" });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("returns user id when SINGLE_USER_ID is set", async () => {
    process.env.SINGLE_USER_MODE = "true";
    process.env.SINGLE_USER_ID = "abc123";
    const supabase = mockSupabase();

    const res = await getUserId(supabase);
    expect(res).toEqual({ userId: "abc123" });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });
});
