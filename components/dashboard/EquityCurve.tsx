'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { EquityPoint } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: EquityPoint[]
  initialCapital: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const equity = payload.find((p: any) => p.dataKey === 'equity')
  const drawdown = payload.find((p: any) => p.dataKey === 'drawdown')

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-800 p-3 text-xs shadow-xl">
      <p className="mb-2 font-medium text-zinc-400">{label}</p>
      {equity && (
        <p className="font-mono font-semibold text-white">
          Capital: {formatCurrency(equity.value)}
        </p>
      )}
      {drawdown && drawdown.value < 0 && (
        <p className="font-mono text-red-400">
          Drawdown: {drawdown.value.toFixed(2)}%
        </p>
      )}
      {payload[0]?.payload?.trade && (
        <p className="mt-1 text-zinc-500">{payload[0].payload.trade}</p>
      )}
    </div>
  )
}

export function EquityCurve({ data, initialCapital }: Props) {
  const isProfit = data.length > 1 && data[data.length - 1].equity >= initialCapital

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={isProfit ? '#34D399' : '#F87171'}
              stopOpacity={0.2}
            />
            <stop
              offset="95%"
              stopColor={isProfit ? '#34D399' : '#F87171'}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#252832" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#475569', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={initialCapital}
          stroke="#475569"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke={isProfit ? '#34D399' : '#F87171'}
          strokeWidth={2}
          fill="url(#equityGradient)"
          dot={false}
          activeDot={{ r: 4, fill: isProfit ? '#34D399' : '#F87171' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
