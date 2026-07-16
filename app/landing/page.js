export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛽</span>
          <span className="font-bold text-xl">FuelLedger</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-gray-400 hover:text-white text-sm">How it works</a>
          <a href="#pricing" className="text-gray-400 hover:text-white text-sm">Pricing</a>
          <a href="/setup" className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg text-sm">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 py-24 text-center">
        <div className="inline-block bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-full mb-6">
          🚨 Diesel up 23.5% this year · Officials arrested for falsifying fuel data
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Every litre.<br />
          <span className="text-green-400">Tracked.</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
          FuelLedger is Kenya's fuel supply chain transparency platform. From the depot to the pump — every litre verified, every discrepancy flagged, every thief caught.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/setup" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl text-lg">
            Start Free Trial →
          </a>
          <a href="#how" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl text-lg">
            See How It Works
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 border-y border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-green-400">KSh 242</p>
            <p className="text-gray-400 text-sm mt-1">Per litre diesel, May 2026</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-red-400">23.5%</p>
            <p className="text-gray-400 text-sm mt-1">Diesel price surge this year</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-yellow-400">0</p>
            <p className="text-gray-400 text-sm mt-1">Fuel transparency tools in Kenya</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">100%</p>
            <p className="text-gray-400 text-sm mt-1">Of theft caught by cross-verification</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">How FuelLedger works</h2>
        <p className="text-gray-400 text-center mb-16">Four steps. Two independent parties. Zero chance of manipulation.</p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: '🚛', title: 'Manager logs trip', desc: 'Dispatch manager logs litres loaded, assigns driver, enters destination depot. QR code generated instantly.' },
            { step: '02', icon: '📱', title: 'Driver accepts & departs', desc: 'Driver gets notified on their portal, accepts the trip and it becomes active with live time tracking.' },
            { step: '03', icon: '📍', title: 'Driver marks arrived', desc: 'On arrival, driver clicks "Arrived" from their personal portal. Depot gets a secure email link automatically.' },
            { step: '04', icon: '⚠️', title: 'Depot confirms, system flags', desc: 'Receiving depot independently enters litres received. Any gap over 1% is instantly flagged for investigation.' },
          ].map(item => (
            <div key={item.step} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-gray-700 font-bold text-lg">{item.step}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 border-y border-gray-800 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Everything your fleet needs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🏢', title: 'Company Branding', desc: 'Your logo, your colors, your URL. Every client gets their own branded portal at yourcompany.fuelledger.co.ke' },
              { icon: '👤', title: 'Driver Portals', desc: 'Each driver gets their own personal portal with trip history, active trip tracking, and elapsed time vs expected.' },
              { icon: '⏱', title: 'Time Standards', desc: 'Set expected trip duration per route. Instantly see which drivers are on time, running late, or very late.' },
              { icon: '📧', title: 'Depot Notifications', desc: 'Receiving depots get a secure one-time email link to confirm litres received. No account needed.' },
              { icon: '📊', title: 'Live Dashboard', desc: 'Real-time stats on litres dispatched, delivered, and flagged. Filter by driver, depot, or date range.' },
              { icon: '🔒', title: 'Role-Based Access', desc: 'Managers log trips and view data. Drivers only see their own trips. Depots only confirm receipts.' },
            ].map(item => (
              <div key={item.title} className="bg-gray-950 rounded-2xl border border-gray-800 p-6">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-gray-400 text-center mb-16">Start free. Scale as you grow.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Basic',
              price: 'KSh 3,000',
              period: '/month',
              desc: 'Perfect for small fleets',
              features: ['Up to 2 managers', 'Up to 10 drivers', '100 trips/month', 'Email support'],
              cta: 'Get Started',
              highlight: false,
            },
            {
              name: 'Pro',
              price: 'KSh 8,000',
              period: '/month',
              desc: 'For growing companies',
              features: ['Up to 5 managers', 'Unlimited drivers', 'Unlimited trips', 'Priority support', 'Custom branding'],
              cta: 'Start Free Trial',
              highlight: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              desc: 'For large fleets & EPRA',
              features: ['Unlimited managers', 'Unlimited drivers', 'API access', 'EPRA compliance reports', 'Dedicated support'],
              cta: 'Contact Us',
              highlight: false,
            },
          ].map(plan => (
            <div key={plan.name} className={`rounded-2xl border p-6 ${plan.highlight ? 'border-green-500 bg-green-500/5' : 'border-gray-800 bg-gray-900'}`}>
              {plan.highlight && (
                <span className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">Most Popular</span>
              )}
              <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="text-gray-400 text-sm flex gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/setup" className={`w-full block text-center font-semibold py-3 rounded-xl text-sm ${plan.highlight ? 'bg-green-500 hover:bg-green-600 text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-500/10 border-y border-green-500/20 py-24">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Stop losing fuel to corruption.</h2>
          <p className="text-gray-400 text-lg mb-8">Join Kenya's first fuel transparency platform. Setup takes 5 minutes.</p>
          <a href="/setup" className="bg-green-500 hover:bg-green-600 text-black font-bold px-10 py-4 rounded-xl text-lg inline-block">
            Start Free Trial →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-12 flex justify-between items-center text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <span>⛽</span>
          <span>FuelLedger by Wema Energy</span>
        </div>
        <p>Nairobi, Kenya · {new Date().getFullYear()}</p>
      </footer>

    </main>
  )
}