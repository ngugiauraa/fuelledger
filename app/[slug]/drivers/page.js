'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '../../lib/supabase'
import { useParams } from 'next/navigation'

export default function DriversPage() {
  const { userId, isLoaded } = useAuth()
  const { slug } = useParams()
  const [drivers, setDrivers] = useState([])
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', truckId: '', email: '' })

  useEffect(() => {
    if (isLoaded && userId && slug) {
      fetchCompanyAndDrivers()
    }
  }, [isLoaded, userId, slug])

  const fetchCompanyAndDrivers = async () => {
    setLoading(true)
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (companyData) {
      setCompany(companyData)
      const { data: driversData } = await supabase
        .from('drivers')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false })
      if (driversData) setDrivers(driversData)
    }
    setLoading(false)
  }

  const handleAddDriver = async () => {
    if (!form.name || !company) return

    const { error } = await supabase.from('drivers').insert([{
      name: form.name,
      phone: form.phone,
      truck_id: form.truckId,
      email: form.email,
      company_id: company.id,
    }])

    if (error) {
      console.error(error)
      return
    }

    if (form.email) {
      await fetch('/api/invite-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: form.name,
          driverEmail: form.email,
          companyName: company.name,
          companySlug: slug,
        }),
      })
    }

    setForm({ name: '', phone: '', truckId: '', email: '' })
    setShowForm(false)
    fetchCompanyAndDrivers()
  }

  const handleDeleteDriver = async (id) => {
    await supabase.from('drivers').delete().eq('id', id)
    fetchCompanyAndDrivers()
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <a href={`/${slug}`} className="text-gray-400 text-sm hover:text-white mb-4 inline-block">← Back to Dashboard</a>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">🚛 Drivers</h1>
              <p className="text-gray-400 mt-1">Manage your company's drivers</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg text-sm">
              + Add Driver
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800">
          {loading ? (
            <div className="p-8 text-center text-gray-500">⏳ Loading...</div>
          ) : drivers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-3">👤</p>
              <p>No drivers added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Phone</th>
                    <th className="text-left p-4">Truck ID</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Portal Access</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4 font-semibold">
                      <a href={`/${slug}/drivers/${driver.name.toLowerCase().replace(/\s+/g, '')}`}
                      className="text-green-400 hover:underline">
                      {driver.name}
                     </a>
                    </td>
                      <td className="p-4 text-gray-400">{driver.phone || '—'}</td>
                      <td className="p-4 font-mono">{driver.truck_id || '—'}</td>
                      <td className="p-4 text-gray-400">{driver.email || '—'}</td>
                      <td className="p-4">
                        {driver.clerk_id
                          ? <span className="text-green-400 text-xs">✅ Active</span>
                          : driver.email
                          ? <span className="text-blue-400 text-xs">📧 Invite sent</span>
                          : <span className="text-yellow-400 text-xs">⚠ No login set</span>}
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteDriver(driver.id)}
                          className="text-red-400 hover:text-red-300 text-xs underline">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add Driver Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">👤 Add Driver</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. John Kamau" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Phone Number</label>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. 0712 345 678" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Assigned Truck ID</label>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. KBZ 001A" value={form.truckId}
                  onChange={(e) => setForm({ ...form, truckId: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Driver Email</label>
                <p className="text-xs text-gray-500 mt-0.5">An invite will be sent automatically to this email</p>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. gichuki@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleAddDriver}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg text-sm">
                Add Driver & Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}