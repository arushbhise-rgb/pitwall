import { useState } from 'react'
import axios from 'axios'

const API = 'https://pitwall-production-c292.up.railway.app'

const DRIVER_COLORS_BY_YEAR = {
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

const DRIVER_TEAMS_BY_YEAR = {
  '2026': {
    VER: 'Red Bull', HAD: 'Red Bull',
    LEC: 'Ferrari', HAM: 'Ferrari', BEA: 'Ferrari',
    NOR: 'McLaren', PIA: 'McLaren', DOO: 'McLaren',
    RUS: 'Mercedes', ANT: 'Mercedes',
    ALO: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'Alpine', COL: 'Alpine',
    TSU: 'RB', LAW: 'RB',
    ALB: 'Williams', SAI: 'Williams',
    OCO: 'Haas', MAG: 'Haas',
    HUL: 'Sauber', BOR: 'Sauber',
    PER: 'Cadillac', BOT: 'Cadillac',
  },
  '2025': {
    VER: 'Red Bull', LAW: 'Red Bull',
    LEC: 'Ferrari', HAM: 'Ferrari',
    NOR: 'McLaren', PIA: 'McLaren',
    RUS: 'Mercedes', ANT: 'Mercedes',
    ALO: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'Alpine', DOO: 'Alpine',
    TSU: 'RB', HAD: 'RB',
    ALB: 'Williams', SAI: 'Williams',
    MAG: 'Haas', BEA: 'Haas', OCO: 'Haas',
    HUL: 'Sauber', BOR: 'Sauber',
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
    ZHO: 'Sauber', BOT: 'Sauber',
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
  '2021': {
    VER: 'Red Bull', PER: 'Red Bull',
    HAM: 'Mercedes', BOT: 'Mercedes',
    LEC: 'Ferrari', SAI: 'Ferrari',
    NOR: 'McLaren', RIC: 'McLaren',
    VET: 'Aston Martin', STR: 'Aston Martin',
    GAS: 'Alpine', ALO: 'Alpine',
    TSU: 'AlphaTauri', HAR: 'AlphaTauri',
    RAI: 'Alfa Romeo', GIO: 'Alfa Romeo',
    RUS: 'Williams', LAT: 'Williams',
    MAZ: 'Haas', SCH: 'Haas',
  },
  '2020': {
    HAM: 'Mercedes', BOT: 'Mercedes',
    VER: 'Red Bull', ALB: 'Red Bull',
    LEC: 'Ferrari', VET: 'Ferrari',
    NOR: 'McLaren', SAI: 'McLaren',
    PER: 'Racing Point', STR: 'Racing Point',
    OCO: 'Renault', RIC: 'Renault',
    GAS: 'AlphaTauri', KVY: 'AlphaTauri',
    GRO: 'Haas', MAG: 'Haas',
    RAI: 'Alfa Romeo', GIO: 'Alfa Romeo',
    RUS: 'Williams', LAT: 'Williams',
  },
}

const ALL_DRIVERS_BY_YEAR = {
  '2026': [
    { code: 'VER', name: 'Max Verstappen', number: 1, initials: 'MV' },
    { code: 'HAM', name: 'Lewis Hamilton', number: 44, initials: 'LH' },
    { code: 'LEC', name: 'Charles Leclerc', number: 16, initials: 'CL' },
    { code: 'NOR', name: 'Lando Norris', number: 4, initials: 'LN' },
    { code: 'PIA', name: 'Oscar Piastri', number: 81, initials: 'OP' },
    { code: 'RUS', name: 'George Russell', number: 63, initials: 'GR' },
    { code: 'ANT', name: 'Kimi Antonelli', number: 12, initials: 'KA' },
    { code: 'SAI', name: 'Carlos Sainz', number: 55, initials: 'CS' },
    { code: 'ALO', name: 'Fernando Alonso', number: 14, initials: 'FA' },
    { code: 'STR', name: 'Lance Stroll', number: 18, initials: 'LS' },
    { code: 'HAD', name: 'Isack Hadjar', number: 6, initials: 'IH' },
    { code: 'LAW', name: 'Liam Lawson', number: 30, initials: 'LL' },
    { code: 'TSU', name: 'Yuki Tsunoda', number: 22, initials: 'YT' },
    { code: 'ALB', name: 'Alexander Albon', number: 23, initials: 'AA' },
    { code: 'COL', name: 'Franco Colapinto', number: 43, initials: 'FC' },
    { code: 'GAS', name: 'Pierre Gasly', number: 10, initials: 'PG' },
    { code: 'OCO', name: 'Esteban Ocon', number: 31, initials: 'EO' },
    { code: 'MAG', name: 'Kevin Magnussen', number: 20, initials: 'KM' },
    { code: 'HUL', name: 'Nico Hulkenberg', number: 27, initials: 'NH' },
    { code: 'BOR', name: 'Gabriel Bortoleto', number: 5, initials: 'GB' },
    { code: 'BEA', name: 'Oliver Bearman', number: 87, initials: 'OB' },
    { code: 'DOO', name: 'Jack Doohan', number: 7, initials: 'JD' },
    { code: 'PER', name: 'Sergio Perez', number: 11, initials: 'SP' },
    { code: 'BOT', name: 'Valtteri Bottas', number: 77, initials: 'VB' },
  ],
  '2025': [
    { code: 'VER', name: 'Max Verstappen', number: 1, initials: 'MV' },
    { code: 'HAM', name: 'Lewis Hamilton', number: 44, initials: 'LH' },
    { code: 'LEC', name: 'Charles Leclerc', number: 16, initials: 'CL' },
    { code: 'NOR', name: 'Lando Norris', number: 4, initials: 'LN' },
    { code: 'PIA', name: 'Oscar Piastri', number: 81, initials: 'OP' },
    { code: 'RUS', name: 'George Russell', number: 63, initials: 'GR' },
    { code: 'ANT', name: 'Kimi Antonelli', number: 12, initials: 'KA' },
    { code: 'SAI', name: 'Carlos Sainz', number: 55, initials: 'CS' },
    { code: 'ALO', name: 'Fernando Alonso', number: 14, initials: 'FA' },
    { code: 'STR', name: 'Lance Stroll', number: 18, initials: 'LS' },
    { code: 'LAW', name: 'Liam Lawson', number: 30, initials: 'LL' },
    { code: 'HAD', name: 'Isack Hadjar', number: 6, initials: 'IH' },
    { code: 'TSU', name: 'Yuki Tsunoda', number: 22, initials: 'YT' },
    { code: 'ALB', name: 'Alexander Albon', number: 23, initials: 'AA' },
    { code: 'GAS', name: 'Pierre Gasly', number: 10, initials: 'PG' },
    { code: 'DOO', name: 'Jack Doohan', number: 7, initials: 'JD' },
    { code: 'MAG', name: 'Kevin Magnussen', number: 20, initials: 'KM' },
    { code: 'BEA', name: 'Oliver Bearman', number: 87, initials: 'OB' },
    { code: 'HUL', name: 'Nico Hulkenberg', number: 27, initials: 'NH' },
    { code: 'BOR', name: 'Gabriel Bortoleto', number: 5, initials: 'GB' },
  ],
  '2024': [
    { code: 'VER', name: 'Max Verstappen', number: 1, initials: 'MV' },
    { code: 'PER', name: 'Sergio Perez', number: 11, initials: 'SP' },
    { code: 'LEC', name: 'Charles Leclerc', number: 16, initials: 'CL' },
    { code: 'SAI', name: 'Carlos Sainz', number: 55, initials: 'CS' },
    { code: 'NOR', name: 'Lando Norris', number: 4, initials: 'LN' },
    { code: 'PIA', name: 'Oscar Piastri', number: 81, initials: 'OP' },
    { code: 'HAM', name: 'Lewis Hamilton', number: 44, initials: 'LH' },
    { code: 'RUS', name: 'George Russell', number: 63, initials: 'GR' },
    { code: 'ALO', name: 'Fernando Alonso', number: 14, initials: 'FA' },
    { code: 'STR', name: 'Lance Stroll', number: 18, initials: 'LS' },
    { code: 'GAS', name: 'Pierre Gasly', number: 10, initials: 'PG' },
    { code: 'OCO', name: 'Esteban Ocon', number: 31, initials: 'EO' },
    { code: 'TSU', name: 'Yuki Tsunoda', number: 22, initials: 'YT' },
    { code: 'RIC', name: 'Daniel Ricciardo', number: 3, initials: 'DR' },
    { code: 'ALB', name: 'Alexander Albon', number: 23, initials: 'AA' },
    { code: 'SAR', name: 'Logan Sargeant', number: 2, initials: 'LS' },
    { code: 'MAG', name: 'Kevin Magnussen', number: 20, initials: 'KM' },
    { code: 'HUL', name: 'Nico Hulkenberg', number: 27, initials: 'NH' },
    { code: 'ZHO', name: 'Guanyu Zhou', number: 24, initials: 'GZ' },
    { code: 'BOT', name: 'Valtteri Bottas', number: 77, initials: 'VB' },
  ],
  '2023': [
    { code: 'VER', name: 'Max Verstappen', number: 1, initials: 'MV' },
    { code: 'PER', name: 'Sergio Perez', number: 11, initials: 'SP' },
    { code: 'LEC', name: 'Charles Leclerc', number: 16, initials: 'CL' },
    { code: 'SAI', name: 'Carlos Sainz', number: 55, initials: 'CS' },
    { code: 'NOR', name: 'Lando Norris', number: 4, initials: 'LN' },
    { code: 'PIA', name: 'Oscar Piastri', number: 81, initials: 'OP' },
    { code: 'HAM', name: 'Lewis Hamilton', number: 44, initials: 'LH' },
    { code: 'RUS', name: 'George Russell', number: 63, initials: 'GR' },
    { code: 'ALO', name: 'Fernando Alonso', number: 14, initials: 'FA' },
    { code: 'STR', name: 'Lance Stroll', number: 18, initials: 'LS' },
    { code: 'GAS', name: 'Pierre Gasly', number: 10, initials: 'PG' },
    { code: 'OCO', name: 'Esteban Ocon', number: 31, initials: 'EO' },
    { code: 'TSU', name: 'Yuki Tsunoda', number: 22, initials: 'YT' },
    { code: 'DEV', name: 'Nyck de Vries', number: 21, initials: 'NV' },
    { code: 'ALB', name: 'Alexander Albon', number: 23, initials: 'AA' },
    { code: 'SAR', name: 'Logan Sargeant', number: 2, initials: 'LS' },
    { code: 'MAG', name: 'Kevin Magnussen', number: 20, initials: 'KM' },
    { code: 'HUL', name: 'Nico Hulkenberg', number: 27, initials: 'NH' },
    { code: 'ZHO', name: 'Guanyu Zhou', number: 24, initials: 'GZ' },
    { code: 'BOT', name: 'Valtteri Bottas', number: 77, initials: 'VB' },
  ],
  '2022': [
    { code: 'VER', name: 'Max Verstappen', number: 1, initials: 'MV' },
    { code: 'PER', name: 'Sergio Perez', number: 11, initials: 'SP' },
    { code: 'LEC', name: 'Charles Leclerc', number: 16, initials: 'CL' },
    { code: 'SAI', name: 'Carlos Sainz', number: 55, initials: 'CS' },
    { code: 'NOR', name: 'Lando Norris', number: 4, initials: 'LN' },
    { code: 'RIC', name: 'Daniel Ricciardo', number: 3, initials: 'DR' },
    { code: 'HAM', name: 'Lewis Hamilton', number: 44, initials: 'LH' },
    { code: 'RUS', name: 'George Russell', number: 63, initials: 'GR' },
    { code: 'ALO', name: 'Fernando Alonso', number: 14, initials: 'FA' },
    { code: 'OCO', name: 'Esteban Ocon', number: 31, initials: 'EO' },
    { code: 'VET', name: 'Sebastian Vettel', number: 5, initials: 'SV' },
    { code: 'STR', name: 'Lance Stroll', number: 18, initials: 'LS' },
    { code: 'GAS', name: 'Pierre Gasly', number: 10, initials: 'PG' },
    { code: 'TSU', name: 'Yuki Tsunoda', number: 22, initials: 'YT' },
    { code: 'ALB', name: 'Alexander Albon', number: 23, initials: 'AA' },
    { code: 'LAT', name: 'Nicholas Latifi', number: 6, initials: 'NL' },
    { code: 'MAG', name: 'Kevin Magnussen', number: 20, initials: 'KM' },
    { code: 'MSC', name: 'Mick Schumacher', number: 47, initials: 'MS' },
    { code: 'ZHO', name: 'Guanyu Zhou', number: 24, initials: 'GZ' },
    { code: 'BOT', name: 'Valtteri Bottas', number: 77, initials: 'VB' },
  ],
  '2021': [
    { code: 'VER', name: 'Max Verstappen', number: 33, initials: 'MV' },
    { code: 'HAM', name: 'Lewis Hamilton', number: 44, initials: 'LH' },
    { code: 'PER', name: 'Sergio Perez', number: 11, initials: 'SP' },
    { code: 'BOT', name: 'Valtteri Bottas', number: 77, initials: 'VB' },
    { code: 'LEC', name: 'Charles Leclerc', number: 16, initials: 'CL' },
    { code: 'SAI', name: 'Carlos Sainz', number: 55, initials: 'CS' },
    { code: 'NOR', name: 'Lando Norris', number: 4, initials: 'LN' },
    { code: 'RIC', name: 'Daniel Ricciardo', number: 3, initials: 'DR' },
    { code: 'VET', name: 'Sebastian Vettel', number: 5, initials: 'SV' },
    { code: 'STR', name: 'Lance Stroll', number: 18, initials: 'LS' },
    { code: 'ALO', name: 'Fernando Alonso', number: 14, initials: 'FA' },
    { code: 'GAS', name: 'Pierre Gasly', number: 10, initials: 'PG' },
    { code: 'TSU', name: 'Yuki Tsunoda', number: 22, initials: 'YT' },
    { code: 'RUS', name: 'George Russell', number: 63, initials: 'GR' },
    { code: 'RAI', name: 'Kimi Raikkonen', number: 7, initials: 'KR' },
    { code: 'LAT', name: 'Nicholas Latifi', number: 6, initials: 'NL' },
    { code: 'MAZ', name: 'Nikita Mazepin', number: 9, initials: 'NM' },
    { code: 'SCH', name: 'Mick Schumacher', number: 47, initials: 'MS' },
  ],
  '2020': [
    { code: 'HAM', name: 'Lewis Hamilton', number: 44, initials: 'LH' },
    { code: 'BOT', name: 'Valtteri Bottas', number: 77, initials: 'VB' },
    { code: 'VER', name: 'Max Verstappen', number: 33, initials: 'MV' },
    { code: 'ALB', name: 'Alexander Albon', number: 23, initials: 'AA' },
    { code: 'LEC', name: 'Charles Leclerc', number: 16, initials: 'CL' },
    { code: 'VET', name: 'Sebastian Vettel', number: 5, initials: 'SV' },
    { code: 'NOR', name: 'Lando Norris', number: 4, initials: 'LN' },
    { code: 'SAI', name: 'Carlos Sainz', number: 55, initials: 'CS' },
    { code: 'PER', name: 'Sergio Perez', number: 11, initials: 'SP' },
    { code: 'STR', name: 'Lance Stroll', number: 18, initials: 'LS' },
    { code: 'RIC', name: 'Daniel Ricciardo', number: 3, initials: 'DR' },
    { code: 'OCO', name: 'Esteban Ocon', number: 31, initials: 'EO' },
    { code: 'GAS', name: 'Pierre Gasly', number: 10, initials: 'PG' },
    { code: 'KVY', name: 'Daniil Kvyat', number: 26, initials: 'DK' },
    { code: 'GRO', name: 'Romain Grosjean', number: 8, initials: 'RG' },
    { code: 'MAG', name: 'Kevin Magnussen', number: 20, initials: 'KM' },
    { code: 'RAI', name: 'Kimi Raikkonen', number: 7, initials: 'KR' },
    { code: 'GIO', name: 'Antonio Giovinazzi', number: 99, initials: 'AG' },
    { code: 'RUS', name: 'George Russell', number: 63, initials: 'GR' },
    { code: 'LAT', name: 'Nicholas Latifi', number: 6, initials: 'NL' },
  ],
}

function getDriverColor(code, year) {
  const colors = DRIVER_COLORS_BY_YEAR[String(year)] || DRIVER_COLORS_BY_YEAR['2024']
  return colors[code] || '#888'
}

function getDriverTeam(code, year) {
  const teams = DRIVER_TEAMS_BY_YEAR[String(year)] || DRIVER_TEAMS_BY_YEAR['2024']
  return teams[code] || 'Unknown'
}

function getDriversForYear(year) {
  return ALL_DRIVERS_BY_YEAR[String(year)] || ALL_DRIVERS_BY_YEAR['2024']
}

export default function HeadToHead() {
  const [year, setYear] = useState('2024')
  const [d1Code, setD1Code] = useState('VER')
  const [d2Code, setD2Code] = useState('LEC')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const drivers = getDriversForYear(year)
  const d1 = drivers.find(d => d.code === d1Code) || drivers[0]
  const d2 = drivers.find(d => d.code === d2Code) || drivers[1]
  const d1Color = getDriverColor(d1Code, year)
  const d2Color = getDriverColor(d2Code, year)
  const d1Team = getDriverTeam(d1Code, year)
  const d2Team = getDriverTeam(d2Code, year)

  async function compare(overrideD1, overrideD2, overrideYear) {
    const finalD1 = overrideD1 || d1Code
    const finalD2 = overrideD2 || d2Code
    const finalYear = overrideYear || year
    if (finalD1 === finalD2) { alert('Pick two different drivers'); return }
    setLoading(true)
    setData(null)
    try {
      const r = await axios.get(`${API}/h2h?year=${finalYear}&driver1=${finalD1}&driver2=${finalD2}`)
      setData(r.data)
    } catch(e) { alert('Error loading H2H data') }
    setLoading(false)
  }

  function handleYearChange(newYear) {
    setYear(newYear)
    setData(null)
    const newDrivers = getDriversForYear(newYear)
    if (!newDrivers.find(d => d.code === d1Code)) setD1Code(newDrivers[0].code)
    if (!newDrivers.find(d => d.code === d2Code)) setD2Code(newDrivers[1].code)
  }

  async function handleMatchupClick(m) {
    handleYearChange(m.year)
    setD1Code(m.d1)
    setD2Code(m.d2)
    setData(null)
    await compare(m.d1, m.d2, m.year)
  }

  const cardStyle = { background: '#111', border: '0.5px solid #1e1e1e', borderRadius: '12px', padding: '18px', marginBottom: '12px' }

  return (
    <div style={{ padding: '20px 16px', maxWidth: '900px', margin: '0 auto', minHeight: 'calc(100vh - 52px)', background: '#0a0a0a' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progressBar { from { width: 0%; } to { width: 90%; } }
        .matchup-row { transition: all .2s; }
        .matchup-row:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(225,6,0,0.2) !important; }
      `}</style>

      <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.5px' }}>Head to Head</div>
      <div style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>Real F1 data — compare any two drivers across a full season</div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={year} onChange={e => handleYearChange(e.target.value)} style={{
          background: '#1a1a1a', border: '0.5px solid #333',
          borderRadius: '7px', color: '#fff', padding: '8px 12px', fontSize: '13px'
        }}>
          {['2026','2025','2024','2023','2022','2021','2020'].map(y => <option key={y}>{y}</option>)}
        </select>
        <div style={{ fontSize: '12px', color: '#555' }}>season</div>
      </div>

      <div className="h2h-selector" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '14px', alignItems: 'stretch', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Driver 1</div>
          <select value={d1Code} onChange={e => { setD1Code(e.target.value); setData(null) }} style={{
            width: '100%', background: '#1a1a1a', border: '0.5px solid #333',
            borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px', marginBottom: '14px'
          }}>
            {drivers.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: d1Color + '22', border: `2px solid ${d1Color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: d1Color, flexShrink: 0 }}>{d1.initials}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d1.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{d1Team}</div>
              <div style={{ fontSize: '11px', color: d1Color, marginTop: '2px' }}>#{d1.number}</div>
            </div>
          </div>
        </div>

        <div className="h2h-vs-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#e10600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', boxShadow: '0 0 16px rgba(225,6,0,0.3)' }}>VS</div>
          <button onClick={() => compare()} disabled={loading} style={{
            background: '#e10600', color: '#fff', border: 'none',
            padding: '8px 16px', borderRadius: '8px', fontSize: '12px',
            fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
            opacity: loading ? .6 : 1, boxShadow: '0 0 12px rgba(225,6,0,0.2)'
          }}>{loading ? 'Loading...' : 'Compare'}</button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Driver 2</div>
          <select value={d2Code} onChange={e => { setD2Code(e.target.value); setData(null) }} style={{
            width: '100%', background: '#1a1a1a', border: '0.5px solid #333',
            borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px', marginBottom: '14px'
          }}>
            {drivers.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: d2Color + '22', border: `2px solid ${d2Color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: d2Color, flexShrink: 0 }}>{d2.initials}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d2.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{d2Team}</div>
              <div style={{ fontSize: '11px', color: d2Color, marginTop: '2px' }}>#{d2.number}</div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 40px' }}>
          <div style={{ width: '36px', height: '36px', border: '2.5px solid #1e1e1e', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginBottom: '6px' }}>Comparing drivers</div>
          <div style={{ fontSize: '12px', color: '#444', marginBottom: '20px' }}>Fetching full season race by race data</div>
          <div style={{ width: '220px', height: '3px', background: '#1a1a1a', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#e10600', borderRadius: '2px', animation: 'progressBar 12s linear forwards' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: '#333', marginTop: '10px' }}>Cached comparisons load instantly on repeat</div>
        </div>
      )}

      {!loading && !data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ ...cardStyle, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '300px', height: '200px', background: 'radial-gradient(ellipse, rgba(225,6,0,0.05), transparent 70%)', pointerEvents: 'none' }}/>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚔️</div>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Pick your drivers</div>
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7', maxWidth: '340px', margin: '0 auto' }}>
              Select any two drivers and hit <span style={{ color: '#e10600', fontWeight: '600' }}>Compare</span> — or click a matchup below to load instantly
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '4px' }}>Classic matchups — click to load</div>
          {[
            { d1: 'VER', d2: 'NOR', year: '2024', label: 'Verstappen vs Norris — 2024 Title Fight' },
            { d1: 'LEC', d2: 'SAI', year: '2024', label: 'Leclerc vs Sainz — Ferrari Teammates 2024' },
            { d1: 'HAM', d2: 'LEC', year: '2025', label: 'Hamilton vs Leclerc — Ferrari Teammates 2025' },
            { d1: 'HAM', d2: 'RUS', year: '2023', label: 'Hamilton vs Russell — Mercedes 2023' },
            { d1: 'VER', d2: 'LEC', year: '2022', label: 'Verstappen vs Leclerc — Epic 2022 Battle' },
            { d1: 'HAM', d2: 'VER', year: '2021', label: 'Hamilton vs Verstappen — 2021 Title Decider' },
          ].map((m, i) => (
            <div key={i} className="matchup-row" onClick={() => handleMatchupClick(m)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', background: '#111', border: '0.5px solid #1e1e1e',
              borderRadius: '9px', cursor: 'pointer',
              animation: `fadeUp .3s ease ${i * 0.05}s both`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getDriverColor(m.d1, m.year) }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getDriverColor(m.d2, m.year) }}></div>
                </div>
                <div style={{ fontSize: '13px', color: '#aaa', fontWeight: '500' }}>{m.label}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#e10600', background: 'rgba(225,6,0,0.08)', padding: '3px 8px', borderRadius: '6px', flexShrink: 0 }}>Load →</div>
            </div>
          ))}
        </div>
      )}

      {data && !data.error && (
        <>
          <div style={cardStyle}>
            <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '16px' }}>Season battle — {year}</div>
            {[
              { label: 'Championship points', v1: data.stats[d1Code]?.points || 0, v2: data.stats[d2Code]?.points || 0, higher: true, fmt: v => Math.round(v) },
              { label: 'Race wins', v1: data.stats[d1Code]?.wins || 0, v2: data.stats[d2Code]?.wins || 0, higher: true },
              { label: 'Podiums', v1: data.stats[d1Code]?.podiums || 0, v2: data.stats[d2Code]?.podiums || 0, higher: true },
              { label: 'Pole positions', v1: data.stats[d1Code]?.poles || 0, v2: data.stats[d2Code]?.poles || 0, higher: true },
              { label: 'Avg finish', v1: data.stats[d1Code]?.avgFinish || 0, v2: data.stats[d2Code]?.avgFinish || 0, higher: false, fmt: v => `P${v}` },
              { label: 'DNFs', v1: data.stats[d1Code]?.dnfs || 0, v2: data.stats[d2Code]?.dnfs || 0, higher: false },
              { label: 'H2H race wins', v1: data.h2h_wins?.[d1Code] || 0, v2: data.h2h_wins?.[d2Code] || 0, higher: true },
            ].map((stat, i) => {
              const w = stat.higher
                ? (stat.v1 > stat.v2 ? 'left' : stat.v1 < stat.v2 ? 'right' : 'tie')
                : (stat.v1 < stat.v2 ? 'left' : stat.v1 > stat.v2 ? 'right' : 'tie')
              const total = stat.v1 + stat.v2 || 1
              const pct1 = stat.higher ? (stat.v1 / total * 100).toFixed(0) : ((1 - stat.v1 / total) * 100).toFixed(0)
              const fmt = stat.fmt || (v => v)
              return (
                <div key={i} className="h2h-stat-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: w === 'left' ? d1Color : '#555' }}>{fmt(stat.v1)}</div>
                    <div style={{ width: '100%', height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden', direction: 'rtl' }}>
                      <div style={{ width: `${pct1}%`, height: '100%', background: d1Color, borderRadius: '2px', transition: 'width .6s ease' }}></div>
                    </div>
                  </div>
                  <div className="h2h-stat-label" style={{ fontSize: '10px', color: '#444', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '100px' }}>{stat.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: w === 'right' ? d2Color : '#555' }}>{fmt(stat.v2)}</div>
                    <div style={{ width: '100%', height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${100 - pct1}%`, height: '100%', background: d2Color, borderRadius: '2px', transition: 'width .6s ease' }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {data.race_names && (
            <div style={cardStyle}>
              <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '14px' }}>Race by race — {year}</div>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '80px', overflowX: 'auto' }}>
                {data.race_names.map((race, i) => {
                  const r1 = data.results?.[d1Code]?.[i] || 20
                  const r2 = data.results?.[d2Code]?.[i] || 20
                  const d1won = r1 < r2
                  return (
                    <div key={i} style={{ flex: '0 0 auto', width: '28px', display: 'flex', flexDirection: 'column', gap: '1px', cursor: 'default' }}
                      title={`${race}: ${d1Code} P${r1} vs ${d2Code} P${r2}`}>
                      <div style={{ width: '100%', height: `${(1 - r1/20) * 34 + 4}px`, background: d1Color, borderRadius: '2px 2px 0 0', opacity: d1won ? 1 : 0.3 }}></div>
                      <div style={{ width: '100%', height: `${(1 - r2/20) * 34 + 4}px`, background: d2Color, borderRadius: '0 0 2px 2px', opacity: !d1won ? 1 : 0.3 }}></div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#666' }}>
                  <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: d1Color }}></div>
                  {d1.name.split(' ')[1]} ({data.h2h_wins?.[d1Code] || 0} wins)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#666' }}>
                  <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: d2Color }}></div>
                  {d2.name.split(' ')[1]} ({data.h2h_wins?.[d2Code] || 0} wins)
                </div>
              </div>
            </div>
          )}

          {data.h2h_wins && (
            <div style={{
              background: '#0a0a0a',
              border: `0.5px solid ${(data.h2h_wins[d1Code] || 0) >= (data.h2h_wins[d2Code] || 0) ? d1Color : d2Color}`,
              borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '12px'
            }}>
              {(() => {
                const w1 = data.h2h_wins[d1Code] || 0
                const w2 = data.h2h_wins[d2Code] || 0
                const winnerCode = w1 >= w2 ? d1Code : d2Code
                const winner = winnerCode === d1Code ? d1 : d2
                const winnerColor = winnerCode === d1Code ? d1Color : d2Color
                const loser = winnerCode === d1Code ? d2 : d1
                const ptsDiff = Math.abs((data.stats[d1Code]?.points || 0) - (data.stats[d2Code]?.points || 0))
                return (
                  <>
                    <div style={{ fontSize: '10px', color: winnerColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '8px' }}>{year} head to head winner</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: winnerColor, marginBottom: '4px' }}>{winner.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '14px 0' }}>
                      <div style={{ fontSize: '34px', fontWeight: '800', color: d1Color }}>{w1}</div>
                      <div style={{ fontSize: '20px', color: '#333' }}>—</div>
                      <div style={{ fontSize: '34px', fontWeight: '800', color: d2Color }}>{w2}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                      {winner.name} won <strong style={{ color: winnerColor }}>{Math.max(w1, w2)} of {data.race_names?.length || 0} head to head battles</strong> and outscored {loser.name} by <strong style={{ color: winnerColor }}>{ptsDiff.toFixed(0)} points</strong> in {year}
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </>
      )}

      {data && data.error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#555', fontSize: '13px' }}>
          Failed to load data — try again
        </div>
      )}
    </div>
  )
}