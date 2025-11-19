// src/app/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import { ROUTES } from "@/lib/utils";
// import { AuthButton } from '@/components/auth/AuthButton';

export const metadata: Metadata = {
  title: "Home",
  description:
    "Improve yourself by 1% every day. Track your skills, set goals, and achieve consistent growth.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 lg:py-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              Improve <span className="gradient-text">1%</span> Every Day
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Track your skills, set meaningful goals, and achieve consistent
              growth. Small improvements compound into extraordinary results.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {/* <AuthButton /> */}
              <button>BUTTON</button>

              <Link href="#features" className="btn-outline">
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-md sm:max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  1,000+
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  50,000+
                </div>
                <div className="text-sm text-muted-foreground">
                  Skills Tracked
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  1M+
                </div>
                <div className="text-sm text-muted-foreground">
                  Improvements Made
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose OnePercent?
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple tools designed to help you build consistent growth habits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="card p-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Skills</h3>
              <p className="text-muted-foreground">
                Monitor your progress across multiple skills with detailed
                analytics and insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Set Smart Goals</h3>
              <p className="text-muted-foreground">
                Create achievable milestones that keep you motivated and on
                track.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay Consistent</h3>
              <p className="text-muted-foreground">
                Build habits that stick with reminders, streaks, and progress
                celebrations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Measure Progress</h3>
              <p className="text-muted-foreground">
                Visualize your improvement with charts, reports, and achievement
                badges.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card p-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Community</h3>
              <p className="text-muted-foreground">
                Connect with like-minded individuals on their growth journey.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card p-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Ready</h3>
              <p className="text-muted-foreground">
                Access your progress anywhere with our responsive web app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of people already improving their skills and
              achieving their goals.
            </p>

            {/* <AuthButton size="lg" /> */}
            <button>BUTTON</button>

            <p className="text-sm text-muted-foreground mt-4">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
