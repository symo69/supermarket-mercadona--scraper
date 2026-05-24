import { appendFile, stat, writeFile } from 'node:fs/promises';

export interface Product {
  titulo: string;
  imagen: string;
  precio: string;
  categoria: string;
}

const csvHeaders: Array<keyof Product> = ['titulo', 'imagen', 'precio', 'categoria'];

export function validatePostalCode(postalCode: string): string {
  const value = postalCode.trim();
  if (!/^\d{5}$/.test(value)) {
    throw new Error('El código postal debe tener 5 dígitos.');
  }
  return value;
}

function sanitizeForCsvFormulaInjection(value: string): string {
  const trimmed = value.trim();
  return /^[=+\-@]/.test(trimmed) ? `'${trimmed}` : trimmed;
}

function escapeCsv(value: string): string {
  const sanitized = sanitizeForCsvFormulaInjection(value).replace(/\r?\n|\r/g, ' ');
  return `"${sanitized.replace(/"/g, '""')}"`;
}

function toCsvLine(product: Product): string {
  return csvHeaders.map((header) => escapeCsv(product[header])).join(',');
}

export async function writeProductsCsv(products: Product[], filename: string): Promise<void> {
  if (products.length === 0) {
    console.log('No hay datos para guardar.');
    return;
  }

  let exists = true;
  try {
    await stat(filename);
  } catch {
    exists = false;
  }

  const lines = products.map(toCsvLine).join('\n') + '\n';

  if (!exists) {
    await writeFile(filename, `${csvHeaders.join(',')}\n${lines}`, { encoding: 'utf-8' });
    return;
  }

  await appendFile(filename, lines, { encoding: 'utf-8' });
}

export async function delayRandom(minMs: number, maxMs: number): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizePrice(rawPrice: string): string {
  return rawPrice.replace(/\./g, '').replace(',', '.').replace('€', '').trim();
}
