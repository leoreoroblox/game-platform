// 檔案路徑：app/privacy/page.tsx
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-yellow-500 hover:text-yellow-400 mb-8 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last Updated: November 8, 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Information We Collect</h2>
            <p>We collect your Email address and basic profile information (username, avatar) when you register via Email or Google. We also collect game data (inventory, coins, follow lists, trade history) to provide our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. How We Use Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and maintain the Platform.</li>
              <li>Secure your account and prevent cheating/fraud.</li>
              <li>Allow you to interact with other players (Forums, Trades, Follows).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Data Sharing & Security</h2>
            <p>We do not sell your personal data. We only share data with third-party providers (like Supabase for database hosting) as necessary to run the Platform. We use technical measures (such as device fingerprinting and IP logging) specifically for anti-cheat enforcement and preventing ban evasion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Children's Privacy (COPPA)</h2>
            <p>If we discover that a user under 13 has provided personal information without parental consent, we will delete their account. Parents may contact us to request data deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">5. Contact Us</h2>
            <p>For privacy concerns or to report fraud, contact the Owner at: <span className="text-yellow-500">support@leogame.com</span></p>
          </section>
        </div>
      </div>
    </div>
  )
}