"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">Sign in to Inversion</h1>
        <div className="space-y-2">
          <Button className="w-full" variant="default" onClick={() => signIn("github")}> 
            <Github className="mr-2 h-4 w-4" /> Continue with GitHub
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => signIn("google")}> 
            <Mail className="mr-2 h-4 w-4" /> Continue with Google
          </Button>
          <Button className="w-full" variant="outline" onClick={() => signIn("linkedin")}> 
            <Linkedin className="mr-2 h-4 w-4" /> Continue with LinkedIn
          </Button>
        </div>
      </div>
    </div>
  )
}


