'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from './lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        redirectToCompany()
      } else {
        router.push('/landing')
      }
    }
  }, [isLoaded, userId])

  const redirectToCompany = async () => {
    const { data } = await supabase
      .from('companies')
      .select('slug')
      .eq('owner_id', userId)
      .single()

    if (data?.slug) {
      router.push(`/${data.slug}`)
    } else {
      router.push('/setup')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )
}