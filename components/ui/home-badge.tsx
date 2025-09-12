"use client"

import React from "react"

export default function HomeBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-rose-500" />
      <span>Beautiful MVP blocks</span>
    </div>
  )
}
