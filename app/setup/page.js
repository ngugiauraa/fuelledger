'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const imgRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    primaryColor: '#22c55e',
  })
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogo(file)
    const url = URL.createObjectURL(file)
    setLogoPreview(url)

    const img = new Image()
    img.src = url
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const pixel = ctx.getImageData(
          Math.floor(img.width / 2),
          Math.floor(img.height / 2),
          1, 1
        ).data
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2])
        setForm(prev => ({ ...prev, primaryColor: hex }))
      } catch (err) {
        console.error('Color extraction failed:', err)
      }
    }
  }

  const handleSetup = async () => {
    if (!form.name) return
    setLoading(true)

    let logoUrl = null

    if (logo) {
      const fileExt = logo.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logo)

      if (uploadError) {
        console.error('Logo upload error:', uploadError)
      } else {
        const { data } = supabase.storage.from('logos').getPublicUrl(fileName)
        logoUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('companies').insert([{
      name: form.name,
      primary_color: form.primaryColor,
      logo_url: logoUrl,
      owner_id: userId,
      slug: generateSlug(form.name),
    }])

    if (error) {
      console.error(error)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 w-full max-w-md">
        
        <div className="mb-6 text-center">
          <p className="text-4xl mb-3">⛽</p>
          <h1 className="text-2xl font-bold text-white">Set Up Your Company</h1>
          <p className="text-gray-400 mt-1 text-sm">This takes 30 seconds. You only do this once.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Company Name</label>
            <input
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              placeholder="e.g. Petrocity Enterprises"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {form.name && (
              <p className="text-xs text-gray-500 mt-1">
                Your portal URL: <span className="text-green-400">fuelledger.com/{generateSlug(form.name)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Company Logo</label>
            <p className="text-xs text-gray-500 mt-0.5">Brand color will be auto-extracted from your logo</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img ref={imgRef} src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-2xl">🏢</span>
                )}
              </div>
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm px-4 py-2 rounded-lg">
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Brand Color</label>
            <p className="text-xs text-gray-500 mt-0.5">Auto-filled from logo — or pick manually</p>
            <div className="flex gap-3 mt-1 items-center">
              <input
                type="color"
                className="w-12 h-10 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              />
              <span className="font-mono text-sm text-gray-300">{form.primaryColor}</span>
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-xl p-4 border mt-2" style={{ borderColor: form.primaryColor + '40', backgroundColor: form.primaryColor + '10' }}>
            <p className="text-xs text-gray-400 mb-3">Dashboard Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: logoPreview ? 'transparent' : form.primaryColor }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  form.name ? form.name[0].toUpperCase() : '?'
                )}
              </div>
              <div>
                <p className="font-bold text-lg leading-tight" style={{ color: form.primaryColor }}>
                  {form.name || 'Your Company Name'}
                </p>
                <p className="text-xs text-gray-400">Fuel Supply Chain Transparency Platform</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSetup}
          disabled={loading || !form.name}
          className="w-full mt-6 font-semibold py-3 rounded-lg text-white disabled:opacity-50 transition-colors"
          style={{ backgroundColor: form.primaryColor }}>
          {loading ? 'Setting up...' : 'Create Company & Go to Dashboard →'}
        </button>

      </div>
    </main>
  )
}