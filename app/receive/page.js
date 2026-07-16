'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '@clerk/nextjs'

export default function ReceivePage() {
  const { userId } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReceive, setShowReceive] = useState(null)
  const [receivedLitres, setReceivedLitres] = useState('')

  useEffect(() => {
    fetchArrivedTrips()
  }, [])

  const fetchArrivedTrips = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('status', 'arrived')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setTrips(data)
    setLoading(false)
  }

  const handleReceiveDelivery = async () => {
    const delivered = parseInt(receivedLitres)
    const loaded = showReceive.litres_loaded
    const gap = loaded - delivered
    const isFlagged = gap > loaded * 0.01

    const { error } = await supabase
      .from('trips')
      .update({
        litres_delivered: delivered,
        status: isFlagged ? 'flagged' : 'delivered',
        received_by: userId,
      })
      .eq('id', showReceive.id)

    if (error) console.error(error)
    else {
      setShowReceive(null)
      setReceivedLitres('')
      fetchArrivedTrips()
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <a href="/" className="text-gray-400 text-sm hover:text-white mb-4 inline-block">← Back to Dashboard</a>
          <h1 className="text-3xl font-bold text-blue-400">📥 Receiving Depot</h1>
          <p className="text-gray-400 mt-1">Confirm fuel deliveries arriving at your depot</p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold text-lg">Trucks That Have Arrived</h2>
            <p className="text-gray-400 text-sm mt-1">These trucks have confirmed arrival and are waiting for you to verify litres received</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">⏳ Loading...</div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-3">✅</p>
              <p>No trucks waiting for delivery confirmation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left p-4">Truck ID</th>
                    <th className="text-left p-4">Driver</th>
                    <th className="text-left p-4">From Depot</th>
                    <th className="text-left p-4">Loaded</th>
                    <th className="text-left p-4">Arrived</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4 font-mono">{trip.truck_id}</td>
                      <td className="p-4">{trip.driver}</td>
                      <td className="p-4">{trip.depot}</td>
                      <td className="p-4">{trip.litres_loaded.toLocaleString()} L</td>
                      <td className="p-4 text-gray-400">
                        {new Date(trip.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi' })}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setShowReceive(trip)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-lg">
                          Confirm Receipt
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

      {/* Receive Modal */}
      {showReceive && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-1">📥 Confirm Receipt</h2>
            <p className="text-gray-400 text-sm mb-4">Enter the actual litres you received</p>
            <div className="bg-gray-800 rounded-lg p-3 text-sm space-y-1 mb-4">
              <p><span className="text-gray-400">Truck:</span> {showReceive.truck_id}</p>
              <p><span className="text-gray-400">Driver:</span> {showReceive.driver}</p>
              <p><span className="text-gray-400">From:</span> {showReceive.depot}</p>
              <p><span className="text-gray-400">Loaded at source:</span> {showReceive.litres_loaded.toLocaleString()} L</p>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-400">Litres Actually Received</label>
              <input
                type="number"
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 33000"
                value={receivedLitres}
                onChange={(e) => setReceivedLitres(e.target.value)}
              />
            </div>
            <p className="text-yellow-400 text-xs mb-4">⚠ Any gap over 1% will be automatically flagged for investigation.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReceive(null); setReceivedLitres('') }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={handleReceiveDelivery}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm">
                Submit Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}