import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Если пользователь залогинен → на Победы
  if (user) {
    redirect('/wins')
  }

  // Если не залогинен → на логин
  redirect('/login')
}