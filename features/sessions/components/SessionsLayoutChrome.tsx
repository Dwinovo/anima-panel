import type { ComponentType, ReactNode } from 'react'

import {
  Bell,
  CircleHelp,
  Layers3,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SessionsLayoutChromeProps = {
  totalSessions: number
  searchQuery: string
  onSearchChange: (value: string) => void
  onCreateSession: () => void
  children: ReactNode
}

type NavItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  isActive?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Sessions', icon: Layers3, isActive: true },
  { label: 'Security', icon: ShieldCheck },
  { label: 'Settings', icon: Settings },
]

export function SessionsLayoutChrome({
  totalSessions,
  searchQuery,
  onSearchChange,
  onCreateSession,
  children,
}: SessionsLayoutChromeProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(263_100%_97%)_0%,_hsl(0_0%_100%)_32%,_hsl(0_0%_100%)_100%)] text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border/70 bg-background/95 md:flex">
        <div className="flex items-center gap-3 border-b border-border/70 px-5 py-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-none">Anima</p>
            <p className="text-xs text-muted-foreground">Management Console</p>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ label, icon: Icon, isActive }) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-border/70 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
            <Avatar className="size-8">
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Alex Rivera</p>
              <p className="truncate text-[11px] text-muted-foreground">Admin Access</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-8">
            <h1 className="text-lg font-bold tracking-tight">Session Management</h1>

            <div className="relative ml-auto hidden w-full max-w-sm md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9"
                placeholder="Search sessions..."
                aria-label="Search sessions"
              />
            </div>

            <Button size="icon" variant="ghost" aria-label="Notifications">
              <Bell className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Help">
              <CircleHelp className="size-4" />
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-black tracking-tight">Active Sessions</p>
              <p className="text-sm text-muted-foreground">
                Monitor and manage real-time environment instances.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                Total {totalSessions}
              </Badge>
              <Button onClick={onCreateSession} className="shadow-lg shadow-primary/20">
                <Plus className="size-4" />
                Create Session
              </Button>
            </div>
          </section>

          <div className="md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9"
                placeholder="Search sessions..."
                aria-label="Search sessions"
              />
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
