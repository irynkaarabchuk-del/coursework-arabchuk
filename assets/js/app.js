import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vfkngqwqkvhpmilmbmwo.supabase.co";
const SUPABASE_KEY = "sb_publishable_DDgY2svFqol0COtHIgMnaA_9_zmXdX9";

export const db = createClient(SUPABASE_URL, SUPABASE_KEY);