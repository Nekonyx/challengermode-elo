import {
  Source_Code_Pro as Font_Mono,
  Exo_2 as Font_Sans
} from 'next/font/google'

export const fontSans = Font_Sans({
  variable: '--next-font-sans',
  subsets: ['cyrillic']
})

export const fontMono = Font_Mono({
  variable: '--next-font-mono',
  subsets: ['cyrillic']
})
