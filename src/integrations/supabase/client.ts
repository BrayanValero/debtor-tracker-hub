// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ygcbqgzpbsmqtvsfqbjb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnY2JxZ3pwYnNtcXR2c2ZxYmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NjQ1NTMsImV4cCI6MjA1NzI0MDU1M30.EKNpPSFVpGDEiX7keoDRkAdLhTW2SDAomGU3niNl9Sc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);