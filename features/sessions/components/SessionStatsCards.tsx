import type { ComponentType } from 'react'

import { Activity, Gauge, UsersRound } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

type SessionStatsCardsProps = {
  activeSessions: number
  totalCapacity: number
  averageCapacity: number
}

type StatCard = {
  title: string
  value: string
  icon: ComponentType<{ className?: string }>
  iconClassName: string
}

export function SessionStatsCards({
  activeSessions,
  totalCapacity,
  averageCapacity,
}: SessionStatsCardsProps) {
  const cards: StatCard[] = [
    {
      title: 'Active Sessions',
      value: activeSessions.toLocaleString(),
      icon: Activity,
      iconClassName: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Capacity',
      value: totalCapacity.toLocaleString(),
      icon: UsersRound,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      title: 'Avg Capacity',
      value: averageCapacity.toLocaleString(),
      icon: Gauge,
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.title} className="border-border/80 bg-background/90">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${card.iconClassName}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
