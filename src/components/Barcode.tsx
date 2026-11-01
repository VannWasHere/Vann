import { barcodeBars } from '../lib/barcode'

type BarcodeProps = {
  value: string
  className?: string
}

/** A real, scannable Code 128 barcode, scaled to whatever box it is given. */
export default function Barcode({ value, className }: BarcodeProps) {
  const { bars, modules } = barcodeBars(value)
  const path = bars.map((bar) => `M${bar.x} 0h${bar.width}v1h-${bar.width}z`).join('')

  return (
    <svg
      viewBox={`0 0 ${modules} 1`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Barcode: ${value}`}
      className={className}
    >
      <path d={path} fill="currentColor" />
    </svg>
  )
}
