'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User, Building2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { AuthDialog } from './auth-dialog'

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  trial: { label: 'Trial', color: 'bg-gray-100 text-gray-700' },
  pro: { label: 'Pro', color: 'bg-blue-100 text-blue-700' },
  agency: { label: 'Agency', color: 'bg-purple-100 text-purple-700' },
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  VODJA: 'Vodja',
  MONTER: 'Monter',
  SKLADISCE: 'Skladišče',
}

export function UserMenu() {
  const { data: session, status } = useSession()
  const [authOpen, setAuthOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
    )
  }

  if (!session?.user) {
    return (
      <>
        <Button
          variant="default"
          size="sm"
          onClick={() => setAuthOpen(true)}
        >
          Prijava
        </Button>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    )
  }

  const user = session.user as any
  const planInfo = PLAN_LABELS[user.organizationPlan || 'trial'] || PLAN_LABELS.trial

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2">
        {user.organizationName && (
          <Badge variant="outline" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            {user.organizationName}
          </Badge>
        )}
        <Badge className={`text-xs ${planInfo.color}`}>
          {user.role === 'ADMIN' && <Crown className="h-3 w-3 mr-1" />}
          {ROLE_LABELS[user.role] || user.role}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {planInfo.label}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          {user.name || user.email}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-3 w-3" />
          <span className="sr-only">Odjava</span>
        </Button>
      </div>
    </div>
  )
}
