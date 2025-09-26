import React, { useRef } from 'react'
import { motion, useInView } from "framer-motion";


const FeaturesPage = () => {



  return (
    <div
      className="w-full min-h-[300vh] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('assets/newspaper_style_cover.png')" }}
    >
      {/* Content goes here */}
      <div className="relative z-10 p-10 w-full h-screen">
        <div className='w-full mt-4 mb-4'>
          <h1 className="text-6xl font-bold text-center text-black font-[Oleo_Script_Swash_Caps]">Unfolding Innovation, One Step at a Time</h1>
        </div>
        <div className='w-full min-h-screen  p-32'>
          {/* step 1 */}
          <article
            className="
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              Scan Receipts & Multimodal Input
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Upload receipts as images or PDFs, record quick audio notes, or scan live.
              OCR kicks in automatically.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Images • PDFs • Audio notes • Live scan</li>
              <li>• Offline-safe queue</li>
            </ul>
          </article>
          {/* line 1 */}

          <svg className='absolute w-[30vw] h-[10vw]' viewBox="0 0 184 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 3.5,
                ease: 'easeInOut',
                delay: 0
              }}
              d="M1 1C18.3333 21.3333 61.4 55.3632 95 28.9632M95 28.9632C128.6 2.56318 112.5 -6.23219 69 19.3297C66.4269 20.8417 63.8216 22.2482 61.5 23.5235C59.8088 24.4525 58.2681 25.3118 57 26.0916C49.0715 30.967 51.7964 32.7326 95 28.9632ZM95 28.9632C111.833 28.4632 152.4 49.4335 180 10.6335" stroke="#D4AF37" stroke-width="2" />
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 3.5,
                ease: 'easeInOut',
                delay: 0
              }}
              d="M179 12L182 8" stroke="#D4AF37" stroke-width="2" />
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 3.5,
                ease: 'easeInOut',
                delay: 0
              }}
              d="M175.699 8.69885L182 7.99998L182.678 14.112" stroke="#D4AF37" stroke-width="2" />
          </svg>








          {/* step 2 */}
          <article
            className="
            absolute
            -top-[5vh] left-[30vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              AI OCR & Data Extraction
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Parse merchant, date, currency, totals, taxes, and line items. Auto-dedupe similar receipts.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Multi-currency • Tax/VAT/GST fields</li>
              <li>• Confidence scoring</li>
            </ul>
          </article>

          {/* line 2 */}
          <svg className="absolute top-[30vh] left-[53vw] w-[30vw] h-[40vh]" viewBox="0 0 74 85" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                delay: 2
              }} d="M1 78C3 78 44 50 52 24M52 24C65.6667 14.8333 86 -2.30002 58 2.49998C45 4.33333 22.3 9.60002 35.5 16L52 24ZM52 24C59.1667 26.6667 69.2 32.8 52 36C41.1667 36.6667 26 40.8 52 52C78 63.2 62.8333 65.6667 52 65.5C49 66 45.2 69.9 54 81.5" stroke="#D4AF37" stroke-width="2" />
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                delay: 2
              }} d="M47.5 79L55 83L54 76" stroke="#D4AF37" stroke-width="2" />
          </svg>








          {/* step 3 */}
          <article
            className="
            absolute
            -top-[10vh] left-[60vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              Automatic Categorization
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Map transactions to categories like Food, Transport, Bills, and more. Learns your preferences.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Custom categories • Rules & overrides</li>
              <li>• Split transactions</li>
            </ul>
          </article>

          {/* line 3 */}
          <svg className='absolute top-[98vh] left-[55vw] w-[20vw]' viewBox="0 0 299 194" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                delay: 2
              }} d="M297.5 1C295.5 36 271.9 96.9 193.5 60.5C163.667 44.8333 100.9 32.1 88.5 106.5C84.1667 130.667 61 178.6 3 177M3 177L30 158.5M3 177L30 192" stroke="#D4AF37" stroke-width="3" />
          </svg>



          {/* step 4 */}
          <article
            className="
            absolute
            -top-[10vh] left-[25vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              Real-Time Budget Tracking
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Track spend vs. budget with envelopes and monthly rollovers. Clear, actionable dashboards.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Daily summaries • Rollovers</li>
              <li>• Merchant insights</li>
            </ul>
          </article>


          {/* line 4 */}
          <svg className='absolute w-[25vw] left-[8vw] top-[90vh]' viewBox="0 0 196 117" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                delay: 4
              }} d="M195.5 60.5C146.091 56.1746 78.9711 48.0963 38 37.906M38 37.906C-3.12126 27.6785 -17.9021 15.3234 38 2.5C69 -1.39597 112.4 0.230885 38 37.906ZM38 37.906V115.5M38 115.5L26.5 105.5M38 115.5L47.5 105.5" stroke="#D4AF37" stroke-width="2" />
          </svg>


          {/* step 5 */}
          <article
            className="
            absolute
            -top-[10vh] -left-[1vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              NIFTY Long-Term Insights
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              View curated fundamentals and screeners for long-term investing in NIFTY companies (info only).
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Valuation & quality filters • Watchlists</li>
              <li>• Education-first</li>
            </ul>
          </article>

          {/* line 5 */}
          <svg className='absolute w-[15vw] left-[12vw] top-[150vh]' viewBox="0 0 107 77" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                delay: 3.5
              }} d="M1.5 1.5C19.3333 36 63.1 97.2 95.5 66L105.5 54.5M105.5 54.5L92 58.5M105.5 54.5V64V66" stroke="#D4AF37" stroke-width="3" />
          </svg>





          {/* step 6 */}
          <article
            className="
            absolute
            -top-[10vh] left-[20vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              Personalized Allocation Plan
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Get a tailored split for invest, save, and emergency fund based on your income and risk profile.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Dynamic % suggestions • Emergency fund target</li>
              <li>• What-if scenarios</li>
            </ul>
          </article>

          {/* line 6 */}
          <svg className='absolute w-[23vw] left-[50vw] top-[155vh]' viewBox="0 0 298 228" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                delay: 4
              }} d="M1 15.8232C18 1.15653 53.6 -14.3768 60 40.8232C54.6667 63.4899 56.8 102.023 108 74.8232C141.667 55.1565 196.8 33.8232 148 105.823C140.667 131.49 142.8 177.623 210 156.823C226 154.49 255.6 156.223 246 181.823C244 189.823 244.4 205.023 262 201.823C267 199.157 277.2 196.823 278 208.823L296 225.823M296 225.823V208.823M296 225.823H278" stroke="#D4AF37" stroke-width="3" />
          </svg>




          {/* step 7 */}
          <article
            className="
            absolute
            top-[2vh] left-[35vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              Alerts & Recommendations
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Catch anomalies, duplicate charges, and bill spikes. Trim waste and optimize subscriptions.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Smart alerts • Bill reminders</li>
              <li>• Subscription optimizer</li>
            </ul>
          </article>

          {/* line 7  */}
          <svg className='absolute w-[15vw] left-[65vw] top-[201vh]' viewBox="0 0 291 173" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                delay: 4.5
              }} d="M289 1.5C225.667 65.1667 79.8 182.1 3 140.5M3 140.5L16 171.5M3 140.5L36 133" stroke="#D4AF37" stroke-width="3" />
          </svg>




          {/* step 8 */}
          <article
            className="
            absolute
            -top-[35vh] left-[65vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-sm
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              Goals & Auto-Sinks
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Create goals (travel, education) and auto-allocate small amounts to reach them on time.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Goal timelines • Progress tracking</li>
              <li>• Auto-allocate</li>
            </ul>
          </article>

          {/* line 8  */}
          <svg className='absolute w-[10vw] h-[19vw] left-[49vw] top-[218vh]' viewBox="0 0 33 226" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                delay: 3.5
              }} d="M18 0.5V223.5M18 223.5L1 211.5M18 223.5L32 211.5" stroke="#D4AF37" stroke-width="3" />
          </svg>



          {/* step 9 */}
          <article
            className="
            absolute
            top-[15vh] left-[35vw]
        rounded-2xl border border-white/10
        bg-gradient-to-br from-neutral-900/95 to-black/95
        shadow-2xl shadow-black/40 backdrop-blur-[2px]
        relative overflow-hidden
        p-6 md:p-8
        text-white max-w-smkk
      "
          >
            {/* Accent line on top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/25 to-white/10" />

            <h2 className="text-2xl font-bold mb-3">
              Reports & Export
            </h2>
            <p className="text-gray-300 mb-4 font-semibold">
              Generate tax-ready summaries and export to CSV/PDF/XLSX or hand off to your accountant.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li>• Period filters • One-click export</li>
              <li>• Audit trail</li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  )
}

export default FeaturesPage
