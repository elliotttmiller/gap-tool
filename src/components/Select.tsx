// Tremor Raw Select [v0.0.0]

import * as SelectPrimitives from "@radix-ui/react-select"
import { RiArrowDownSLine, RiArrowUpSLine, RiCheckLine } from "@remixicon/react"
import { format } from "date-fns"
import React from "react"
import { DateRange } from "react-day-picker"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const Select = SelectPrimitives.Root
Select.displayName = "Select"

const SelectGroup = SelectPrimitives.Group
SelectGroup.displayName = "SelectGroup"

const SelectValue = SelectPrimitives.Value
SelectValue.displayName = "SelectValue"

const selectTriggerStyles = [
  cx(
    "group/trigger flex w-full select-none items-center justify-between gap-2 truncate rounded-md border px-3 py-2 shadow-sm outline-none transition sm:text-sm",
    "border-[#c8d7db] dark:border-gray-700",
    "text-[#102a3a] dark:text-gray-50",
    "data-[placeholder]:text-gray-500 data-[placeholder]:dark:text-gray-500",
    "bg-white dark:bg-gray-900",
    "hover:border-[#9ebbc2] hover:bg-[#fbfdfd] dark:hover:bg-gray-800",
    "data-[disabled]:bg-gray-800 data-[disabled]:text-gray-500",
    "data-[disabled]:dark:border-gray-700 data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500",
    focusInput,
  ),
]

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger> & { hasError?: boolean }
>(({ className, hasError, children, ...props }, forwardedRef) => (
  <SelectPrimitives.Trigger
    ref={forwardedRef}
    className={cx(selectTriggerStyles, hasError ? hasErrorInput : "", className)}
    {...props}
  >
    <span className="truncate">{children}</span>
    <SelectPrimitives.Icon asChild>
      <RiArrowDownSLine
        className={cx(
          "-mr-1 size-5 shrink-0",
          "text-gray-400 dark:text-gray-600",
          "group-data-disabled/trigger:text-gray-300 group-data-disabled/trigger:dark:text-gray-600",
        )}
      />
    </SelectPrimitives.Icon>
  </SelectPrimitives.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollUpButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollUpButton
    ref={forwardedRef}
    className={cx("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <RiArrowUpSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitives.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollDownButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollDownButton
    ref={forwardedRef}
    className={cx("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <RiArrowDownSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitives.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(
  ({ className, position = "popper", children, sideOffset = 8, collisionPadding = 10, ...props }, forwardedRef) => (
    <SelectPrimitives.Portal>
      <SelectPrimitives.Content
        ref={forwardedRef}
        className={cx(
          "relative z-50 overflow-hidden rounded-md border shadow-xl shadow-black/2.5",
          "min-w-[calc(var(--radix-select-trigger-width)-2px)] max-w-[95vw]",
          "max-h-[--radix-select-content-available-height]",
          "bg-white dark:bg-gray-900",
          "text-[#10283b] dark:text-gray-50",
          "border-[#c8d7db] dark:border-gray-700",
          "shadow-[0_18px_45px_rgba(15,42,58,0.16)] dark:shadow-black/40",
          "will-change-[transform,opacity]",
          "data-[state=closed]:animate-hide",
          "data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade",
          className,
        )}
        sideOffset={sideOffset}
        position={position}
        collisionPadding={collisionPadding}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitives.Viewport
          className={cx(
            "p-1",
            position === "popper" && "h-(--radix-select-trigger-height) w-full min-w-[calc(var(--radix-select-trigger-width))]",
          )}
        >
          {children}
        </SelectPrimitives.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitives.Content>
    </SelectPrimitives.Portal>
  ),
)
SelectContent.displayName = "SelectContent"

const SelectGroupLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Label>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Label
    ref={forwardedRef}
    className={cx("px-3 py-2 text-xs font-medium tracking-wide", "text-gray-500 dark:text-gray-500", className)}
    {...props}
  />
))
SelectGroupLabel.displayName = "SelectGroupLabel"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...props }, forwardedRef) => (
  <SelectPrimitives.Item
    ref={forwardedRef}
    className={cx(
      "grid cursor-pointer grid-cols-[1fr_20px] gap-x-2 rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
      "text-[#10283b] dark:text-gray-50",
      "data-disabled:pointer-events-none data-disabled:text-gray-500 data-disabled:hover:bg-none",
      "focus-visible:bg-[#e8f7f7] dark:focus-visible:bg-gray-800",
      "hover:bg-[#f0f7f7] dark:hover:bg-gray-800",
      className,
    )}
    {...props}
  >
    <SelectPrimitives.ItemText className="flex-1 truncate">{children}</SelectPrimitives.ItemText>
    <SelectPrimitives.ItemIndicator>
      <RiCheckLine className="size-5 shrink-0 text-gray-800 dark:text-gray-200" aria-hidden="true" />
    </SelectPrimitives.ItemIndicator>
  </SelectPrimitives.Item>
))
SelectItem.displayName = "SelectItem"

const SelectItemPeriod = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item> & { period?: DateRange | undefined }
>(({ className, children, period, ...props }, forwardedRef) => (
  <SelectPrimitives.Item
    ref={forwardedRef}
    className={cx(
      "relative flex cursor-pointer items-center rounded py-2 pl-8 pr-3 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
      "text-[#10283b] dark:text-gray-50",
      "data-disabled:pointer-events-none data-disabled:text-gray-500",
      "focus-visible:bg-[#e8f7f7] dark:focus-visible:bg-gray-800",
      "hover:bg-[#f0f7f7] dark:hover:bg-gray-800",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitives.ItemIndicator>
        <RiCheckLine className="size-5 shrink-0 text-gray-800 dark:text-gray-200" aria-hidden="true" />
      </SelectPrimitives.ItemIndicator>
    </span>
    <div className="flex w-full items-center">
      <span className="w-40 sm:w-32">
        <SelectPrimitives.ItemText>{children}</SelectPrimitives.ItemText>
      </span>
      <span>
        {period?.from && period?.to && (
          <span className="whitespace-nowrap font-normal text-gray-400">
            {format(period.from, "MMM d, yyyy")} – {format(period.to, "MMM d, yyyy")}
          </span>
        )}
      </span>
    </div>
  </SelectPrimitives.Item>
))
SelectItemPeriod.displayName = "SelectItemPeriod"

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Separator>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Separator
    ref={forwardedRef}
    className={cx("-mx-1 my-1 h-px", "bg-gray-300 dark:bg-gray-700", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemPeriod,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
