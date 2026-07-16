'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth, UserButton } from '@clerk/nextjs'
import { useParams } from 'next/navigation'

export default function DriverPortal() {
  const { userId, isLoaded } = useAuth()
  const { slug, driverSlug } = useParams()
  const [trips, setTrips] = useState([])
  const [driver, setDriver] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && userId && slug) {
      fetchCompanyAndDriver()
    }
  }, [isLoaded, userId, slug])

  useEffect(() => {
    if (driver && company) fetchDriverTrips()
  }, [driver, company])

  const fetchCompanyAndDriver = async () => {
    const { data: companyData } = await supabase
      .from('companies').select('*').eq('slug', slug).single()

    if (companyData) {
      setCompany(companyData)
      const { data: driverData } = await supabase
        .from('drivers').select('*')
        .eq('company_id', companyData.id)
        .eq('clerk_id', userId)
        .single()
      if (driverData) setDriver(driverData)
    }
  }

  const fetchDriverTrips = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('trips').select('*')
      .eq('driver', driver.name)
      .eq('user_id', company.owner_id)
      .order('created_at', { ascending: false })
    if (data) setTrips(data)
    setLoading(false)
  }

  const handleAcceptTrip = async (trip) => {
    await supabase.from('trips').update({ status: 'in-transit' }).eq('id', trip.id)
    fetchDriverTrips()
  }

  const handleMarkArrived = async (trip) => {
    await supabase.from('trips').update({ status: 'arrived' }).eq('id', trip.id)
    if (trip.depot_email) {
      await fetch('/api/notify-depot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          depotEmail: trip.depot_email,
          depotName: trip.depot,
          driverName: trip.driver,
          truckId: trip.truck_id,
          litresLoaded: trip.litres_loaded,
          companyName: company?.name,
        }),
      })
    }
    fetchDriverTrips()
  }

const getElapsedTime = (createdAt) => {
  const now = new Date()
  const start = new Date(createdAt)
  const diffMs = now - start
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (diffHrs > 0) return `${diffHrs}h ${diffMins}m`
  return `${diffMins}m`
}

const getTimeStatus = (createdAt, expectedHours) => {
  if (!expectedHours) return null
  const now = new Date()
  const start = new Date(createdAt)
  const elapsedHrs = (now - start) / (1000 * 60 * 60)
  const ratio = elapsedHrs / expectedHours

  if (ratio < 0.85) return { label: '🟢 On Time', color: 'text-green-400', bg: 'bg-green-500/20' }
  if (ratio < 1.15) return { label: '🟡 Running Late', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
  return { label: '🔴 Very Late', color: 'text-red-400', bg: 'bg-red-500/20' }
}

  const statusBadge = (status) => {
    if (status === 'delivered') return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">✅ Delivered</span>
    if (status === 'flagged') return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">⚠ Flagged</span>
    if (status === 'arrived') return <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">📍 Arrived</span>
    if (status === 'in-transit') return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">🚛 In Transit</span>
    if (status === 'pending') return <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">⏳ Pending</span>
  }

  if (!driver && !loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-4xl mb-4">🚫</p>
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 text-sm">You are not registered as a driver for this company.</p>
      </div>
    </main>
  )

  const pendingTrips = trips.filter(t => t.status === 'pending')
  const activeTrip = trips.find(t => t.status === 'in-transit')
  const historyTrips = trips.filter(t => !['pending', 'in-transit'].includes(t.status))

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {company?.logo_url && <img src={company.logo_url} alt="logo" className="w-8 h-8 rounded-lg object-cover" />}
            <div>
              <p className="text-xs text-gray-400">{company?.name}</p>
              <p className="text-sm font-semibold">Driver Portal</p>
            </div>
          </div>
          <UserButton afterSignOutUrl={`/${slug}/login`} />
        </div>

        {/* Driver Profile */}
        {driver && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center text-black text-xl font-bold">
                {driver.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{driver.name}</h2>
                <p className="text-gray-400 text-sm">📧 {driver.email || '—'}</p>
                <p className="text-gray-400 text-sm">📞 {driver.phone || '—'}</p>
                <p className="text-gray-400 text-sm">🚛 <span className="font-mono text-white">{driver.truck_id || 'No truck assigned'}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center">
            <p className="text-gray-400 text-xs">Total Trips</p>
            <p className="text-2xl font-bold text-white mt-1">{trips.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center">
            <p className="text-gray-400 text-xs">Delivered</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{trips.filter(t => t.status === 'delivered').length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center">
            <p className="text-gray-400 text-xs">Flagged</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{trips.filter(t => t.status === 'flagged').length}</p>
          </div>
        </div>

        {/* Pending Trips — needs acceptance */}
        {pendingTrips.map(trip => (
          <div key={trip.id} className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
            <p className="text-purple-400 font-semibold text-sm mb-2">⏳ New Trip — Tap to Accept</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{trip.depot}</p>
                <p className="text-gray-400 text-sm">{trip.litres_loaded.toLocaleString()} L · {trip.truck_id}</p>
              </div>
              <button onClick={() => handleAcceptTrip(trip)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                Accept
              </button>
            </div>
          </div>
        ))}

        {/* Active Trip */}
        {activeTrip && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-start mb-3">
           <p className="text-yellow-400 font-semibold text-sm">🚛 Active Trip</p>
        <div className="flex gap-2">
        <span className="text-yellow-400 text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
         ⏱ {getElapsedTime(activeTrip.created_at)} elapsed
        </span>
         {activeTrip.expected_hours && (() => {
         const status = getTimeStatus(activeTrip.created_at, activeTrip.expected_hours)
         return (
        <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
          {status.label}
        </span>
        )
        })()}
           </div>
        </div>
            <p className="text-lg font-bold">{activeTrip.depot}</p>
            <p className="text-gray-400 text-sm mb-1">{activeTrip.litres_loaded.toLocaleString()} L · {activeTrip.truck_id}</p>
            <p className="text-gray-400 text-xs mb-4">
              Started: {new Date(activeTrip.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi' })}
            </p>
            <button onClick={() => handleMarkArrived(activeTrip)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl text-sm">
              ✅ I Have Arrived at {activeTrip.depot}
            </button>
          </div>
        )}

        {/* Trip History */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold">Trip History</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">⏳ Loading...</div>
          ) : historyTrips.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-3">🚛</p>
              <p>No completed trips yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left p-4">Depot</th>
                    <th className="text-left p-4">Loaded</th>
                    <th className="text-left p-4">Received</th>
                    <th className="text-left p-4">Time Taken</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">{trip.depot}</td>
                      <td className="p-4">{trip.litres_loaded.toLocaleString()} L</td>
                      <td className="p-4">{trip.litres_delivered ? trip.litres_delivered.toLocaleString() + ' L' : '—'}</td>
                      <td className="p-4 text-gray-400">
                        {getElapsedTime(trip.created_at)}
                        {trip.expected_hours && (
                           <span className="text-xs text-gray-600 ml-1">/ {trip.expected_hours}h expected</span>
                         )}
                      </td>
                      <td className="p-4">{statusBadge(trip.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}