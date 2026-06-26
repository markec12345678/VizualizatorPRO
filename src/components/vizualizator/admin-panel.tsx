'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Image as ImageIcon, 
  TrendingUp, 
  Mail, 
  Phone, 
  Building2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  notes: string | null
  createdAt: string
}

interface Stats {
  totalLeads: number
  totalVisualizations: number
  completedViz: number
  failedViz: number
  successRate: number
}

const ADMIN_PASSWORD = 'vizualizator-pro-2026'

export function AdminPanel() {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [leadsRes, vizRes] = await Promise.all([
        fetch('/api/lead'),
        fetch('/api/visualize'),
      ])
      
      const leadsData = await leadsRes.json()
      const vizData = await vizRes.json()
      
      if (leadsData.leads) {
        setLeads(leadsData.leads)
      }
      
      setStats({
        totalLeads: leadsData.total || 0,
        totalVisualizations: vizData.totalVisualizations || 0,
        completedViz: vizData.completed || 0,
        failedViz: vizData.failed || 0,
        successRate: vizData.successRate || 0,
      })
    } catch (err) {
      console.error('Napaka pri pridobivanju podatkov:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (unlocked) {
      fetchData()
    }
  }, [unlocked, fetchData])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true)
      toast({
        title: 'Admin dostop odobren',
        description: 'Dobrodošli v administrativnem panelu',
      })
    } else {
      toast({
        title: 'Napačno geslo',
        description: 'Poskusi znova',
        variant: 'destructive',
      })
    }
  }

  if (!unlocked) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Admin panel</h2>
            <p className="text-sm text-muted-foreground">Za dostop vnesi admin geslo</p>
          </div>
        </div>
        <form onSubmit={handleUnlock} className="space-y-3 max-w-sm">
          <div>
            <Label htmlFor="adminPassword">Admin geslo</Label>
            <div className="relative mt-1">
              <Input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vnesi geslo"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Odkleni admin panel
          </Button>
          <p className="text-xs text-muted-foreground">
            Demo geslo: <code className="bg-muted px-1 py-0.5 rounded">vizualizator-pro-2026</code>
          </p>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Admin panel</h2>
            <p className="text-sm text-muted-foreground">Pregled leadov in statistik</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Osveži
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Skupno leadov"
          value={stats?.totalLeads ?? 0}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={<ImageIcon className="h-4 w-4" />}
          label="Vizualizacije"
          value={stats?.totalVisualizations ?? 0}
          color="bg-purple-50 text-purple-700"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Uspešnost"
          value={`${stats?.successRate ?? 0}%`}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          icon={<Mail className="h-4 w-4" />}
          label="Neuspešne"
          value={stats?.failedViz ?? 0}
          color="bg-red-50 text-red-700"
        />
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="leads">
            <Users className="h-4 w-4 mr-2" />
            Leadi ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="visualizations">
            <ImageIcon className="h-4 w-4 mr-2" />
            Vizualizacije
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-0">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {leads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ni leadov. Obiščite demo in oddajte testni lead.
              </p>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {lead.company && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          {lead.company}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('sl-SI')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <a 
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <a 
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </a>
                    )}
                  </div>
                  {lead.notes && (
                    <p className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      {lead.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="visualizations" className="mt-0">
          <div className="text-center py-8 text-muted-foreground text-sm">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
            Podrobna zgodovina vizualizacij bo na voljo v naslednji posodobitvi.
            <br />
            Trenutno si lahko ogledaš skupne statistike zgoraj.
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${color} mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
