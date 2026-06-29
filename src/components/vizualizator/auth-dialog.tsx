'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Loader2, LogIn, UserPlus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regName, setRegName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Napaka pri prijavi',
          description: 'Napačen email ali geslo',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Uspešna prijava',
          description: 'Dobrodošli nazaj!',
        })
        onOpenChange(false)
      }
    } catch (err) {
      toast({
        title: 'Napaka',
        description: 'Prišlo je do napake',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: orgName,
          slug: orgSlug,
          email: regEmail,
          password: regPassword,
          name: regName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Napaka pri registraciji')
      }

      // Avtomatska prijava po registraciji
      await signIn('credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false,
      })

      toast({
        title: 'Registracija uspešna!',
        description: `Organizacija ${orgName} je ustvarjena`,
      })

      onOpenChange(false)
      
      // Reset form
      setOrgName('')
      setOrgSlug('')
      setRegEmail('')
      setRegPassword('')
      setRegName('')
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            {mode === 'login' ? 'Prijava' : 'Registracija firme'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="text-xs">
              <LogIn className="h-3 w-3 mr-1" />
              Prijava
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs">
              <UserPlus className="h-3 w-3 mr-1" />
              Registracija
            </TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <Label htmlFor="loginEmail" className="text-xs">Email</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="janez@firma.si"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="loginPassword" className="text-xs">Geslo</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Prijavi se
              </Button>
            </form>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <Label htmlFor="orgName" className="text-xs">Ime firme</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Roksal d.o.o. Kranj"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="orgSlug" className="text-xs">URL identifikator</Label>
                <Input
                  id="orgSlug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  placeholder="roksal"
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Samo male črke, številke in vezaji
                </p>
              </div>
              <div>
                <Label htmlFor="regName" className="text-xs">Tvoje ime</Label>
                <Input
                  id="regName"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Marko Marković"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="regEmail" className="text-xs">Email</Label>
                <Input
                  id="regEmail"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="marko@roksal.si"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="regPassword" className="text-xs">Geslo (min 6 znakov)</Label>
                <Input
                  id="regPassword"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Ustvari račun
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Trial paket: 10 AI vizualizacij, 1 uporabnik
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
