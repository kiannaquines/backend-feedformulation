import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { API } from '@/api'
import { Icon } from '@/components/Icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ ingredients: 0, nutrients: 0, saved: 0 })
  const [aiStatus, setAiStatus] = useState(null)

  useEffect(() => {
    Promise.all([
      API.ingredients.all(),
      API.nutrients.all(),
      API.formulation.mine(),
      API.ingredients.aiStatus(),
    ]).then(([ing, nut, form, ai]) => {
      setStats({
        ingredients: ing.data?.length ?? 0,
        nutrients: nut.data?.length ?? 0,
        saved: form.data?.length ?? 0,
      })
      setAiStatus(ai.data)
    }).catch(() => {})
  }, [])

  const STAT_CARDS = [
    { label: 'Ingredients', value: stats.ingredients, icon: 'inventory_2', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Nutrient Profiles', value: stats.nutrients, icon: 'checklist', gradient: 'from-purple-500 to-purple-600' },
    { label: 'Saved Formulas', value: stats.saved, icon: 'bookmark', gradient: 'from-amber-500 to-amber-600' },
  ]

  const QUICK_LINKS = [
    { to: '/formulation', label: 'New Formulation', desc: 'Run LP optimizer with lock-aware constraints', icon: 'science', color: 'text-emerald-600' },
    { to: '/ingredients', label: 'Manage Ingredients', desc: 'Add or edit ingredient nutritional data', icon: 'inventory_2', color: 'text-blue-600' },
    { to: '/nutrient-requirements', label: 'Nutrient Profiles', desc: 'Create target profiles for different animals', icon: 'checklist', color: 'text-purple-600' },
    { to: '/saved-formulations', label: 'Saved Formulations', desc: 'Review and reuse past formulation results', icon: 'bookmark', color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Welcome back, {user?.username}
            <Icon name="waving_hand" size={28} className="text-yellow-500" />
          </h1>
          <p className="text-muted-foreground mt-1">Your feed formulation dashboard</p>
        </div>
        {aiStatus && (
          <Badge variant={aiStatus.api_available ? 'default' : 'destructive'} className="gap-2">
            <div className={cn('w-2 h-2 rounded-full', aiStatus.api_available ? 'bg-green-500' : 'bg-red-500')} />
            {aiStatus.api_available ? `AI Online · ${aiStatus.model_name}` : 'AI Offline'}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {STAT_CARDS.map(({ label, value, icon, gradient }) => (
          <Card key={label} className="relative overflow-hidden">
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10', gradient)} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', gradient)}>
                  <Icon name={icon} size={24} className="text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {QUICK_LINKS.map(({ to, label, desc, icon, color }) => (
            <Link key={to} to={to} className="block group">
              <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon name={icon} size={24} className={color} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{label}</CardTitle>
                      <CardDescription className="mt-1">{desc}</CardDescription>
                    </div>
                    <Icon name="arrow_forward" size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
