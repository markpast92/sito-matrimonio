// ponytail: saluto neutro rispetto al genere - costante unica, non duplicata
export const greetGuest = (name: string) => `Non vediamo l'ora di averti con noi, ${name}!`

export const WEDDING_DATE = '10 Settembre 2027'
export const WEDDING_TIME = '19:00'
export const WEDDING_LOCATION = 'Costa Ponente'
export const WEDDING_VENUE_URL = 'https://www.agoracatering.it/costa-ponente'
export const WEDDING_MAPS_URL = 'https://www.google.com/maps/place/Costa+Ponente+Matrimoni+ed+Eventi/@38.2118321,13.3083323,15z/data=!4m10!1m2!2m1!1sVia+Giuseppe+Pavone+91,+90151+Palermo!3m6!1s0x1319e99c85f981e9:0x4a6a693e8da463eb!8m2!3d38.2118321!4d13.3263567!15sCiVWaWEgR2l1c2VwcGUgUGF2b25lIDkxLCA5MDE1MSBQYWxlcm1vkgENd2VkZGluZ192ZW51ZeABAA!16s%2Fg%2F11fx01r8m3?hl=it-IT&entry=ttu&g_ep=EgoyMDI2MDgyNi4wIKXMDSoASAFQAw%3D%3D'

// 10 settembre 2027, ore 19:00 CEST (UTC+2) → 17:00 UTC
export const WEDDING_DATETIME_UTC = new Date(Date.UTC(2027, 8, 10, 17, 0, 0))

export type ProgramItem = { time: string; title: string; details?: string[]; note?: string }
export const PROGRAM: ProgramItem[] = [
  { time: '19:00', title: 'Inizio della cerimonia', note: 'Ci sposeremo al tramonto' },
  {
    time: '20:00',
    title: 'Aperitivo e festeggiamenti',
    details: [
      'Aperitivo di benvenuto con open bar e accompagnamento musicale',
      'A tavola: primi serviti e ricco buffet di secondi, tra un ballo e l’altro',
      'Taglio della torta e buffet di dolci',
    ],
    note: 'Vogliamo vedervi tutti ballare!',
  },
]
