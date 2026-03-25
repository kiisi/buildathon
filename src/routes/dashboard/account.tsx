import { createFileRoute } from '@tanstack/react-router'
import { MoreHorizontal, User, Shield, Zap } from 'lucide-react'

export const Route = createFileRoute('/dashboard/account')({
  component: AccountPage,
})

function AccountPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-white/50">
      <div className="mx-auto w-full max-w-[800px] px-4 pb-20 pt-6 sm:px-10 lg:px-12">
        <div className="mb-10">
          <h1 className="text-[24px] font-extrabold tracking-tight text-gray-900">Account</h1>
        </div>

        <div className="flex flex-col gap-10">
          {/* My information */}
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">My information</h2>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3">
                {/* Name Input */}
                <div className="flex flex-col rounded-lg bg-[#F5F6F8] px-4 py-2 transition-colors hover:bg-[#EAECEF] focus-within:bg-[#EAECEF] focus-within:ring-2 focus-within:ring-black/5">
                  <label htmlFor="name" className="text-[12px] font-medium text-gray-500">Name</label>
                  <input 
                    id="name"
                    type="text" 
                    placeholder="Enter your name"
                    className="bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
                {/* Email Input */}
                <div className="flex flex-col rounded-lg bg-[#F5F6F8] px-4 py-2 transition-colors hover:bg-[#EAECEF] focus-within:bg-[#EAECEF] focus-within:ring-2 focus-within:ring-black/5">
                  <label htmlFor="email" className="text-[12px] font-medium text-gray-500">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    defaultValue="kiisi.dev@gmail.com"
                    className="bg-transparent text-[15px] font-medium text-gray-900 outline-none"
                  />
                </div>
              </div>
              <button disabled className="w-full rounded-full bg-[#EAECEF] py-3 text-[15px] font-bold text-[#A5ABB6] transition-colors">
                Save details
              </button>
            </div>
          </section>

          {/* Linkgroves you own */}
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">Linkgroves you own</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                    <User size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">@devkiisi</span>
                </div>
                <button className="cursor-pointer border-none bg-transparent text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <div className="border-b border-gray-100 p-5">
                <p className="mb-1 text-[13px] text-gray-700">Plan</p>
                <p className="text-sm font-medium text-gray-900">Free</p>
              </div>
              
              <div className="border-b border-gray-100 p-5">
                <div className="mb-2 flex items-center gap-1">
                  <p className="text-[13px] text-gray-700">Admins</p>
                  <span className="cursor-help text-xs text-gray-400" title="Info">ⓘ</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                  <span className="text-sm font-medium text-gray-900">kiisi.dev@gmail.com</span>
                  <span className="text-[11px] font-semibold text-gray-900">Owner (you)</span>
                </div>
              </div>
              
              <div className="p-5 text-center">
                <p className="mb-4 text-sm font-bold text-gray-900">
                  Upgrade to Pro to invite multiple admins to manage this Linkgrove
                </p>
                <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-[#7c3aed] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
                  <Zap size={16} />
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-base font-bold text-gray-900">Privacy Settings</h2>
              <p className="mb-6 text-sm text-gray-600">
                Stop sharing your data with third parties. This may affect your access to certain monetization opportunities. Learn more in our <a href="#" className="font-medium text-gray-900 underline">privacy notice</a>.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#7c3aed]">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="mb-0.5 text-sm font-bold text-gray-900">Allow data sharing</h3>
                    <p className="text-xs font-semibold text-[#16a34a]">Enabled</p>
                  </div>
                </div>
                <button className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
                  Disable
                </button>
              </div>
            </div>
          </section>

          {/* Password */}
          <section>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-base font-bold text-gray-900">Password</h2>
              <p className="mb-4 text-sm text-gray-600">
                Set a password for your account to log in with your email and password in the future.
              </p>
              <a href="#" className="text-sm font-semibold text-gray-900 underline">
                Create Password
              </a>
            </div>
          </section>

          {/* Account management */}
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">Account management</h2>
            
            <div className="relative mb-6 rounded-xl bg-[#E8D1F6] p-6 shadow-sm">
              <button className="absolute right-4 top-4 cursor-pointer border-none bg-transparent text-gray-600 transition-colors hover:text-gray-900">
                <span className="text-lg font-bold">✕</span>
              </button>
              <div className="mb-3">
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-900">BRAND NEW</span>
              </div>
              <h3 className="mb-1 text-[17px] font-extrabold text-[#3a205a]">Collaboration doesn't have to be complicated</h3>
              <p className="text-sm text-[#4c2d76]">
                Manage Linkgroves, teammates, and permissions together in a shared Workspace — now in Beta.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-gray-900">Manage account deletion</h3>
              <p className="mb-6 text-sm text-gray-600">
                Permanently delete your entire account and all profiles you own.
              </p>
              <button className="cursor-pointer rounded-full border-none bg-[#E51B24] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
                Delete Account
              </button>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  )
}
