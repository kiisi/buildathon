import { createFileRoute, Link } from '@tanstack/react-router'
import {
  TreePine, Link2, BarChart3, Palette, Globe,
  ArrowRight, Check, Star, Zap, Shield,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: LandingPage })

const features = [
  { icon: <Link2 size={20} />, title: 'All your links, one place', desc: 'Add unlimited links — social profiles, websites, products, content, and more. No cap.' },
  { icon: <Palette size={20} />, title: 'Beautiful customization', desc: 'Pick from curated themes or craft your own with custom colors, fonts, and layouts.' },
  { icon: <BarChart3 size={20} />, title: 'Real-time analytics', desc: 'See who clicks what. Track views, clicks, and audience location as it happens.' },
  { icon: <Globe size={20} />, title: 'Your corner of the web', desc: 'Get a clean linkgrove.ee/yourname URL you can share everywhere — instantly.' },
  { icon: <Zap size={20} />, title: 'Lightning fast', desc: 'Built for performance. Your page loads in under a second on any device, anywhere.' },
  { icon: <Shield size={20} />, title: 'Secure by default', desc: 'HTTPS everywhere, privacy-first analytics, and no data sold to third parties.' },
]

const steps = [
  { num: '01', title: 'Sign up free', desc: 'Create your account in seconds. No credit card needed.' },
  { num: '02', title: 'Add your links', desc: 'Drop in your URLs, label them, and arrange in any order.' },
  { num: '03', title: 'Customize your page', desc: 'Pick a theme, add your photo, and make it yours.' },
  { num: '04', title: 'Share everywhere', desc: 'Drop your Linkgrove URL in every bio and watch it work.' },
]

const plans = [
  {
    name: 'Free', price: '₦0', period: 'forever',
    desc: 'Everything you need to get started.',
    cta: 'Get started free', href: '/auth/register', highlight: false,
    perks: ['Unlimited links', 'Basic analytics', 'Multiple design styles', 'linkgrove.ee/yourname', 'Link shortener & QR code', 'Polls & Feedback'],
  },
  {
    name: 'Pro', price: '₦2,000', period: 'per month',
    desc: 'For creators who want to grow faster.',
    cta: 'Try free for 7 days', href: '/auth/register', highlight: true,
    perks: ['Everything in Free', 'Remove Linkgrove logo', 'Customized layouts', 'Comprehensive analytics', 'Social media scheduling', 'Automated Instagram DMs', 'Email integrations', 'Lower seller fees'],
  },
]

const testimonials = [
  { name: 'Amara O.', handle: '@amaracreates', initials: 'AO', color: 'bg-violet-500', stars: 5, text: 'Switched from Linktree and never looked back. The analytics alone are worth it.' },
  { name: 'James K.', handle: '@jkbusiness', initials: 'JK', color: 'bg-emerald-500', stars: 5, text: 'My clients find everything in one tap. Clean, fast, and looks incredible on mobile.' },
  { name: 'Sofia R.', handle: '@sofiadesigns', initials: 'SR', color: 'bg-pink-500', stars: 5, text: "The customization is insane. My page actually looks like me now, not a generic template." },
]

