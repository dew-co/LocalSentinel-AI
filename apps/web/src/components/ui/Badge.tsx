import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-cyan-600 text-slate-100 hover:bg-cyan-600/80",
    secondary: "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-800/80",
    destructive: "border-transparent bg-red-900 text-slate-100 hover:bg-red-900/80",
    outline: "text-slate-100 border-slate-700",
  }
  
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${variants[variant]} ${className}`} {...props} />
  )
}

export { Badge }
