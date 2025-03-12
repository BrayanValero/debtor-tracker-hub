
/**
 * Type declaration file to help TypeScript find the types included in @supabase/supabase-js
 */
declare module '@supabase/supabase-js' {
  // Re-export everything from the module
  export * from '@supabase/supabase-js';
  
  // Explicitly declare the types that are causing issues
  export type Session = import('@supabase/gotrue-js').Session;
  export type User = import('@supabase/gotrue-js').User;
  export function createClient<T = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}
