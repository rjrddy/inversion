"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts"

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]

export function Analytics() {
  const [applicationsOverTime, setAot] = useState<Array<{ date: string; count: number }>>([])
  const [versionsVsSuccess, setVvs] = useState<Array<{ versions: number; success: number }>>([])
  const [companiesContacted, setCompanies] = useState<Array<{ name: string; value: number }>>([])

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then((d) => {
      setAot(d.applicationsOverTime || [])
      setVvs(d.versionsVsSuccess || [])
      setCompanies(d.companiesContacted || [])
    }).catch(() => {})
  }, [])
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-md border p-3">
        <div className="text-sm font-medium mb-2">Applications over time</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-md border p-3">
        <div className="text-sm font-medium mb-2">Resume versions vs interview success</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={versionsVsSuccess}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="versions" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="success" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-md border p-3">
        <div className="text-sm font-medium mb-2">Companies contacted</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={companiesContacted} dataKey="value" nameKey="name" outerRadius={80} label>
                {companiesContacted.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


