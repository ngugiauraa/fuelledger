'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams } from 'next/navigation'

export default function ConfirmPage() {
  const { token } = useParams()
  const [trip, setTrip] = useState(null)
  const [litresReceived, setLitresReceived] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrip()
  }, [token])

  const fetchTrip = async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('confirm_token', token)
      .single()

    if (!data) {
      setError('This link is invalid or has already been used.')
    } else if (data.token_used) {
      setError('This confirmation link has already been used.')
    } else {
      setTrip(data)
    }
    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!litresReceived) return
    setSubmitting(true)

    const delivered = parseInt(litresReceived)
    const loaded = trip.litres_loaded
    const gap = loaded - delivered
    const isFlagged = gap > loaded * 0.01

    const { error } = await supabase
      .from('trips')
      .update({
        litres_delivered: delivered,
        status: isFlagged ? 'flagged' : 'delivered',
        token_used: true,
      })
      .eq('id', trip.id)

    if (error) {
      console.error(error)
      setSubmitting(false)
    } else {
      setDone(true)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">⏳ Loading...</p>
    </main>
  )

  if (error) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-4">🚫</p>
        <h1 className="text-xl font-bold mb-2">Link Invalid</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    </main>
  )

  if (done) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-4">✅</p>
        <h1 className="text-xl font-bold mb-2">Delivery Confirmed!</h1>
        <p className="text-gray-400">Thank you. The delivery has been recorded and the dispatch company has been notified.</p>
        {parseInt(litresReceived) < trip?.litres_loaded && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm font-semibold">⚠ Discrepancy Flagged</p>
            <p className="text-gray-400 text-sm mt-1">
              {trip.litres_loaded.toLocaleString()}L was dispatched but only {parseInt(litresReceived).toLocaleString()}L was received.
              A {(trip.litres_loaded - parseInt(litresReceived)).toLocaleString()}L gap has been flagged for investigation.
            </p>
          </div>
        )}
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <p className="text-4xl mb-3">📥</p>
          <h1 className="text-2xl font-bold">Confirm Fuel Receipt</h1>
          <p className="text-gray-400 text-sm mt-1">Please enter the exact litres you received</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-6 text-sm space-y-2">
          <p><span className="text-gray-400">Driver:</span> {trip.driver}</p>
          <p><span className="text-gray-400">Truck:</span> {trip.truck_id}</p>
          <p><span className="text-gray-400">Dispatched:</span> {trip.litres_loaded.toLocaleString()} L</p>
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-400">Litres Actually Received</label>
          <input
            type="number"
            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white text-lg focus:outline-none focus:border-blue-500"
            placeholder="e.g. 33000"
            value={litresReceived}
            onChange={(e) => setLitresReceived(e.target.value)}
          />
          {litresReceived && parseInt(litresReceived) < trip.litres_loaded && (
            <p className="text-red-400 text-xs mt-2">
              ⚠ {(trip.litres_loaded - parseInt(litresReceived)).toLocaleString()}L gap detected — this will be flagged
            </p>
          )}
          {litresReceived && parseInt(litresReceived) === trip.litres_loaded && (
            <p className="text-green-400 text-xs mt-2">✅ Full delivery confirmed</p>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={submitting || !litresReceived}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg">
          {submitting ? 'Submitting...' : 'Confirm Receipt'}
        </button>

        <p className="text-center text-gray-500 text-xs mt-4">
          This link can only be used once. By confirming you certify the quantity received is accurate.
        </p>

      </div>
    </main>
  )
}