# Linkgrove

**Linkgrove** is a modern, customizable link-in-bio platform that enables creators, entrepreneurs, and businesses to share all their important links from a single, beautifully designed page.

Inspired by the concept of a grove — a connected group of trees — Linkgrove represents a digital ecosystem where multiple links live and grow together in one organized space.

---

## Live Demo

> Deploy URL goes here

---

## Features

- Personalized bio page with custom themes, fonts, and layouts
- Add and manage unlimited links
- Real-time live preview of your public page
- QR Code Generator with customization and DB persistence
- Link Shortener with click tracking and redirect routing
- Polls & Feedback — create polls, share them publicly, collect votes
- Anonymous messaging page per user
- Pro plan with Interswitch inline checkout and recurring monthly payments
- Payment history and billing management
- Account management — update profile, delete account, data sharing toggle
- Protected dashboard routes with JWT session cookies
- Public profile page at `/:username`
- Public poll voting page at `/poll/:pollId`

---

## Tech Stack

- **Framework:** TanStack Start (React, SSR)
- **Routing:** TanStack Router (file-based)
- **Database:** MongoDB via Mongoose
- **Auth:** JWT sessions with `jose`, `bcryptjs`
- **Payments:** Interswitch Inline Checkout
- **Image Uploads:** Cloudinary
- **Styling:** Tailwind CSS v4
- **State / Data:** TanStack Query
- **QR Codes:** qrcode.react
- **Deployment:** Railway

---

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

### Build for Production

```bash
npm run build
```

---

## Team Contributions

### Kiisi — Lead Engineer

Kiisi was responsible for the full technical implementation of the platform from the ground up.

**Authentication & Security**
- Bootstrapped the codebase with TanStack Start
- Implemented registration, login, and logout flows using `createServerFn`
- Built JWT-based session management with `jose` and `bcryptjs`
- Implemented protected dashboard routes with `beforeLoad` auth guards
- Fixed TanStack Start import-protection issues with server-only modules

**Dashboard & Core Features**
- Built the full dashboard layout with sidebar navigation, mobile bottom nav, and plan-aware UI
- Implemented the links page — add, edit, toggle, delete links with real-time DB sync
- Built the live preview component (`LivePreview`) that reflects design changes instantly
- Implemented the design studio — themes, background colors, button styles, typography, profile image upload via Cloudinary
- Built the QR Code Generator with `qrcode.react`, customization options, and DB persistence
- Built the Link Shortener with custom aliases, click tracking, and redirect routing at `/s/:code`
- Built the Polls & Feedback system — create polls, toggle status, delete, copy share links

**Public Pages**
- Built the public profile page at `/:username` — renders the user's full design, links, and branding
- Built the public poll voting page at `/poll/:pollId` — live voting, results with progress bars, multi-select support

**Payments & Billing**
- Integrated Interswitch inline checkout for Pro plan subscription
- Implemented recurring monthly payment flow with `PaymentHistory` model
- Built the billing section in account page — upgrade, cancel plan, payment history table

**Account Management**
- Built the account page — update username, first/last name, email (read-only)
- Implemented delete account with type-to-confirm modal
- Implemented data sharing toggle synced to DB

**Onboarding**
- Built the full onboarding flow — register → username selection (with availability check) → category → plan selection
- Integrated Interswitch payment on the select-plan onboarding page

**Infrastructure**
- Set up MongoDB connection with Mongoose models: `User`, `Link`, `ShortLink`, `Poll`, `QrCode`, `Design`, `PaymentHistory`
- Configured deployment to Railway with Nitro

---

### Emmanuel — Product, Design & Research

Emmanuel contributed to the product direction, design decisions, and non-technical aspects of the project.

**Product Strategy**
- Defined the product vision and core value proposition for Linkgrove
- Identified the target audience — creators, entrepreneurs, and businesses
- Shaped the feature roadmap and prioritized what to build for the hackathon submission

**UI/UX Design**
- Designed the overall visual identity and brand direction for Linkgrove
- Defined the color system, typography choices, and component design language
- Provided design direction for the landing page, auth pages, dashboard, and onboarding flow
- Reviewed and gave feedback on UI implementations throughout development

**Research**
- Researched competitor platforms (Linktree, Bento) to identify differentiation opportunities
- Researched Interswitch payment integration requirements and provided the merchant credentials and API details
- Researched Cloudinary setup and provided the upload preset configuration

**Content & Documentation**
- Wrote the project description, tagline, and feature copy
- Contributed to README documentation and submission materials
- Coordinated the overall project narrative for judges

---

## Project Structure

```
src/
├── components/dashboard/   # Shared dashboard components (Sidebar, LinkCard, LivePreview)
├── lib/                    # DB connection, session utilities
├── models/                 # Mongoose models
├── routes/
│   ├── auth/               # Login, register, username, OTP
│   ├── dashboard/          # All dashboard pages
│   ├── onboarding/         # Category, plan selection, pro trial
│   ├── poll/               # Public poll voting page
│   ├── s/                  # Short link redirect
│   ├── $username.tsx       # Public profile page
│   └── index.tsx           # Landing page
└── styles.css
```

---

## License

MIT
