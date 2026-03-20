export const DRIVER_COLORS_BY_YEAR = {
  '2026': {
    VER: '#3671c6', HAD: '#3671c6',
    LEC: '#e8002d', HAM: '#e8002d', BEA: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000', DOO: '#ff8000',
    RUS: '#00d2be', ANT: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', COL: '#0093cc',
    TSU: '#6692ff', LAW: '#6692ff',
    ALB: '#005aff', SAI: '#005aff',
    OCO: '#b6babd', MAG: '#b6babd',
    HUL: '#c92d4b', BOR: '#c92d4b',
    PER: '#ffffff', BOT: '#ffffff',
  },
  '2025': {
    VER: '#3671c6', LAW: '#3671c6',
    LEC: '#e8002d', HAM: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000',
    RUS: '#00d2be', ANT: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', DOO: '#0093cc',
    TSU: '#6692ff', HAD: '#6692ff',
    ALB: '#005aff', SAI: '#005aff',
    MAG: '#b6babd', OCO: '#b6babd',
    HUL: '#c92d4b', BOR: '#c92d4b',
    BEA: '#b6babd',
  },
  '2024': {
    VER: '#3671c6', PER: '#3671c6',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000',
    HAM: '#00d2be', RUS: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', OCO: '#0093cc',
    TSU: '#6692ff', RIC: '#6692ff',
    ALB: '#005aff', SAR: '#005aff',
    MAG: '#b6babd', HUL: '#b6babd',
    ZHO: '#c92d4b', BOT: '#c92d4b',
  },
  '2023': {
    VER: '#3671c6', PER: '#3671c6',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000',
    HAM: '#00d2be', RUS: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', OCO: '#0093cc',
    TSU: '#6692ff', DEV: '#6692ff',
    ALB: '#005aff', SAR: '#005aff',
    MAG: '#b6babd', HUL: '#b6babd',
    ZHO: '#c92d4b', BOT: '#c92d4b',
  },
  '2022': {
    VER: '#3671c6', PER: '#3671c6',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', RIC: '#ff8000',
    HAM: '#00d2be', RUS: '#00d2be',
    ALO: '#0093cc', OCO: '#0093cc',
    VET: '#52e252', STR: '#52e252',
    GAS: '#6692ff', TSU: '#6692ff',
    ALB: '#005aff', LAT: '#005aff',
    MAG: '#b6babd', MSC: '#b6babd',
    ZHO: '#c92d4b', BOT: '#c92d4b',
  },
  '2021': {
    VER: '#3671c6', PER: '#3671c6',
    HAM: '#00d2be', BOT: '#00d2be',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', RIC: '#ff8000',
    VET: '#52e252', STR: '#52e252',
    GAS: '#0093cc', ALO: '#0093cc',
    TSU: '#6692ff', HAR: '#6692ff',
    RAI: '#c92d4b', GIO: '#c92d4b',
    RUS: '#005aff', LAT: '#005aff',
    MAZ: '#b6babd', SCH: '#b6babd',
  },
  '2020': {
    HAM: '#00d2be', BOT: '#00d2be',
    VER: '#3671c6', ALB: '#3671c6',
    LEC: '#e8002d', VET: '#e8002d',
    NOR: '#ff8000', SAI: '#ff8000',
    PER: '#c92d4b', STR: '#52e252',
    OCO: '#0093cc', RIC: '#0093cc',
    GAS: '#6692ff', KVY: '#6692ff',
    GRO: '#b6babd', MAG: '#b6babd',
    RAI: '#c92d4b', GIO: '#c92d4b',
    RUS: '#005aff', LAT: '#005aff',
  },
}

export const CONSTRUCTOR_COLORS = {
  'red bull': '#3671c6', 'red bull racing': '#3671c6',
  'ferrari': '#e8002d', 'scuderia ferrari': '#e8002d',
  'mclaren': '#ff8000', 'mclaren f1 team': '#ff8000',
  'mercedes': '#00d2be', 'mercedes-amg': '#00d2be',
  'aston martin': '#52e252', 'aston martin f1': '#52e252',
  'alpine': '#0093cc', 'alpine f1': '#0093cc',
  'williams': '#005aff', 'williams racing': '#005aff',
  'alphatauri': '#6692ff', 'rb': '#6692ff', 'racing bulls': '#6692ff',
  'alfa romeo': '#c92d4b', 'sauber': '#c92d4b', 'kick sauber': '#c92d4b',
  'haas': '#b6babd', 'haas f1 team': '#b6babd',
  'cadillac': '#ffffff', 'andretti': '#ffffff',
}

export const FALLBACK_COLORS = [
  '#3671c6','#e8002d','#ff8000','#00d2be',
  '#52e252','#c92d4b','#9b59b6','#f39c12'
]

export function getDriverColor(code, index, year) {
  const colors = DRIVER_COLORS_BY_YEAR[String(year)] || DRIVER_COLORS_BY_YEAR['2024']
  return colors[code] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export function getConstructorColor(name) {
  if (!name) return '#888'
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(CONSTRUCTOR_COLORS)) {
    if (lower.includes(key)) return color
  }
  return '#888'
}