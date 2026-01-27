"use client"

import { formatDateTime } from "@/app/utils/date"
import { formatIDR } from "@/app/utils/idr-format"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/**
 * ListView
 * Renders an object with dynamic keys into a clean list layout
 *
 * Props:
 * - data: Record<string, any> | null
 * - blacklist?: string[]   // keys to exclude
 */
export default function AppListView({
  data,
  blacklist = [],
}: {
  data: Record<string, any> | null
  blacklist?: string[]
}) {
  if (!data) {
    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No data selected
        </CardContent>
      </Card>
    )
  }

  const entries = Object.entries(data).filter(
    ([key]) => !blacklist.includes(key)
  )

  return (
    <Card className="border-none shadow-none">
      <CardContent className="space-y-4 p-4">
        {entries.map(([key, value], index) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-sm font-medium capitalize text-muted-foreground">
                {formatKey(key)}
              </span>
              <span className="text-sm text-right">
                {renderValue(key, value)}
              </span>
            </div>
            {index < entries.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/* ---------------- helpers ---------------- */
function formatKey(key: string) {
  return key
    // handle snake_case → snake case
    .replace(/_/g, " ")
    // handle camelCase / PascalCase → camel Case
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    // rapihin kapitalisasi
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function renderValue(key: string, value: any) {
  if (value === null || value === undefined) return "-"

  const lowerKey = key.toLowerCase()

  // Check if key includes 'date'
  if (lowerKey.includes("date")) {
    return formatDateTime(value)
  }

  // Check if key includes 'amount'
  if (lowerKey.includes("amount")) {
    return formatIDR(value)
  }

  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-"
  if (typeof value === "object") return JSON.stringify(value)
  return value.toString()
}

