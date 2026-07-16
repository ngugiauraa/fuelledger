'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '../../lib/supabase'
import { useParams } from 'next/navigation'

export default function ManagersPage() {
  const { userId, isLoaded } = useAuth()
  const { slug } = useParams()
  const [managers, setManagers] = useState([])
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'manager' })

  useEffect(() => {
    if (isLoaded && userId && slug) {
      fetchCompanyAndManagers()
    }
  }, [isLoaded, userId, slug])

  const fetchCompanyAndManagers = async () => {
    setLoading(true)
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (companyData) {
      setCompany(companyData)
      const { data: managersData } = await supabase
        .from('managers')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false })
      if (managersData) setManagers(managersData)
    }
    setLoading(false)
  }

  const handleAddManager = async () => {
    if (!form.name || !form.email || !company) return
    if (managers.length >= 5) {
      alert('Maximum 5 managers allowed per company.')
      return
    }

    const { error } = await supabase.from('managers').insert([{
      name: form.name,
      email: form.email,
      role: form.role,
      company_id: company.id,
    }])

    if (error) console.error(error)
    else {
      setForm({ name: '', email: '', role: 'manager' })
      setShowForm(false)
      fetchCompanyAndManagers()
    }
  }

  const handleRemoveManager = async (id) => {
    await supabase.from('managers').delete().eq('id', id)
    fetchCompanyAndManagers()
  }

  const roleBadge = (role) => {
    if (role === 'admin') return <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">👑 Admin</span>
    return <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">⚙️ Manager</span>
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <a href={`/${slug}`} className="text-gray-400 text-sm hover:text-white mb-4 inline-block">← Back to Dashboard</a>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">⚙️ Managers</h1>
              <p className="text-gray-400 mt-1">Up to 5 managers per company</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={managers.length >= 5}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm">
              + Add Manager
            </button>
          </div>
        </div>

        {/* Slots indicator */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">Manager slots used</p>
            <p className="text-sm font-semibold">{managers.length}/5</p>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i <= managers.length ? 'bg-green-500' : 'bg-gray-700'}`} />
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800">
          {loading ? (
            <div className="p-8 text-center text-gray-500">⏳ Loading...</div>
          ) : managers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-3">👤</p>
              <p>No managers added yet.</p>
              <p className="text-sm mt-1">Add up to 5 managers who can access this dashboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4 font-semibold">{manager.name}</td>
                      <td className="p-4 text-gray-400">{manager.email}</td>
                      <td className="p-4">{roleBadge(manager.role)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleRemoveManager(manager.id)}
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

      {/* Add Manager Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">⚙️ Add Manager</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. Jane Wanjiku" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. jane@amoil.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Role</label>
                <select className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="manager">⚙️ Manager — can log trips and view dashboard</option>
                  <option value="admin">👑 Admin — full access including drivers and managers</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleAddManager}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg text-sm">
                Add Manager
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}