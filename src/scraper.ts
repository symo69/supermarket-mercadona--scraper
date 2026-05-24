import { chromium, Page } from 'playwright';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Product, delayRandom, normalizePrice, validatePostalCode, writeProductsCsv } from './helpers.js';

async function maybeAcceptCookies(page: Page): Promise<void> {
  const acceptBtn = page.getByRole('button', { name: /aceptar/i }).first();
  if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptBtn.click();
  }
}

async function introducirCodigoPostal(page: Page, codigoPostal: string): Promise<void> {
  try {
    const inputCp = page.locator("input[data-testid='postal-code-checker-input']").first();
    await inputCp.waitFor({ state: 'visible', timeout: 5000 });
    await inputCp.fill(codigoPostal);

    const btnContinuar = page.locator("button[data-testid='postal-code-checker-button']").first();
    await btnContinuar.click();
    await page.waitForTimeout(2500);
    console.log('Código postal introducido correctamente.');
  } catch {
    console.log('No se mostró el modal del código postal o ya fue gestionado.');
  }
}

async function obtenerDatosProductos(page: Page, categoria: string): Promise<Product[]> {
  const productos: Product[] = [];
  const cards = page.locator('div.product-cell[data-testid="product-cell"]');
  const total = await cards.count();
  console.log(`Total productos encontrados: ${total}`);

  for (let i = 0; i < total; i += 1) {
    const card = cards.nth(i);

    const imagen =
      (await card.locator('img').first().getAttribute('src').catch(() => null)) ??
      'Imagen no disponible';

    const titulo =
      (await card
        .locator('h4[data-testid="product-cell-name"]')
        .first()
        .innerText()
        .catch(() => null)) ?? 'Título no disponible';

    const rawPrice =
      (await card
        .locator('p[data-testid="product-price"]')
        .first()
        .innerText()
        .catch(() => null)) ?? 'Precio no disponible';

    const precio = rawPrice === 'Precio no disponible' ? rawPrice : normalizePrice(rawPrice);

    console.log(`Producto: ${titulo}\nImagen: ${imagen}\nPrecio: ${precio}`);
    productos.push({
      titulo,
      imagen,
      precio,
      categoria
    });
  }

  return productos;
}

async function explorarCategorias(page: Page, codigoPostal: string): Promise<Product[]> {
  const listaProductos: Product[] = [];
  const categoriaSelector = '.category-menu__header';
  const totalCategorias = await page.locator(categoriaSelector).count();

  for (let i = 0; i < totalCategorias; i += 1) {
    const categoria = page.locator(categoriaSelector).nth(i);
    const nombreCategoria = ((await categoria.innerText().catch(() => `Categoría-${i + 1}`)) || `Categoría-${i + 1}`)
      .replaceAll(',', '')
      .trim();

    try {
      console.log(`\nAnalizando categoría: ${nombreCategoria}`);
      await delayRandom(900, 1600);

      await categoria.click({ timeout: 5000 }).catch(async () => {
        console.log('Reintentando click tras reintroducir CP...');
        await introducirCodigoPostal(page, codigoPostal);
        await categoria.click({ timeout: 5000 });
      });

      await delayRandom(900, 1600);

      const subcategorias = page.locator('li.category-menu__item.open ul > li.category-item');
      const totalSubcategorias = await subcategorias.count();

      for (let j = 0; j < totalSubcategorias; j += 1) {
        const subcategoria = page.locator('li.category-menu__item.open ul > li.category-item').nth(j);
        const nombreSubcategoria = (await subcategoria.innerText().catch(() => 'Subcategoría')) || 'Subcategoría';
        console.log(nombreSubcategoria);

        await delayRandom(900, 1600);
        await subcategoria.click({ timeout: 5000 }).catch(async () => {
          await introducirCodigoPostal(page, codigoPostal);
          await subcategoria.click({ timeout: 5000 });
        });

        await delayRandom(900, 1600);
        const productos = await obtenerDatosProductos(page, nombreCategoria);
        listaProductos.push(...productos);
      }
    } catch (error) {
      console.error(`Error al analizar la categoría ${nombreCategoria}:`, error);
    }
  }

  return listaProductos;
}

async function requestPostalCodeFromCli(): Promise<string> {
  const fromArg = process.argv[2];
  if (fromArg) {
    return validatePostalCode(fromArg);
  }

  const rl = createInterface({ input, output });
  try {
    const codigoPostal = await rl.question('Introduce tu código postal (ej: 28001): ');
    return validatePostalCode(codigoPostal);
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const codigoPostal = await requestPostalCodeFromCli();
  const fecha = new Date().toISOString().slice(0, 10);
  const isHeadless = process.env.HEADLESS === '1' || process.env.HEADLESS === 'true';
  console.log(`Iniciando escaneo: ${new Date().toISOString()}`);

  const browser = await chromium.launch({ headless: isHeadless });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    javaScriptEnabled: true
  });
  const page = await context.newPage();

  try {
    await page.goto('https://tienda.mercadona.es/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    await maybeAcceptCookies(page);
    await introducirCodigoPostal(page, codigoPostal);

    await page.goto('https://tienda.mercadona.es/categories/112', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    await introducirCodigoPostal(page, codigoPostal);
    const productos = await explorarCategorias(page, codigoPostal);

    if (productos.length > 0) {
      await writeProductsCsv(productos, `mercadona_${fecha}.csv`);
      console.log(`Datos guardados en mercadona_${fecha}.csv`);
    } else {
      console.log('No se encontraron productos.');
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error('Error durante el proceso de scraping:', error);
  process.exitCode = 1;
});
