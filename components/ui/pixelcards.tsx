"use client"

import React from "react"

export type PixelCardProps = {
  label: string
  canvasProps?: { gap?: number; speed?: number; colors?: string }
  number?: number
  icon?: React.ReactNode
  desc?: string
  color?: string
}

export function PixelCard({ label, canvasProps, number, icon, desc, color }: PixelCardProps) {
  return (
    <div
      className="rounded-xl border bg-card text-card-foreground shadow-sm p-4"
      aria-label={label}
      data-color={color}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6">{icon}</div>
        <h3 className="text-sm font-medium">{label}</h3>
      </div>
      {typeof number === "number" && (
        <div className="text-3xl font-bold mb-1">{number}</div>
      )}
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      {canvasProps && (
        <div className="mt-2 text-[10px] text-muted-foreground">
          gap: {canvasProps.gap ?? 0} • speed: {canvasProps.speed ?? 0} • colors: {canvasProps.colors ?? ""}
        </div>
      )}
    </div>
  )
}
