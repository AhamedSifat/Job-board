**Job Board Application**

A modern, full‑featured job board built with Next.js 15, TailwindCSS, and Shadcn UI, providing organizations and job seekers with an intuitive platform for posting, browsing, and applying to jobs.

---

## 📑 **Table of Contents**

* ✨ **Features**

* 🛠️ **Tech Stack**

* 🚀 **Getting Started**

  * 📋 **Prerequisites**
  * 📥 **Installation**
  * 🔑 **Environment Variables**
  * 💻 **Running Locally**

* 🎯 **Usage**

* 🔄 **Workflow & Background Jobs**

* 🔐 **Security**

* 💳 **Payment Integration**

* 📦 **Deployment**

* 🤝 **Contributing**

* 📄 **License**

* [Features](#features)

* [Tech Stack](#tech-stack)

* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Environment Variables](#environment-variables)
  * [Running Locally](#running-locally)

* [Usage](#usage)

* [Workflow & Background Jobs](#workflow--background-jobs)

* [Security](#security)

* [Payment Integration](#payment-integration)

* [Deployment](#deployment)

* [Contributing](#contributing)

* [License](#license)

---

## ✨ **Features**

### 🌐 Core Framework

* **Next.js 15**: Server‑side rendering, file‑based routing, and incremental static regeneration.
* **TailwindCSS & Shadcn UI**: Utility‑first styling and component primitives for rapid UI development.

### 🔒 Authentication

* **Auth.js**: Google & GitHub OAuth flows for secure user sign‑in.
* **Roles & Onboarding**:

  * **Organization**: Fill in company info and upload a logo.
  * **Job Seeker**: Provide personal details and upload a PDF CV.

### 📬 Background Workflow

* **Inngest**: Triggers scheduled tasks every 48 hours for 30 days after account creation.
* **Resend**: Sends summary emails of new job postings via Resend API to subscribers.

### 🛡️ Security

* **Arcjet Security**: Built‑in protections against XSS, SQL injection, CSRF, and other common attacks.
* **Rate Limiting**: Custom limits for authenticated users; bot protection on public routes.

### 📝 Job Management

* **Create & Post Jobs**:

  * Custom salary range slider.
  * Rich text editor powered by **Tiptap**.
  * Smooth image uploads for company logos or banners.
  * Selectable listing durations (30, 60, 90 days).
* **CRUD**: View, edit, and delete job posts through a user‑friendly dashboard.
* **Favorites**: Bookmark jobs to a favorites route for quick access.
* **Apply**: Detailed job page with an "Apply" button.
* **Expiration**: Automatic expiration of jobs after their selected duration.

### 💳 Payments

* **Stripe Integration**:

  * Payment processing for posting jobs.
  * Webhooks to activate listings on successful payment and mark expiration.

### 📄 Listing & Search

* **Index Page**: Filter, paginate, and lazy‑load job posts with React Suspense.
* **Search & Filters**: Filter by keywords, location, salary range, and date posted.

### 🚀 Deployment & Performance

* **Vercel**: Seamless deployment and built‑in CDN caching.
* **Performance Optimizations**: Image optimization, code splitting, and server‑cached responses.
* **Responsive Design**: Works flawlessly on desktop, tablet, and mobile.

---

## 🛠️ **Tech Stack**

* **Framework**: Next.js 15
* **Styling**: TailwindCSS, Shadcn UI
* **Authentication**: Auth.js (Google, GitHub)
* **Image Uploads**: Uploadthing
* **Background Jobs**: Inngest
* **Email Service**: Resend
* **Rich Text Editor**: Tiptap
* **Payments**: Stripe
* **Security**: Arcjet Security
* **Deployment**: Vercel

---

## 🚀 **Getting Started**

### Prerequisites

* Node.js ≥ 18
* pnpm or npm
* A Stripe account (for payment processing)
* Google & GitHub OAuth credentials

### Installation

1. **Clone the repo**:

   ```bash
   git clone https://github.com/your-username/job-board.git
   cd job-board
   ```
2. **Install dependencies**:

   ```bash
   pnpm install
   # or npm install
   ```

### Environment Variables

Create a `.env.production` (or `.env.local` for local testing) file in the root directory with the following variables (replace `YOUR_*` placeholders with your actual credentials and secrets):

```bash
# NextAuth secret for signing cookies
AUTH_SECRET="YOUR_AUTH_SECRET"

# GitHub OAuth credentials
AUTH_GITHUB_ID=YOUR_GITHUB_CLIENT_ID
AUTH_GITHUB_SECRET=YOUR_GITHUB_CLIENT_SECRET

# Google OAuth credentials
AUTH_GOOGLE_ID=YOUR_GOOGLE_CLIENT_ID
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# PostgreSQL database connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
NODE_ENV=production

# Uploadthing API token for image uploads
UPLOADTHING_TOKEN=YOUR_UPLOADTHING_TOKEN

# Arcjet API key for security
ARCJET_KEY=YOUR_ARCJET_KEY

# Stripe credentials
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# Resend API key for transactional emails
RESEND_API_KEY=YOUR_RESEND_API_KEY

# Public URL of your deployed app
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### Running Locally

```bash
pnpm dev
# or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 **Usage**

* Sign up or log in via Google/GitHub.
* Complete onboarding as an Organization or Job Seeker.
* Organizations can create, edit, and manage job posts; configure salary range, duration, and media.
* Job Seekers can browse, filter, favorite, and apply to jobs.
* View favorite listings under **/favorites**.

---

## 🔄 **Workflow & Background Jobs**

* Inngest runs a scheduled task every 48 hours for 30 days after account creation.
* Sends an aggregated email of new job posts to subscribers.

---

## 🔐 **Security**

Arcjet Security is configured out of the box to handle:

* XSS & CSRF protection
* SQL injection prevention
* Secure headers and CORS policies
* Rate limiting on public endpoints

---

## 💳 **Payment Integration**

* Stripe Checkout for job post payments.
* Webhooks listen for payment success and update job post status.

---

## 📦 **Deployment**

1. Push your code to GitHub.
2. Connect the repository to Vercel.
3. Set environment variables in the Vercel dashboard.
4. Deploy — Vercel will handle build and hosting automatically.

---

## 🤝 **Contributing**

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a Pull Request.

Please follow the existing code style and include tests for new features.

---

## 📄 **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
