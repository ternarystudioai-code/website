"use client"

import React from "react"

export type CardHoverEffectProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  variant?: string
  glowEffect?: boolean
  size?: "sm" | "md" | "lg"
  showGridLines?: boolean
}

export function CardHoverEffect({ title, description, icon }: CardHoverEffectProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6">{icon}</div>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