const stats = [
  { value: '2M+', label: 'Active pages' },
  { value: '98%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'Average rating' },
  { value: '180+', label: 'Countries' },
]

const brands = ['Instagram', 'YouTube', 'TikTok', 'Twitter / X', 'Spotify', 'Shopify', 'Substack', 'LinkedIn']

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white font-sans text-gray-900 antialiased">
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CtaBanner />
      <Footer />
    </div>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <TreePine size={26} strokeWidth={2.5} className="text-[#1069f9]" />
          <span className="text-[1.2rem] font-extrabold tracking-tight">Linkgrove</span>
        </div>
        <nav className="hidden items-center gap-7 text-[0.875rem] font-medium text-gray-500 md:flex">
          <a href="#features" className="transition-colors hover:text-gray-900">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-gray-900">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-gray-900">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className="hidden text-[0.875rem] font-semibold text-gray-600 transition-colors hover:text-gray-900 md:block">
            Log in
          </Link>
          <Link
            to="/auth/register"
            className="flex h-9 items-center rounded-full bg-[#1069f9] px-5 text-[0.875rem] font-bold text-white transition-all hover:bg-[#0558e0] active:scale-[0.97]"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-5 pb-24 pt-20 text-center">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#1069f9]/6 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1069f9]/20 bg-[#1069f9]/5 px-4 py-1.5 text-[0.8rem] font-semibold text-[#1069f9]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1069f9]" />
          The link-in-bio built for growth
        </div>
        <h1 className="mb-5 text-[3rem] font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-[3.75rem]">
          One link.<br />
          <span className="text-[#1069f9]">Your entire world.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-[1.05rem] leading-relaxed text-gray-500">
          Linkgrove gives creators, entrepreneurs, and businesses a single beautiful page to share everything — links, content, and brand — all in one grove.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth/register"
            className="flex h-[52px] items-center gap-2 rounded-full bg-[#1069f9] px-8 text-[1rem] font-bold text-white shadow-lg shadow-[#1069f9]/25 transition-all hover:bg-[#0558e0] active:scale-[0.97]"
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="flex h-[52px] items-center rounded-full border border-gray-200 px-8 text-[1rem] font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            See how it works
          </a>
        </div>
        <p className="mt-5 text-[0.8rem] text-gray-400">Free forever · No credit card required</p>
      </div>

      {/* Phone mockup */}
      <div className="relative mx-auto mt-16 max-w-[260px]">
        <div className="relative rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-900 shadow-2xl shadow-gray-900/20">
          <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-gray-900" />
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#eef4ff] to-white px-5 pb-8 pt-10">
            <div className="mb-5 flex flex-col items-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1069f9] text-xl font-extrabold text-white shadow-lg shadow-[#1069f9]/30">JD</div>
              <p className="text-[0.85rem] font-extrabold text-gray-900">@janedoe</p>
              <p className="mt-0.5 text-[0.7rem] text-gray-400">Creator · Designer · Builder</p>
            </div>
            {['My Portfolio', 'Latest YouTube', 'Shop Merch', 'Newsletter'].map((label, i) => (
              <div key={i} className="mb-2.5 flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[0.75rem] font-semibold text-gray-800 shadow-sm">
                {label}
              </div>
            ))}
            <div className="mt-4 flex justify-center gap-3">
              {['tw', 'ig', 'yt', 'tk'].map((s) => (
                <div key={s} className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[0.6rem] font-bold text-gray-500">{s}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-6 left-1/2 h-12 w-48 -translate-x-1/2 rounded-full bg-[#1069f9]/15 blur-2xl" />
      </div>
    </section>
  )
}

function LogoStrip() {
  return (
    <section className="border-y border-gray-100 bg-gray-50/60 py-5">
      <p className="mb-4 text-center text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400">
        Connects with everything you use
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5">
        {brands.map((b) => (
          <span key={b} className="text-[0.8rem] font-semibold text-gray-400">{b}</span>
        ))}
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-widest text-[#1069f9]">Features</p>
          <h2 className="text-[2.25rem] font-extrabold tracking-tight text-gray-900">Everything you need, nothing you don't</h2>
          <p className="mx-auto mt-4 max-w-lg text-[0.95rem] text-gray-500">
            Linkgrove is designed to be powerful without being complicated. Get up and running in minutes.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1069f9]/20 hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1069f9]/8 text-[#1069f9] transition-colors group-hover:bg-[#1069f9] group-hover:text-white">
                {f.icon}
              </div>
              <h3 className="mb-2 text-[0.95rem] font-bold text-gray-900">{f.title}</h3>
              <p className="text-[0.875rem] leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-widest text-[#1069f9]">How it works</p>
          <h2 className="text-[2.25rem] font-extrabold tracking-tight text-gray-900">Live in four simple steps</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="relative rounded-2xl bg-white p-6 shadow-sm">
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-px w-6 translate-x-full bg-gray-200 lg:block" />
              )}
              <span className="mb-4 block text-[2rem] font-extrabold leading-none text-[#1069f9]/15">{s.num}</span>
              <h3 className="mb-2 text-[0.95rem] font-bold text-gray-900">{s.title}</h3>
              <p className="text-[0.875rem] leading-relaxed text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-widest text-[#1069f9]">Testimonials</p>
          <h2 className="text-[2.25rem] font-extrabold tracking-tight text-gray-900">Loved by creators worldwide</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-5 flex-1 text-[0.9rem] leading-relaxed text-gray-700">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-[0.7rem] font-bold text-white ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-[0.875rem] font-bold text-gray-900">{t.name}</p>
                  <p className="text-[0.75rem] text-gray-400">{t.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-gray-100 bg-gray-50/60 px-8 py-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[1.5rem] font-extrabold text-gray-900">{s.value}</p>
              <p className="text-[0.8rem] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-widest text-[#1069f9]">Pricing</p>
          <h2 className="text-[2.25rem] font-extrabold tracking-tight text-gray-900">Simple, honest pricing</h2>
          <p className="mx-auto mt-4 max-w-md text-[0.95rem] text-gray-500">
            Start free. Upgrade when you're ready. No hidden fees, ever.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 max-w-3xl mx-auto w-full">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-7 ${
                plan.highlight
                  ? 'border-2 border-[#1069f9] bg-white shadow-xl shadow-[#1069f9]/10'
                  : 'border border-gray-200 bg-white shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1069f9] px-4 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-white">
                  Most popular
                </div>
              )}
              <p className="mb-1 text-[0.875rem] font-bold text-gray-500">{plan.name}</p>
              <div className="mb-1 flex items-end gap-1">
                <span className="text-[2.5rem] font-extrabold leading-none tracking-tight text-gray-900">{plan.price}</span>
                <span className="mb-1 text-[0.8rem] text-gray-400">/{plan.period}</span>
              </div>
              <p className="mb-6 text-[0.85rem] text-gray-500">{plan.desc}</p>
              <ul className="mb-8 flex flex-col gap-2.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2.5 text-[0.875rem] text-gray-700">
                    <Check size={15} className="shrink-0 text-[#1069f9]" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href as any}
                className={`mt-auto flex h-11 items-center justify-center rounded-full text-[0.9rem] font-bold transition-all active:scale-[0.97] ${
                  plan.highlight
                    ? 'bg-[#1069f9] text-white shadow-md shadow-[#1069f9]/25 hover:bg-[#0558e0]'
                    : 'border border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section className="px-5 py-24">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-[#1069f9] px-8 py-16 text-center shadow-2xl shadow-[#1069f9]/20">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative">
          <div className="mb-4 flex justify-center">
            <TreePine size={36} strokeWidth={2} className="text-white/80" />
          </div>
          <h2 className="mb-4 text-[2rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2.5rem]">
            Your grove is waiting.
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[0.95rem] leading-relaxed text-white/75">
            Join millions of creators and businesses who use Linkgrove to share their world in one link.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex h-[52px] items-center gap-2 rounded-full bg-white px-8 text-[1rem] font-bold text-[#1069f9] shadow-lg transition-all hover:bg-gray-50 active:scale-[0.97]"
          >
            Get started free <ArrowRight size={16} />
          </Link>
          <p className="mt-4 text-[0.8rem] text-white/50">No credit card required</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <TreePine size={22} strokeWidth={2.5} className="text-[#1069f9]" />
              <span className="font-extrabold tracking-tight">Linkgrove</span>
            </div>
            <p className="text-[0.8rem] leading-relaxed text-gray-400">
              A digital grove where your links live and grow together.
            </p>
          </div>
          {[
            { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
          ].map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-wider text-gray-400">{col.heading}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-[0.875rem] text-gray-500 transition-colors hover:text-gray-900">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-[0.8rem] text-gray-400">© {new Date().getFullYear()} Linkgrove. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[0.8rem] text-gray-400">
            <span>Made with</span>
            <span className="text-[#1069f9]">♥</span>
            <span>for creators everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
