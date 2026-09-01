import { createClient } from '@supabase/supabase-js'

// ponytail: factory functions evitano che supabaseAdmin finisca nel bundle client per import accidentale
export const supabaseAnon = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Solo API routes server-side — non importare in componenti client
export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
