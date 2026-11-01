/**
 * Code 128 (set B) encoder. Produces real, scannable barcodes for the shipping
 * labels: every printable ASCII character is supported, anything else is
 * replaced with "-".
 *
 * Each pattern lists six module widths, alternating bar/space and starting
 * with a bar; every pattern spans 11 modules (the stop pattern spans 13).
 */
const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232',
]
const START_B = 104
const STOP = '2331112'

/** Module widths for the full symbol (start, data, checksum, stop) — no quiet zones. */
export function code128(text: string): number[] {
  const values = [START_B]
  for (const char of text) {
    const code = char.charCodeAt(0)
    values.push(code >= 32 && code <= 126 ? code - 32 : '-'.charCodeAt(0) - 32)
  }

  // Weighted modulo-103 checksum; the start character has weight 1 like the first data character
  const checksum = values.reduce((sum, value, i) => sum + value * Math.max(i, 1), 0) % 103
  values.push(checksum)

  const widths = values.flatMap((value) => [...PATTERNS[value]].map(Number))
  widths.push(...[...STOP].map(Number))
  return widths
}

export type Bars = { bars: { x: number; width: number }[]; modules: number }

/** Bar rectangles in module units, ready for SVG or canvas. */
export function barcodeBars(text: string, quietZone = 10): Bars {
  const bars: Bars['bars'] = []
  let x = quietZone
  code128(text).forEach((width, i) => {
    if (i % 2 === 0) bars.push({ x, width })
    x += width
  })
  return { bars, modules: x + quietZone }
}
