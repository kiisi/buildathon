import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/onboarding/select-category')({
  component: SelectCategoryPage,
})

const categories = [
  {
    id: 'creator',
    title: 'Creator',
    description: 'Build my following and explore ways to monetize my audience.',
    image: '/cat-creator.png',
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Grow my business and reach more customers.',
    image: '/cat-business.png',
  },
  {
    id: 'personal',
    title: 'Personal',
    description: 'Share links with my friends and acquaintances.',
    image: '/cat-personal.png',
  },
]

function SelectCategoryPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const navigate = useNavigate()

  function handleContinue() {
    if (!selected) return
    navigate({ to: '/onboarding/pro-trial' })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center bg-white px-5 py-10">
      {/* Progress bar */}
      <div className="mb-12 flex w-full max-w-[200px] items-center gap-1">
        <div className="h-1 flex-1 rounded-full bg-[#1069f9]" />
        <div className="h-1 flex-1 rounded-full bg-gray-200" />
      </div>

      {/* Heading */}
      <h1 className="mb-3 text-center text-[1.75rem] font-extrabold leading-tight tracking-tight text-gray-900 sm:text-[2rem]">
        Which best describes your
        <br />
        goal for using Linkgrove?
      </h1>
      <p className="mb-10 text-center text-[0.9rem] text-gray-400">
        This helps us personalize your experience.
      </p>

      {/* Category cards */}
      <div className="flex w-full max-w-[640px] flex-col gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            id={`category-${cat.id}`}
            onClick={() => setSelected(cat.id)}
            className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border-[1.5px] px-6 py-5 text-left transition-all ${
              selected === cat.id
                ? 'border-[#1069f9] bg-blue-50/40 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex-1 pr-4">
              <h3 className="mb-1 text-base font-bold text-gray-900">{cat.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{cat.description}</p>
            </div>
            <img
              src={cat.image}
              alt={cat.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        type="button"
        id="category-continue-btn"
        onClick={handleContinue}
        disabled={!selected}
        className={`mt-8 h-[52px] w-full max-w-[640px] rounded-full font-sans text-base font-bold tracking-tight transition-all ${
          selected
            ? 'cursor-pointer bg-[#8b5cf6] text-white hover:bg-[#7c3aed] active:scale-[0.985]'
            : 'cursor-not-allowed bg-gray-200 text-gray-400'
        }`}
      >
        Continue
      </button>

      {/* Cookie footer */}
      <p className="mt-auto pt-8 self-start text-xs text-gray-400 cursor-pointer hover:underline">
        Cookie Preferences
      </p>
    </div>
  )
}
