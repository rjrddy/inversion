import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Analytics } from "@/components/dashboard/analytics"

export default function Home() {
  const [tab, setTab] = useState<'overview' | 'analytics'>('overview')
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant={tab==='overview'? 'default':'outline'} size="sm" onClick={() => setTab('overview')}>Overview</Button>
          <Button variant={tab==='analytics'? 'default':'outline'} size="sm" onClick={() => setTab('analytics')}>Analytics</Button>
        </div>
      </div>
      {tab === 'overview' && (
        <div className="text-sm text-muted-foreground">Overview of your job search workspace.</div>
      )}
      {tab === 'analytics' && (
        <Analytics />
      )}
    </div>
  );
}
