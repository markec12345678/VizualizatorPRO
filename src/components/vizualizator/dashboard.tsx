'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  TrendingUp,
  FolderKanban,
  Crown,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Mail,
  Calendar,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface DashboardData {
  organization: {
    id: string
    name: string
    slug: string
    plan: string
    maxUsers: number
    maxVisualizations: number
  }
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  stats: {
    totalProjects: number
    totalVisualizations: number
    totalLeads: number
    totalTeamMembers: number
    totalCustomMaterials: number
    vizLast30Days: number
    leadsLast30Days: number
  }
  usage: {
    visualizations: { used: number; max: number; percent: number; remaining: number }
    teamMembers: { used: number; max: number; remaining: number }
  }
  recentProjects: Array<{
    id: string
    title: string
    customerName: string | null
    status: string
    createdAt: string
    visualizationsCount: number
  }>
  recentVisualizations: Array<{
    id: string
    materialName: string
    category: string
    status: string
    processingTime: number | null
    createdAt: string
  }>
  teamMembers: Array<{
    id: string
    email: string
    name: string | null
    role: string
    createdAt: string
  }>
}

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

export function Dashboard() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const { toast } = useToast()

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else if (res.status === 401) {
        // Ni prijavljen - to je OK
        setData(null)
      }
    } catch (err) {
      console.error('Napaka pri pridobivanju dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboard()
    } else if (status === 'unauthenticated') {
      setData(null)
      setLoading(false)
    }
  }, [status, fetchDashboard])

  // Ni prijavljen
  if (status !== 'authenticated') {
    return null
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const planInfo = PLAN_LABELS[data.organization.plan] || PLAN_LABELS.trial
  const isCurrentUserAdmin = data.user.role === 'ADMIN'

  return (
    <Card className="p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-accent" />
            Nadzorna plošča
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.organization.name} · {planInfo.label} paket
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Osveži
        </Button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<FolderKanban className="h-4 w-4" />}
          label="Projekti"
          value={data.stats.totalProjects}
          color="bg-blue-50 text-blue-700"
          subtext={`${data.stats.leadsLast30Days} novih v 30 dneh`}
        />
        <StatCard
          icon={<ImageIcon className="h-4 w-4" />}
          label="Vizualizacije"
          value={data.stats.totalVisualizations}
          color="bg-purple-50 text-purple-700"
          subtext={`${data.stats.vizLast30Days} v 30 dneh`}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Ekipa"
          value={data.stats.totalTeamMembers}
          color="bg-green-50 text-green-700"
          subtext={`od ${data.organization.maxUsers} možnih`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Materiali"
          value={data.stats.totalCustomMaterials}
          color="bg-amber-50 text-amber-700"
          subtext="lastnih v katalogu"
        />
      </div>

      {/* USAGE BARS */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <UsageCard
          title="Poraba vizualizacij"
          used={data.usage.visualizations.used}
          max={data.usage.visualizations.max}
          percent={data.usage.visualizations.percent}
          remaining={data.usage.visualizations.remaining}
        />
        <UsageCard
          title="Uporabniki v ekipi"
          used={data.usage.teamMembers.used}
          max={data.usage.teamMembers.max}
          percent={Math.round((data.usage.teamMembers.used / data.usage.teamMembers.max) * 100)}
          remaining={data.usage.teamMembers.remaining}
        />
      </div>

      {/* RECENT PROJECTS + VISUALIZATIONS */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* RECENT PROJECTS */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Zadnji projekti
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.recentProjects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Še ni projektov
              </p>
            ) : (
              data.recentProjects.map(project => (
                <div key={project.id} className="border rounded p-2 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{project.customerName || project.title}</p>
                      <p className="text-muted-foreground">
                        {project.visualizationsCount} viz · {new Date(project.createdAt).toLocaleDateString('sl-SI')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT VISUALIZATIONS */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Zadnje vizualizacije
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.recentVisualizations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Še ni vizualizacij
              </p>
            ) : (
              data.recentVisualizations.map(viz => (
                <div key={viz.id} className="border rounded p-2 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{viz.materialName}</p>
                      <p className="text-muted-foreground">
                        {viz.processingTime ? `${viz.processingTime}s · ` : ''}
                        {new Date(viz.createdAt).toLocaleDateString('sl-SI')}
                      </p>
                    </div>
                    {viz.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                    ) : viz.status === 'FAILED' ? (
                      <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TEAM MANAGEMENT */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ekipa ({data.teamMembers.length})
          </h3>
          {isCurrentUserAdmin && data.usage.teamMembers.remaining > 0 && (
            <InviteUserDialog
              open={inviteOpen}
              onOpenChange={setInviteOpen}
              onInvited={fetchDashboard}
            />
          )}
        </div>
        <div className="space-y-2">
          {data.teamMembers.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  member.role === 'ADMIN' ? 'bg-amber-100' : 'bg-muted'
                }`}>
                  {member.role === 'ADMIN' ? (
                    <Crown className="h-4 w-4 text-amber-700" />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      {(member.name || member.email)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.name || member.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  {ROLE_LABELS[member.role] || member.role}
                </Badge>
                {isCurrentUserAdmin && member.id !== data.user.id && (
                  <RemoveUserButton
                    userId={member.id}
                    userName={member.name || member.email}
                    onRemoved={fetchDashboard}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  subtext 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: string
  subtext?: string
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${color} mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subtext && (
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtext}</p>
      )}
    </div>
  )
}

function UsageCard({ 
  title, 
  used, 
  max, 
  percent, 
  remaining 
}: { 
  title: string
  used: number
  max: number
  percent: number
  remaining: number
}) {
  const isWarning = percent >= 80
  const isCritical = percent >= 100

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <Badge variant={isCritical ? 'destructive' : isWarning ? 'secondary' : 'outline'} className="text-xs">
          {used} / {max}
        </Badge>
      </div>
      <Progress 
        value={Math.min(100, percent)} 
        className={`h-2 ${isCritical ? '[&_[role=progressbar]]:bg-red-500' : isWarning ? '[&_[role=progressbar]]:bg-amber-500' : ''}`}
      />
      <p className="text-xs text-muted-foreground mt-1.5">
        {remaining > 0 ? `Še ${remaining} na voljo` : 'Dosežen maksimum'}
      </p>
    </div>
  )
}

function InviteUserDialog({ 
  open, 
  onOpenChange, 
  onInvited 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: () => void
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('MONTER')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Napaka pri vabilu')
      }

      toast({
        title: 'Uporabnik dodan!',
        description: `${email} je sedaj član ekipe`,
      })

      setEmail('')
      setName('')
      setPassword('')
      setRole('MONTER')
      onOpenChange(false)
      onInvited()
    } catch (err) {
      toast({
        title: 'Napaka',
        description: err instanceof Error ? err.message : 'Neznana napaka',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Dodaj uporabnika
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj novega uporabnika v ekipo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="inviteEmail" className="text-xs">Email *</Label>
            <Input
              id="inviteEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marko@firma.si"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="inviteName" className="text-xs">Ime</Label>
            <Input
              id="inviteName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marko Marković"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="invitePassword" className="text-xs">Začasno geslo (min 6 znakov) *</Label>
            <Input
              id="invitePassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Uporabnik naj ga spremeni po prvi prijavi
            </p>
          </div>
          <div>
            <Label htmlFor="inviteRole" className="text-xs">Vloga</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrator (polni dostop)</SelectItem>
                <SelectItem value="VODJA">Vodja (upravlja ekipo)</SelectItem>
                <SelectItem value="MONTER">Monter (lastni projekti)</SelectItem>
                <SelectItem value="SKLADISCE">Skladišče (zaloga)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Dodaj uporabnika
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RemoveUserButton({ 
  userId, 
  userName, 
  onRemoved 
}: { 
  userId: string
  userName: string
  onRemoved: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRemove = async () => {
    if (!confirm(`Resnično želiš odstraniti ${userName} iz ekipe?`)) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/organization/invite?userId=${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Napaka pri odstranjevanju')
      }

      toast({
        title: 'Uporabnik odstranjen',
        description: `${userName} ni več v ekipi`,
      })
      onRemoved()
    } catch (err) {
      toast({
        title: 'Napaka',
        description: err instanceof Error ? err.message : 'Neznana napaka',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleRemove}
      disabled={isLoading}
      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  )
}
