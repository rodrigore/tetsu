export type Lang = 'es' | 'en'

const en = {
  loadPerSide: 'LOAD PER SIDE',
  target: 'TARGET',
  onBar: 'ON THE BAR',
  offBy: 'OFF BY',
  exact: 'EXACT',
  bar: 'BAR',
  emptyBar: 'EMPTY BAR · NO PLATES',
  ofPr: 'OF PR',
  edit: 'EDIT',
  addLift: '+ LIFT',
  tapHint: 'TAP A PLATE',
  settingsAria: 'Settings',
  pctAria: 'Percentage of personal record',
  pctDownAria: 'One percent less',
  pctUpAria: 'One percent more',
  barAria: 'Bar',
  closeAria: 'Hide plate info',
  prAria: 'Personal record',
}

export type Dict = Record<keyof typeof en, string>

const es: Dict = {
  loadPerSide: 'PESO POR LADO',
  target: 'OBJETIVO',
  onBar: 'EN LA BARRA',
  offBy: 'DIFERENCIA',
  exact: 'EXACTO',
  bar: 'BARRA',
  emptyBar: 'BARRA VACÍA · SIN DISCOS',
  ofPr: 'DEL PR',
  edit: 'EDITAR',
  addLift: '+ MOVIMIENTO',
  tapHint: 'TOCA UN DISCO',
  settingsAria: 'Ajustes',
  pctAria: 'Porcentaje del récord personal',
  pctDownAria: 'Un por ciento menos',
  pctUpAria: 'Un por ciento más',
  barAria: 'Barra',
  closeAria: 'Ocultar información del disco',
  prAria: 'Récord personal',
}

export const messages = (lang: Lang): Dict => (lang === 'es' ? es : en)
