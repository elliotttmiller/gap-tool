import { RiCloseLine } from "@remixicon/react"
import * as React from "react"
import { createPortal } from "react-dom"

import { cx, focusRing } from "@/lib/utils"
import { Button } from "./Button"

type DrawerContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawerContext(componentName: string) {
  const context = React.useContext(DrawerContext)
  if (!context) throw new Error(`${componentName} must be used inside <Drawer />`)
  return context
}

type DrawerProps = {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Drawer({ children, open, defaultOpen = false, onOpenChange }: DrawerProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = typeof open === "boolean"
  const currentOpen = isControlled ? open : internalOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  const value = React.useMemo(() => ({ open: currentOpen, setOpen }), [currentOpen, setOpen])

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}
Drawer.displayName = "Drawer"

type DrawerTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  children: React.ReactNode
}

const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { setOpen } = useDrawerContext("DrawerTrigger")

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
      onClick?.(event)
      if (!event.defaultPrevented) setOpen(true)
    }

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      return React.cloneElement(child, {
        ...props,
        ref,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          child.props.onClick?.(event)
          handleClick(event)
        },
      })
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    )
  },
)
DrawerTrigger.displayName = "Drawer.Trigger"

type DrawerCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  children?: React.ReactNode
}

const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { setOpen } = useDrawerContext("DrawerClose")

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
      onClick?.(event)
      if (!event.defaultPrevented) setOpen(false)
    }

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      return React.cloneElement(child, {
        ...props,
        ref,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          child.props.onClick?.(event)
          handleClick(event)
        },
      })
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    )
  },
)
DrawerClose.displayName = "Drawer.Close"

function DrawerPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}
DrawerPortal.displayName = "DrawerPortal"

const DrawerOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onClick, ...props }, forwardedRef) => {
    const { setOpen } = useDrawerContext("DrawerOverlay")
    return (
      <div
        ref={forwardedRef}
        className={cx("fixed inset-0 z-50 overflow-y-auto bg-black/30", className)}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented && event.target === event.currentTarget) setOpen(false)
        }}
        {...props}
      />
    )
  },
)
DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, forwardedRef) => {
    const { open, setOpen } = useDrawerContext("DrawerContent")

    React.useEffect(() => {
      if (!open) return
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false)
      }
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }, [open, setOpen])

    if (!open) return null

    return (
      <DrawerPortal>
        <DrawerOverlay>
          <div
            ref={forwardedRef}
            className={cx(
              "fixed inset-y-2 mx-auto flex w-[95vw] flex-1 flex-col overflow-y-auto rounded-md border p-4 shadow-lg focus:outline-none max-sm:inset-x-2 sm:inset-y-2 sm:right-2 sm:max-w-lg sm:p-6",
              "border-[#9fb9c3] bg-[#d8e6ea] animate-drawerSlideLeftAndFade dark:border-gray-800 dark:bg-[#090E1A]",
              focusRing,
              className,
            )}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            {...props}
          >
            {children}
          </div>
        </DrawerOverlay>
      </DrawerPortal>
    )
  },
)
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className="flex items-start justify-between gap-x-4 border-b border-gray-200 pb-4 dark:border-gray-800" {...props}>
      <div className={cx("mt-1 flex flex-col gap-y-1", className)}>{children}</div>
      <DrawerClose asChild>
        <Button variant="ghost" className="aspect-square p-1 hover:bg-gray-400/10">
          <RiCloseLine className="size-6" aria-hidden="true" />
        </Button>
      </DrawerClose>
    </div>
  ),
)
DrawerHeader.displayName = "Drawer.Header"

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, forwardedRef) => (
    <h2 ref={forwardedRef} className={cx("text-base font-semibold text-gray-950 dark:text-gray-50", className)} {...props} />
  ),
)
DrawerTitle.displayName = "DrawerTitle"

const DrawerBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cx("flex-1 py-4", className)} {...props} />,
)
DrawerBody.displayName = "Drawer.Body"

const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cx("flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end dark:border-gray-800", className)} {...props} />
  ),
)
DrawerFooter.displayName = "Drawer.Footer"

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
