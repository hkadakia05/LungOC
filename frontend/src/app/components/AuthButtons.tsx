import { useAuth } from '../../context/AuthContext'
import { Button } from './ui/button'
import { LogOut, LogIn } from 'lucide-react'

export function AuthButtons() {
  const { user, signInWithGoogle, signOut } = useAuth()

  if (!user) {
    return (
      <Button
        onClick={signInWithGoogle}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-4 py-2 text-sm"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign in with Google
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-blue-700">{user.email}</span>
      <Button
        onClick={signOut}
        className="bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 text-sm"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
