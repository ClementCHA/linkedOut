import { randomUUID } from 'node:crypto'

// Helper functions for entity IDs
export const generateUUID = (): string => randomUUID()

export const entityIdEquals = (a: string, b: string): boolean => a === b
