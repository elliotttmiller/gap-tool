import * as React from "react"
import { RiArrowDownSLine } from "@remixicon/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CollapsibleInputSectionProps {
  title: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  defaultOpen?: boolean
}

export function CollapsibleInputSection({
  title,
  children,
  className,
  contentClassName,
  defaultOpen = true,
}: CollapsibleInputSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const contentId = React.useId()

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="p-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 border-b border-[#d7e5e7] bg-linear-to-r from-[#f2f9f9] to-white px-5 py-4 text-left transition-colors hover:from-[#e8f7f7] hover:to-[#f7fbfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-none dark:border-transparent dark:bg-none dark:bg-transparent dark:hover:bg-gray-900/35"
        >
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#176371] dark:text-gray-500">
            {title}
          </CardTitle>
          <RiArrowDownSLine
            className={cn(
              "size-5 shrink-0 text-brand-600 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:text-gray-500",
              isOpen ? "rotate-180" : "rotate-0",
            )}
            aria-hidden="true"
          />
        </button>
      </CardHeader>
      <div
        id={contentId}
        aria-hidden={!isOpen}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <CardContent
            className={cn(
              "transition-[padding,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              isOpen ? "translate-y-0" : "-translate-y-2",
              contentClassName,
            )}
          >
            {children}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
