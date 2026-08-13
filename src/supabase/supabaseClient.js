import { createClient } from "@supabase/supabase-js";

// This is the one shared connection to our Supabase project - every file
// that talks to the database or does login/signup imports `supabase` from
// here instead of creating its own connection.
const supabaseUrl = "https://kgpkmqibgmtduepcjcmb.supabase.co";
// This is the "publishable"/anon key - it's safe to expose in frontend
// code. Access is controlled on the database side via Row Level Security
// (RLS) policies, not by keeping this key secret.
const supabaseAnonKey = "sb_publishable_jrYYANoG0qwNgAnd2ec3UQ_OvP3UOtv";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
