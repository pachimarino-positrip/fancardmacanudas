
Build Error
Next.js (15.1.6) is outdated (learn more)
Failed to compile

./app/auth/callback/route.ts:2:1
Module not found: Can't resolve '@/lib/supabase/server'
  1 | import { NextResponse } from 'next/server';
> 2 | import { createClient } from '@/lib/supabase/server';
    | ^
  3 |
  4 | export async function GET(request: Request) {
  5 |   const { searchParams, origin } = new URL(request.url);

https://nextjs.org/docs/messages/module-not-found
This error occurred during the build process and can only be dismissed by fixing the error.