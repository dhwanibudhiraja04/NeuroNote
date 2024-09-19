'use client'; // Add this at the very top of the file

// app/page.tsx
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  // Destructure 'isLoaded' and 'isSignedIn' from 'useAuth'
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="bg-slate-200 dark:bg-gray-900 h-screen">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Optionally, adjust the gradient or opacity in dark mode if needed */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%,100% 61.6%,97.5% 26.9%,85.5% 0.1%,80.7% 2%,72.5% 32.5%,60.2% 62.4%,52.4% 68.1%,47.5% 58.3%,45.2% 34.5%,27.5% 76.7%,0.1% 64.9%,17.9% 100%,27.6% 76.8%,76.1% 97.7%,74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-2xl py-12">
          <div className="text-center">
            <Image
              src="/mainPage.svg"
              width={200}
              height={200}
              alt="a woman holding a document"
              className="mx-auto rounded-2xl mb-4"
            />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
              Take Control of your Team Documentation
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-100">
              NeuroNote acts as your team&apos;s second brain, storing all your docs
              and allowing easy vector search.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isLoaded && isSignedIn ? (
                // If the user is signed in, navigate to '/dashboard'
                <Link href="/dashboard">
                  <Button className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                // If the user is not signed in, show the SignInButton
                <SignInButton mode="modal">
                  <Button className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400">
                    Get started
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>

        {/* ... rest of your code ... */}
      </div>
    </div>
  );
}
