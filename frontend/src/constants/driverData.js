export const DRIVER_COLORS_BY_YEAR = {
  '2026': {
    // Red Bull
    VER: '#3671c6', HAD: '#3671c6',
    // Ferrari
    LEC: '#e8002d', HAM: '#e8002d',
    // McLaren
    NOR: '#ff8000', PIA: '#ff8000',
    // Mercedes
    RUS: '#00d2be', ANT: '#00d2be',
    // Aston Martin
    ALO: '#52e252', STR: '#52e252',
    // Alpine
    GAS: '#0093cc', COL: '#0093cc',
    // Racing Bulls
    LAW: '#6692ff', LIN: '#6692ff',
    // Williams
    ALB: '#005aff', SAI: '#005aff',
    // Haas
    OCO: '#b6babd', BEA: '#b6babd',
    // Audi
    HUL: '#c92d4b', BOR: '#c92d4b',
    // Cadillac
    PER: '#ffffff', BOT: '#ffffff',
  },
  '2025': {
    // Red Bull
    VER: '#3671c6', LAW: '#3671c6',
    // Ferrari
    LEC: '#e8002d', HAM: '#e8002d',
    // McLaren
    NOR: '#ff8000', PIA: '#ff8000',
    // Mercedes
    RUS: '#00d2be', ANT: '#00d2be',
    // Aston Martin
    ALO: '#52e252', STR: '#52e252',
    // Alpine (Doohan started, Colapinto replaced mid-season)
    GAS: '#0093cc', DOO: '#0093cc', COL: '#0093cc',
    // Racing Bulls
    TSU: '#6692ff', HAD: '#6692ff',
    // Williams
    ALB: '#005aff', SAI: '#005aff',
    // Haas
    BEA: '#b6babd', OCO: '#b6babd',
    // Kick Sauber
    HUL: '#c92d4b', BOR: '#c92d4b',
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
  'alfa romeo': '#c92d4b', 'sauber': '#c92d4b', 'kick sauber': '#c92d4b', 'audi': '#c92d4b',
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

export const DRIVER_TEAMS_BY_YEAR = {
  '2026': {
    VER: 'Red Bull', HAD: 'Red Bull',
    LEC: 'Ferrari', HAM: 'Ferrari',
    NOR: 'McLaren', PIA: 'McLaren',
    RUS: 'Mercedes', ANT: 'Mercedes',
    ALO: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'Alpine', COL: 'Alpine',
    LAW: 'Racing Bulls', LIN: 'Racing Bulls',
    ALB: 'Williams', SAI: 'Williams',
    OCO: 'Haas', BEA: 'Haas',
    HUL: 'Audi', BOR: 'Audi',
    PER: 'Cadillac', BOT: 'Cadillac',
  },
  '2025': {
    VER: 'Red Bull', LAW: 'Red Bull',
    LEC: 'Ferrari', HAM: 'Ferrari',
    NOR: 'McLaren', PIA: 'McLaren',
    RUS: 'Mercedes', ANT: 'Mercedes',
    ALO: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'Alpine', DOO: 'Alpine', COL: 'Alpine',
    TSU: 'Racing Bulls', HAD: 'Racing Bulls',
    ALB: 'Williams', SAI: 'Williams',
    BEA: 'Haas', OCO: 'Haas',
    HUL: 'Kick Sauber', BOR: 'Kick Sauber',
  },
  '2024': {
    VER: 'Red Bull', PER: 'Red Bull',
    LEC: 'Ferrari', SAI: 'Ferrari',
    NOR: 'McLaren', PIA: 'McLaren',
    HAM: 'Mercedes', RUS: 'Mercedes',
    ALO: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'Alpine', OCO: 'Alpine',
    TSU: 'RB', RIC: 'RB',
    ALB: 'Williams', SAR: 'Williams',
    MAG: 'Haas', HUL: 'Haas',
    ZHO: 'Kick Sauber', BOT: 'Kick Sauber',
  },
  '2023': {
    VER: 'Red Bull', PER: 'Red Bull',
    LEC: 'Ferrari', SAI: 'Ferrari',
    NOR: 'McLaren', PIA: 'McLaren',
    HAM: 'Mercedes', RUS: 'Mercedes',
    ALO: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'Alpine', OCO: 'Alpine',
    TSU: 'AlphaTauri', DEV: 'AlphaTauri',
    ALB: 'Williams', SAR: 'Williams',
    MAG: 'Haas', HUL: 'Haas',
    ZHO: 'Alfa Romeo', BOT: 'Alfa Romeo',
  },
  '2022': {
    VER: 'Red Bull', PER: 'Red Bull',
    LEC: 'Ferrari', SAI: 'Ferrari',
    NOR: 'McLaren', RIC: 'McLaren',
    HAM: 'Mercedes', RUS: 'Mercedes',
    ALO: 'Alpine', OCO: 'Alpine',
    VET: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'AlphaTauri', TSU: 'AlphaTauri',
    ALB: 'Williams', LAT: 'Williams',
    MAG: 'Haas', MSC: 'Haas',
    ZHO: 'Alfa Romeo', BOT: 'Alfa Romeo',
  },
}