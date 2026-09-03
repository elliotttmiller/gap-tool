import { Rectangle, type RectangleProps } from "recharts"

/**
 * Recharts can place categorical bars on fractional SVG coordinates. Chromium
 * then rounds each edge independently, so equal-width columns can rasterize a
 * pixel differently across screen and PDF sizes. Use one integer width and a
 * centered integer x-coordinate for every segment while preserving Recharts'
 * y/height animation, radius, events, and Cell styling.
 */
export function UniformStackedBar(props: RectangleProps) {
  const sourceX = props.x ?? 0
  const sourceWidth = Math.max(0, props.width ?? 0)
  const width = Math.floor(sourceWidth)
  const x = Math.round(sourceX + (sourceWidth - width) / 2)

  return (
    <Rectangle
      {...props}
      x={x}
      width={width}
      shapeRendering="crispEdges"
      stroke="none"
      strokeWidth={0}
    />
  )
}
