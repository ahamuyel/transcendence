import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import type { LandingCopy } from "./landing-i18n"

export default function CTASection({ copy }: { copy: LandingCopy["cta"] }) {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative">
        {/* Background card */}
        <div className="relative rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 sm:p-16 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
            {/* Grid background removed to use global Samacaca pattern */}
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-200 bg-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              {copy.badge}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 text-white tracking-tight leading-tight">
              {copy.title.split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="text-indigo-100 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              {copy.description}
            </p>

            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/signin"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 shadow-xl shadow-black/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                {copy.primaryCta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/registar-escola"
                className="px-8 py-4 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 transition-all font-bold hover:scale-[1.03] active:scale-[0.98] backdrop-blur-sm"
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
