// 檔案路徑：app/terms/page.tsx
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-yellow-500 hover:text-yellow-400 mb-8 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">Terms of Use</h1>
        <p className="text-gray-400 mb-8">Last Updated: November 8, 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using the Leo Game platform ("Platform"), you agree to be bound by these Terms. If you are under 13 years old, you must have parental consent to use this Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate information (via Email or Google login) and accept all risks of unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Virtual Currency (Leo Coins & L pieces)</h2>
            <p>Leo Game uses virtual currency and items. These items have no real-world monetary value and cannot be exchanged for cash. All purchases and transactions in the Store are final. We reserve the right to modify or discontinue the Store at any time. During the Alpha phase, Leo Coins are distributed freely via L pieces and are not sold for real money.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">4. User Generated Content (UGC)</h2>
            <p>You may create and upload games, plugins, and forum posts. You agree NOT to upload any content that is illegal, hateful, sexually explicit, or infringes on copyright. We reserve the right to remove any content and ban users who violate these rules.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">5. Trading System</h2>
            <p>Leo Game provides a trading tool, which is not a guarantee or escrow service. We do not guarantee the recovery of lost assets. Users trade at their own risk. We reserve the right to freeze accounts, remove violating items, and restrict trading features if fraudulent activity is detected. Off-platform trades are not protected.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">6. Limitation of Liability</h2>
            <p>The Platform is provided "as is" without warranties. We are not responsible for any loss of data, virtual items, or disputes between players. Use the Platform at your own risk.</p>
          </section>
        </div>
      </div>
    </div>
  )
}