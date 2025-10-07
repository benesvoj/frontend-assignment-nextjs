// Server-side Supabase client for Server Components/Actions
export async function createServerClient() {
  // Dynamic import to avoid issues with next/headers in client components
  const { createServerClient: createSupabaseServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            console.error('Error setting cookies')
          }
        },
      },
    }
  )
}

// Admin client for operations that need elevated privileges (use sparingly)
export async function createAdminClient() {
  const { createServerClient: createSupabaseServerClient } = await import('@supabase/ssr')
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
