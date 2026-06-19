import { ReactNode } from "react";

export function PageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex min-w-0 flex-col gap-6 ${className}`}>{children}</div>;
}
