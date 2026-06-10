import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kgpkmqibgmtduepcjcmb.supabase.co";
const supabaseAnonKey = "sb_publishable_jrYYANoG0qwNgAnd2ec3UQ_OvP3UOtv";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);