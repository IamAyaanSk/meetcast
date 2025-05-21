import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGridClass = (count: number) => {
  if (count === 0) return 'grid-cols-1 grid-rows-1'
  if (count < 3) return 'grid-cols-2 grid-rows-1'
  if (count < 5) return 'grid-cols-2 grid-rows-2'
  return 'grid-cols-3 grid-rows-3'
}
