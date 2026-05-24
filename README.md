# Supermarket Mercadona Scraper (TypeScript v2)

![Mercadona Cover](LogoMercadona.png)

Scraper funcional en **TypeScript** para extraer productos, precio, imagen y categoría desde Mercadona.

## Estado de seguridad (v2)

Se revisó el repositorio y no se encontraron backdoors explícitas (sin `eval`, `exec`, ni shell injection).

Mejoras aplicadas en v2:
- Eliminación de código legado Python y dependencia `keyboard`.
- Validación estricta del código postal (`5 dígitos`).
- Hardening del CSV contra **formula injection** (`=`, `+`, `-`, `@`).
- Dependencias npm auditadas sin vulnerabilidades conocidas al momento del release.

## Requisitos

- Node.js 20+

## Instalación

```bash
npm install
npx playwright install chromium
```

## Uso

```bash
npm run start
```

o indicando código postal:

```bash
npm run start -- 28001
```

Salida:
- `mercadona_YYYY-MM-DD.csv`

## Scripts

- `npm run check` → Type-check
- `npm run build` → Compila a `dist/`
- `npm run start` → Ejecuta scraper con `tsx`
- `npm run release:v2` → Build de release

## Estructura

```text
src/
  helpers.ts
  scraper.ts
```

## Aviso legal

Uso educativo/investigación. Respeta términos de servicio y límites de carga del sitio objetivo.
