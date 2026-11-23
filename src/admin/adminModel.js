const COMMISSION_OPTIONS = [0, 10, 15, 20, 25, 30];
const PRODUCT_CATEGORIES = ['Sales', 'Especias', 'Repostería'];

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'sí' || normalized === 'si') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return null;
};

const parseNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('El CSV necesita encabezados y al menos una fila.');

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim()
  );
  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, (cells[index] || '').trim()]))
  );
};

export const normalizeImportProducts = (rows) => {
  const errors = [];
  const products = rows.map((row, index) => {
    const line = index + 1;
    const nombre = String(row.nombre ?? row.title ?? '').trim();
    const categoria = String(row.categoria ?? row.category ?? '').trim();
    const precio = parseNumber(row.precio ?? row.price);
    const costoProduccion = parseNumber(row.costoProduccion);
    const comisionDefault = parseNumber(row.comisionDefault);
    const stockInicial = parseNumber(row.stockInicial);
    const unidadesVendidas = parseNumber(row.unidadesVendidas);
    const stockActual = parseNumber(row.stockActual);
    const activo = parseBoolean(row.activo);

    const missing = [];
    if (!nombre) missing.push('nombre');
    if (!PRODUCT_CATEGORIES.includes(categoria)) missing.push(`categoria (${PRODUCT_CATEGORIES.join('/')})`);
    if (precio === null || precio < 0) missing.push('precio válido');
    if (costoProduccion === null || costoProduccion < 0) missing.push('costoProduccion válido');
    if (!COMMISSION_OPTIONS.includes(comisionDefault)) missing.push(`comisionDefault (${COMMISSION_OPTIONS.join('/')})`);
    if (stockInicial === null || stockInicial < 0 || !Number.isInteger(stockInicial)) missing.push('stockInicial entero >= 0');
    if (unidadesVendidas === null || unidadesVendidas < 0 || !Number.isInteger(unidadesVendidas)) missing.push('unidadesVendidas entero >= 0');
    if (stockActual === null || !Number.isInteger(stockActual)) missing.push('stockActual entero');
    if (activo === null) missing.push('activo (true/false)');

    if (missing.length) {
      errors.push(`Fila ${line}: falta o no es válido ${missing.join(', ')}.`);
      return null;
    }

    const product = {
      nombre,
      categoria,
      precio,
      activo,
      costoProduccion,
      comisionDefault,
      stockInicial,
      unidadesVendidas,
      stockActual,
    };
    const id = String(row.id ?? '').trim();
    const img = String(row.img ?? row.imagen ?? '').trim();
    const description = String(row.description ?? row.descripcion ?? '').trim();
    const presentacion = String(row.presentacion ?? '').trim();
    if (id) product.id = id;
    if (img) product.img = img;
    if (description) product.description = description;
    if (presentacion) product.presentacion = presentacion;
    return product;
  });

  return { products: products.filter(Boolean), errors };
};

export const parseProductImport = async (file) => {
  const text = await file.text();
  const rows = file.name.toLowerCase().endsWith('.json')
    ? (() => {
      const parsed = JSON.parse(text);
      const products = Array.isArray(parsed) ? parsed : parsed.products;
      if (!Array.isArray(products)) throw new Error('El JSON debe ser una lista de productos.');
      return products;
    })()
    : parseCsv(text);
  return normalizeImportProducts(rows);
};

export const calculateDashboardMetrics = ({ sales, fixedExpenses, variableExpenses, goal, monthlyClosing }) => {
  const confirmedSales = sales.filter((sale) => sale.estado === 'confirmada');
  const totalVendido = monthlyClosing
    ? Number(monthlyClosing.ventasTotales || 0)
    : confirmedSales.reduce((sum, sale) => sum + Number(sale.totalVendido || 0), 0);
  const costoTotal = monthlyClosing
    ? Number(monthlyClosing.costoMercaderia || 0)
    : confirmedSales.reduce((sum, sale) => sum + Number(sale.costoTotal || 0), 0);
  const comisiones = monthlyClosing
    ? Number(monthlyClosing.comisionesVendedores || 0)
    : confirmedSales.reduce((sum, sale) => sum + Number(sale.comisionMonto || 0), 0);
  const margenBruto = totalVendido - costoTotal;
  const gananciaOperativa = margenBruto - comisiones;
  const gastosFijos = monthlyClosing
    ? Number(monthlyClosing.gastosFijosOperativos || 0)
    : fixedExpenses
      .filter((expense) => expense.impactaResultado)
      .reduce((sum, expense) => sum + Number(expense.montoMensual || 0), 0);
  const gastosVariablesTotal = monthlyClosing
    ? Number(monthlyClosing.gastosVariablesOperativos || 0)
    : variableExpenses.reduce((sum, expense) => sum + Number(expense.monto || 0), 0);
  const resultadoFinal = gananciaOperativa - gastosFijos - gastosVariablesTotal;
  const margenContribucion = totalVendido > 0 ? gananciaOperativa / totalVendido : 0;
  const puntoEquilibrio = margenContribucion > 0
    ? (gastosFijos + gastosVariablesTotal) / margenContribucion
    : null;
  const configuredGoal = monthlyClosing?.metaVentasMensual ?? goal;
  const metaVentas = Number.isFinite(Number(configuredGoal)) ? Math.max(0, Number(configuredGoal)) : 0;

  return {
    totalVendido,
    costoTotal,
    margenBruto,
    margenPorcentaje: totalVendido > 0 ? margenBruto / totalVendido * 100 : 0,
    comisiones,
    comisionPorcentaje: totalVendido > 0 ? comisiones / totalVendido * 100 : 0,
    gananciaOperativa,
    gastosFijos,
    gastosVariables: gastosVariablesTotal,
    resultadoFinal,
    resultadoPorcentaje: totalVendido > 0 ? resultadoFinal / totalVendido * 100 : 0,
    puntoEquilibrio,
    metaVentas,
    ventasFaltantes: metaVentas > 0 ? Math.max(0, metaVentas - totalVendido) : null,
    avanceMeta: metaVentas > 0 ? Math.min(100, totalVendido / metaVentas * 100) : 0,
    isMonthlyClosing: Boolean(monthlyClosing),
  };
};

export const formatMoney = (value) => `$${Number(value || 0).toLocaleString('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export const formatPercent = (value) => `${Number(value || 0).toLocaleString('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}%`;

export const getMonthRange = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 1);
  return { start, end };
};
