export interface Palette {
  id: string
  accent: string
  /** Darker variant that keeps contrast on the light theme. */
  accentLight: string
  name: { en: string; es: string }
}

export const PALETTES: Palette[] = [
  { id: 'fire', accent: '#FF5A1F', accentLight: '#D84300', name: { en: 'FIRE', es: 'FUEGO' } },
  { id: 'red', accent: '#FF3B4E', accentLight: '#D41F33', name: { en: 'RED', es: 'ROJO' } },
  { id: 'rose', accent: '#FF6FA8', accentLight: '#D43A7C', name: { en: 'ROSE', es: 'ROSA' } },
  { id: 'violet', accent: '#A78BFA', accentLight: '#7C5AE0', name: { en: 'VIOLET', es: 'VIOLETA' } },
  { id: 'sky', accent: '#4DA3FF', accentLight: '#1F6FD1', name: { en: 'SKY', es: 'CIELO' } },
  { id: 'ice', accent: '#3DD6E8', accentLight: '#0E8FA3', name: { en: 'ICE', es: 'HIELO' } },
  { id: 'mint', accent: '#3DDC97', accentLight: '#0F9A62', name: { en: 'MINT', es: 'MENTA' } },
  { id: 'lime', accent: '#B8F03A', accentLight: '#6E9A00', name: { en: 'LIME', es: 'LIMA' } },
  { id: 'amber', accent: '#FFB400', accentLight: '#B87D00', name: { en: 'AMBER', es: 'ÁMBAR' } },
]

export const paletteOf = (accent: string): Palette =>
  PALETTES.find((p) => p.accent.toLowerCase() === accent.toLowerCase()) ?? PALETTES[0]!
