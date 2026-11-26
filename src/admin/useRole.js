import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

// Looks up the logged-in user's role ("customer", "staff" or "admin") from
// the profiles table. This is only used to decide what to SHOW - the real
// protection is the database's Row Level Security, which refuses changes
// from anyone who isn't staff/admin no matter what the browser does.
//
// Returns { role, isStaff, isAdmin, loading }.
export default function useRole(user) {
  // Remember which user the loaded role belongs to, so a stale role is
  // never shown after logging out/in as someone else.
  const [result, setResult] = useState({ userId: null, role: null });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Error loading role:", error);
        setResult({ userId: user.id, role: data?.role ?? "customer" });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = !!user && result.userId !== user.id;
  const role = user && !loading ? result.role : null;
  return {
    role,
    isStaff: role === "staff" || role === "admin",
    isAdmin: role === "admin",
    loading,
  };
}
