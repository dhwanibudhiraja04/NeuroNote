'use client'

import { ModeToggle } from "@/components/ui/mode-toggle"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Authenticated, Unauthenticated } from "convex/react"
import Image from "next/image"
import { Montserrat } from 'next/font/google'

// Set the variable to '--font-montserrat' to match the font being used
const montserrat = Montserrat({
  subsets: ['latin'], // Choose the appropriate subset for your project
  weight: ['400', '700'], // Define the font weights you want to use
  variable: '--font-montserrat' // Update the variable name to match Montserrat
})

export function Header() {
  return (
    <div className={`${montserrat.variable} py-4`} style={{ backgroundColor: "#5067AA" }}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4 text-2xl">
          <Image src="/favicon.ico" width={40} height={40}
            className="rounded"
            alt="an image of a brain" />
          NeuroNote
        </div>

        <div>
          <Unauthenticated>
            <SignInButton />
          </Unauthenticated>
          <Authenticated>
            <div className="flex gap-4">
              <ModeToggle />
              <UserButton />
            </div>
          </Authenticated>
        </div>
      </div>
    </div>
  )
}
