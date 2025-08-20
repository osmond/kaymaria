import { getUserId } from "../getUserId";
import type { SupabaseClient } from "@supabase/supabase-js";
jest.mock("../supabaseAdmin", () => ({
  createSupabaseAdminClient: jest.fn(),
}));
const { createSupabaseAdminClient } = require("../supabaseAdmin");

describe("getUserId", () => {
  const mockSupabase = () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "auth-user" } }, error: null }),
    },
  }) as unknown as SupabaseClient;

  afterEach(() => {
    delete process.env.SINGLE_USER_MODE;
    delete process.env.SINGLE_USER_ID;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    jest.clearAllMocks();
  });

  it("generates id when SINGLE_USER_ID is missing", async () => {
    process.env.SINGLE_USER_MODE = "true";
    const supabase = mockSupabase();

    const res = await getUserId(supabase);
    expect(res).toEqual({ userId: expect.any(String) });
    expect(process.env.SINGLE_USER_ID).toBeDefined();
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("returns user id when SINGLE_USER_ID is set", async () => {
    process.env.SINGLE_USER_MODE = "true";
    process.env.SINGLE_USER_ID = "abc123";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    const supabase = mockSupabase();
    const admin = {
      auth: {
        admin: {
          getUserById: jest
            .fn()
            .mockResolvedValue({ data: { user: { id: "abc123" } }, error: null }),
          createUser: jest.fn(),
        },
      },
    } as any;
    (createSupabaseAdminClient as jest.Mock).mockReturnValue(admin);

    const res = await getUserId(supabase);
    expect(res).toEqual({ userId: "abc123" });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
    expect(createSupabaseAdminClient).toHaveBeenCalled();
    expect(admin.auth.admin.getUserById).toHaveBeenCalledWith("abc123");
    expect(admin.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it("creates user if SINGLE_USER_ID not found", async () => {
    process.env.SINGLE_USER_MODE = "true";
    process.env.SINGLE_USER_ID = "abc123";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    const supabase = mockSupabase();
    const admin = {
      auth: {
        admin: {
          getUserById: jest
            .fn()
            .mockResolvedValue({ data: { user: null }, error: { message: "User not found" } }),
          createUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
        },
      },
    } as any;
    (createSupabaseAdminClient as jest.Mock).mockReturnValue(admin);

    const res = await getUserId(supabase);
    expect(res).toEqual({ userId: "abc123" });
    expect(admin.auth.admin.getUserById).toHaveBeenCalledWith("abc123");
    expect(admin.auth.admin.createUser).toHaveBeenCalled();
  });

  it("skips admin verification when service role key missing", async () => {
    process.env.SINGLE_USER_MODE = "true";
    process.env.SINGLE_USER_ID = "abc123";
    const supabase = mockSupabase();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const res = await getUserId(supabase);
    expect(res).toEqual({ userId: "abc123" });
    expect(createSupabaseAdminClient).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "SUPABASE_SERVICE_ROLE_KEY not set, skipping single user verification"
    );
  });
});
