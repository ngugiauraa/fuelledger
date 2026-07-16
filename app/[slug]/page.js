'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { UserButton } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { useParams } from 'next/navigation'

export default function CompanyDashboard() {
  const { userId, isLoaded } = useAuth()
  const { slug } = useParams()
  const [trips, setTrips] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showQR, setShowQR] = useState(null)
  const [showArrive, setShowArrive] = useState(null)
  const [form, setForm] = useState({
    truckId: '',
    driver: '',
    depot: '',
    litresLoaded: '',
  })
  const [company, setCompany] = useState(null)
  const [filterDate, setFilterDate] = useState('all')
  const [filterDriver, setFilterDriver] = useState('all')
  const [filterDepot, setFilterDepot] = useState('all')

  useEffect(() => {
    if (isLoaded && slug) {
      fetchCompany()
    }
  }, [isLoaded, slug])

  useEffect(() => {
    if (company) {
      fetchTrips()
      fetchDrivers()
    }
  }, [company])

  const fetchCompany = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()
    if (data) setCompany(data)
  }

  const fetchTrips = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', company.owner_id)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setTrips(data)
    setLoading(false)
  }

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from('drivers')
      .select('*')
      .eq('company_id', company.id)
    if (data) setDrivers(data)
  }

  const uniqueDrivers = [...new Set(trips.map(t => t.driver))]
  const uniqueDepots = [...new Set(trips.map(t => t.depot))]

  const filteredTrips = trips.filter(trip => {
    const now = new Date()
    const tripDate = new Date(trip.created_at)

    if (filterDate === 'today') {
      if (tripDate.toDateString() !== now.toDateString()) return false
    } else if (filterDate === '7days') {
      const diff = (now - tripDate) / (1000 * 60 * 60 * 24)
      if (diff > 7) return false
    } else if (filterDate === '30days') {
      const diff = (now - tripDate) / (1000 * 60 * 60 * 24)
      if (diff > 30) return false
    }

    if (filterDriver !== 'all' && trip.driver !== filterDriver) return false
    if (filterDepot !== 'all' && trip.depot !== filterDepot) return false

    return true
  })

  const totalDispatched = filteredTrips.reduce((sum, t) => sum + t.litres_loaded, 0)
  const totalDelivered = filteredTrips.reduce((sum, t) => sum + (t.litres_delivered || 0), 0)
  const flagged = filteredTrips.filter((t) => t.status === 'flagged').length

  const statusBadge = (status) => {
    if (status === 'delivered') return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">✅ Delivered</span>
    if (status === 'flagged') return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">⚠ Flagged</span>
    if (status === 'arrived') return <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">📍 Arrived</span>
    if (status === 'in-transit') return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">🚛 In Transit</span>
  }

  const handleLogTrip = async () => {
    if (!form.truckId || !form.driver || !form.depot || !form.litresLoaded) return
    const { error } = await supabase.from('trips').insert([{
    truck_id: form.truckId,
    driver: form.driver,
    depot: form.depot,
    depot_email: form.depotEmail || null,
    litres_loaded: parseInt(form.litresLoaded),
    expected_hours: form.expectedHours ? parseInt(form.expectedHours) : null,
    status: 'pending',
    user_id: company.owner_id,
    company_id: company.id,
    }])
    if (error) console.error(error)
    else {
      setForm({ truckId: '', driver: '', depot: '', litresLoaded: '' })
      setShowForm(false)
      fetchTrips()
    }
  }

  const handleDriverArrival = async () => {
    const { error } = await supabase
      .from('trips')
      .update({ status: 'arrived' })
      .eq('id', showArrive.id)
    if (error) console.error(error)
    else {
      setShowArrive(null)
      fetchTrips()
    }
  }

  const qrData = (trip) => JSON.stringify({
    tripId: trip.id,
    truckId: trip.truck_id,
    driver: trip.driver,
    depot: trip.depot,
    litresLoaded: trip.litres_loaded,
    company: slug,
  })

  if (!company) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="logo" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <span className="text-3xl">⛽</span>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{company?.name}</h1>
              <p className="text-gray-400 mt-1">Fuel Supply Chain Transparency Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={`/${slug}/drivers`} className="text-gray-400 hover:text-white text-sm">👤 Drivers</a>
            <a href={`/${slug}/managers`} className="text-gray-400 hover:text-white text-sm">⚙️ Managers</a>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Trips</p>
            <p className="text-2xl font-bold text-white mt-1">{filteredTrips.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Litres Dispatched</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{totalDispatched.toLocaleString()} L</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Litres Delivered</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{totalDelivered.toLocaleString()} L</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Flagged Discrepancies</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{flagged}</p>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Recent Trips</h2>
              <button onClick={() => setShowForm(true)} className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg text-sm">
                + New Trip
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              <select value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500">
                <option value="all">All Drivers</option>
                {uniqueDrivers.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterDepot} onChange={(e) => setFilterDepot(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500">
                <option value="all">All Depots</option>
                {uniqueDepots.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">⏳ Loading trips...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-3">🚛</p>
              <p>No trips found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left p-4">Truck ID</th>
                    <th className="text-left p-4">Driver</th>
                    <th className="text-left p-4">Depot</th>
                    <th className="text-left p-4">Loaded</th>
                    <th className="text-left p-4">Received</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Time</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4 font-mono">{trip.truck_id}</td>
                      <td className="p-4">{trip.driver}</td>
                      <td className="p-4">{trip.depot}</td>
                      <td className="p-4">{trip.litres_loaded.toLocaleString()} L</td>
                      <td className="p-4">{trip.litres_delivered ? trip.litres_delivered.toLocaleString() + ' L' : '—'}</td>
                      <td className="p-4">{statusBadge(trip.status)}</td>
                      <td className="p-4 text-gray-400">
                        {new Date(trip.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi' })}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => setShowQR(trip)} className="text-green-400 hover:text-green-300 text-xs underline">QR</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Flow explanation */}
        <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-gray-400 text-sm font-semibold mb-2">📋 How it works:</p>
          <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
            <span>1️⃣ <span className="text-white">Dispatch manager</span> logs trip → QR generated</span>
            <span>→</span>
            <span>2️⃣ <span className="text-yellow-400">Driver</span> marks arrived on their portal</span>
            <span>→</span>
            <span>3️⃣ <span className="text-blue-400">Receiving depot</span> confirms litres via secure link</span>
            <span>→</span>
            <span>4️⃣ <span className="text-red-400">System flags</span> any discrepancy automatically</span>
          </div>
        </div>

      </div>

      {/* New Trip Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">🚛 Log New Trip</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Driver</label>
                <select
                  className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  value={form.driver}
                  onChange={(e) => {
                    const selected = drivers.find(d => d.name === e.target.value)
                    setForm({ ...form, driver: e.target.value, truckId: selected?.truck_id || '' })
                  }}>
                  <option value="">Select a driver...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.name}>{d.name} — {d.truck_id || 'No truck assigned'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Truck ID</label>
                <input
                  className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="Auto-filled from driver or enter manually"
                  value={form.truckId}
                  onChange={(e) => setForm({ ...form, truckId: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Destination Depot</label>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. Embakasi Depot" value={form.depot} onChange={(e) => setForm({ ...form, depot: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Destination Depot Email</label>
                <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. manager@embakasidepot.com" value={form.depotEmail || ''} onChange={(e) => setForm({ ...form, depotEmail: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">They'll get a secure link to confirm receipt when the driver arrives</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Litres Loaded</label>
                <input type="number" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. 33000" value={form.litresLoaded} onChange={(e) => setForm({ ...form, litresLoaded: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Expected Trip Duration (hours)</label>
                <input
                  type="number"
                  className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="e.g. 8 for Mombasa to Nairobi"
                  value={form.expectedHours || ''}
                  onChange={(e) => setForm({ ...form, expectedHours: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleLogTrip} className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg text-sm">Log Trip & Generate QR</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-sm mx-4 text-center">
            <h2 className="text-xl font-bold mb-1">📦 Trip QR Code</h2>
            <p className="text-gray-400 text-sm mb-4">Scan to track this delivery</p>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <QRCodeSVG value={qrData(showQR)} size={200} />
            </div>
            <div className="text-left bg-gray-800 rounded-lg p-3 text-sm space-y-1 mb-4">
              <p><span className="text-gray-400">Truck:</span> {showQR.truck_id}</p>
              <p><span className="text-gray-400">Driver:</span> {showQR.driver}</p>
              <p><span className="text-gray-400">Depot:</span> {showQR.depot}</p>
              <p><span className="text-gray-400">Loaded:</span> {showQR.litres_loaded.toLocaleString()} L</p>
            </div>
            <button onClick={() => setShowQR(null)} className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Driver Arrival Modal */}
      {showArrive && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-1">📍 Confirm Arrival</h2>
            <p className="text-gray-400 text-sm mb-4">Driver confirms they have arrived at the depot</p>
            <div className="bg-gray-800 rounded-lg p-3 text-sm space-y-1 mb-6">
              <p><span className="text-gray-400">Truck:</span> {showArrive.truck_id}</p>
              <p><span className="text-gray-400">Driver:</span> {showArrive.driver}</p>
              <p><span className="text-gray-400">Depot:</span> {showArrive.depot}</p>
              <p><span className="text-gray-400">Loaded:</span> {showArrive.litres_loaded.toLocaleString()} L</p>
            </div>
            <p className="text-yellow-400 text-xs mb-4">⚠ Driver can only confirm arrival. Receiving depot will get an email to confirm litres.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowArrive(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleDriverArrival} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-lg text-sm">Confirm Arrival</button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}