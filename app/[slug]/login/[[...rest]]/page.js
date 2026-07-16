'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { SignIn } from '@clerk/nextjs'

export default function CompanyLogin() {
  const { slug } = useParams()
  const [company, setCompany] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    fetchCompany()
  }, [slug])

  const fetchCompany = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()
    if (data) setCompany(data)
  }

  if (!role) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          {company?.logo_url ? (
            <img src={company.logo_url} alt="logo" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <span className="text-4xl">⛽</span>
          )}
          <h1 className="text-2xl font-bold text-white">{company?.name || '...'}</h1>
        </div>

        <p className="text-gray-400 mb-8">Who are you signing in as?</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setRole('manager')}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-green-500 rounded-2xl p-6 text-center transition-all">
            <p className="text-3xl mb-3">⚙️</p>
            <p className="font-semibold text-white">Manager</p>
            <p className="text-gray-400 text-xs mt-1">Access company dashboard</p>
          </button>
          <button
            onClick={() => setRole('driver')}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-yellow-500 rounded-2xl p-6 text-center transition-all">
            <p className="text-3xl mb-3">🚛</p>
            <p className="font-semibold text-white">Driver</p>
            <p className="text-gray-400 text-xs mt-1">Access your trip portal</p>
          </button>
        </div>

        <p className="text-gray-600 text-xs mt-8">Powered by FuelLedger</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <button
            onClick={() => setRole(null)}
            className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
            ← Back
          </button>
          <p className="text-gray-400">
            Signing in as <span className={role === 'manager' ? 'text-green-400' : 'text-yellow-400'}>
              {role === 'manager' ? '⚙️ Manager' : '🚛 Driver'}
            </span>
          </p>
        </div>
       <SignIn
         routing="hash"
         afterSignInUrl={role === 'manager' ? `/${slug}` : `/${slug}/driver`}
         afterSignUpUrl={role === 'manager' ? `/${slug}` : `/${slug}/driver`}
        />
      </div>
    </main>
  )
}