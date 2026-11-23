import ExcelJS from 'exceljs';

const currencyFormat = '"$"#,##0.00;[Red]-"$"#,##0.00';
const percentFormat = '0.00%';

const toDateText = (value) => {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('es-AR');
};

const numberOrBlank = (value) => {
  const number = Number(value);
  return value === null || value === undefined || value === '' || !Number.isFinite(number) ? '' : number;
};

const addSheet = (workbook, { name, headers, rows, widths, formats = {} }) => {
  const worksheet = workbook.addWorksheet(name);
  worksheet.columns = headers.map((header, index) => ({
    key: `column${index}`,
    width: widths[index] || 18,
  }));
  worksheet.addRow(headers);
  rows.forEach((row) => worksheet.addRow(row));
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(rows.length + 1, 1), column: headers.length },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFC400' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', wrapText: true };
  worksheet.getRow(1).height = 30;

  Object.entries(formats).forEach(([column, format]) => {
    worksheet.getColumn(Number(column)).numFmt = format;
  });
  return worksheet;
};

const collectSales = (recentSales, monthlySales) => {
  const uniqueSales = new Map([...recentSales, ...monthlySales].map((sale) => [sale.id, sale]));
  return [...uniqueSales.values()].sort((first, second) => {
    const firstDate = first.fecha?.toDate ? first.fecha.toDate().getTime() : new Date(first.fecha || 0).getTime();
    const secondDate = second.fecha?.toDate ? second.fecha.toDate().getTime() : new Date(second.fecha || 0).getTime();
    return secondDate - firstDate;
  });
};

export const buildAdminWorkbook = ({
  month,
  metrics,
  inventory,
  sales,
  monthlySales,
  fixedExpenses,
  variableExpenses,
  movements,
  monthlyClosing,
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NOWIN';
  workbook.created = new Date();
  workbook.subject = `Resumen administrativo ${month}`;
  workbook.title = `NOWIN - Resumen ${month}`;

  const recentAndMonthlySales = collectSales(sales, monthlySales);
  const summaryRows = [
    ['Período', 'Mes activo', month, '', ''],
    ['Exportación', 'Generado el', new Date().toLocaleString('es-AR'), '', ''],
    ['Origen', 'Resumen', metrics.isMonthlyClosing ? 'Cierre agregado' : 'Ventas y gastos de Firestore', '', ''],
    ['Ventas', 'Ventas totales', metrics.totalVendido, '', ''],
    ['Costos', 'Costo de mercadería', metrics.costoTotal, '', ''],
    ['Rentabilidad', 'Margen bruto', metrics.margenBruto, metrics.margenPorcentaje / 100, ''],
    ['Comisiones', 'Comisiones vendedores', metrics.comisiones, metrics.comisionPorcentaje / 100, ''],
    ['Rentabilidad', 'Ganancia operativa NOWIN', metrics.gananciaOperativa, '', ''],
    ['Gastos', 'Gastos fijos operativos', metrics.gastosFijos, '', ''],
    ['Gastos', 'Gastos variables operativos', metrics.gastosVariables, '', ''],
    ['Rentabilidad', 'Resultado final NOWIN', metrics.resultadoFinal, metrics.resultadoPorcentaje / 100, ''],
    ['Meta', 'Punto de equilibrio', numberOrBlank(metrics.puntoEquilibrio), '', ''],
    ['Meta', 'Meta de ventas mensual', metrics.metaVentas, '', ''],
    ['Meta', 'Ventas faltantes', numberOrBlank(metrics.ventasFaltantes), '', ''],
    ['Alcance', 'Ventas incluidas', recentAndMonthlySales.length, '', 'Hasta 500 recientes más todas las del mes activo, sin duplicados.'],
    ['Alcance', 'Movimientos de stock incluidos', movements.length, '', 'El panel conserva los 100 movimientos más recientes.'],
    ['Alcance', 'Inventario y gastos', '', '', 'Todos los registros actualmente cargados en el panel.'],
  ];
  const summary = addSheet(workbook, {
    name: 'Resumen',
    headers: ['Grupo', 'Indicador', 'Valor', 'Porcentaje', 'Notas'],
    rows: summaryRows,
    widths: [18, 32, 22, 16, 68],
    formats: { 3: currencyFormat, 4: percentFormat },
  });
  [16, 17].forEach((rowNumber) => {
    summary.getCell(rowNumber, 3).numFmt = '0';
  });

  const inventoryRows = inventory.map((product) => [
    product.id,
    product.nombre || product.title || 'Producto sin nombre',
    product.categoria || product.category || '',
    numberOrBlank(product.precio ?? product.price),
    numberOrBlank(product.financial?.costoProduccion),
    Number.isFinite(Number(product.financial?.comisionDefault)) ? Number(product.financial.comisionDefault) / 100 : '',
    numberOrBlank(product.financial?.stockInicial),
    numberOrBlank(product.financial?.unidadesVendidas),
    numberOrBlank(product.financial?.stockActual),
    product.activo === true ? 'Sí' : 'No',
  ]);
  addSheet(workbook, {
    name: 'Inventario',
    headers: ['ID', 'Producto', 'Categoría', 'Precio', 'Costo producción', 'Comisión predeterminada', 'Stock inicial', 'Unidades vendidas', 'Stock actual', 'Activo'],
    rows: inventoryRows,
    widths: [24, 34, 20, 16, 19, 23, 16, 19, 16, 12],
    formats: { 4: currencyFormat, 5: currencyFormat, 6: percentFormat },
  });

  const salesRows = recentAndMonthlySales.map((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    const itemSummary = items.map((item) => `${item.nombreProducto || item.productoId || 'Producto'} x${item.cantidad || 0}`).join('; ');
    return [
      sale.id,
      toDateText(sale.fecha),
      sale.origen || '',
      sale.vendedor || '',
      sale.cliente || '',
      sale.estado || '',
      itemSummary,
      numberOrBlank(sale.totalVendido),
      numberOrBlank(sale.costoTotal),
      Number.isFinite(Number(sale.comisionPorcentaje)) ? Number(sale.comisionPorcentaje) / 100 : '',
      numberOrBlank(sale.comisionMonto),
      numberOrBlank(sale.gananciaNowin),
    ];
  });
  addSheet(workbook, {
    name: 'Ventas',
    headers: ['ID venta', 'Fecha', 'Origen', 'Vendedor', 'Cliente', 'Estado', 'Productos', 'Total vendido', 'Costo total', 'Comisión %', 'Comisión monto', 'Ganancia NOWIN'],
    rows: salesRows,
    widths: [24, 23, 14, 20, 28, 16, 52, 18, 18, 14, 18, 18],
    formats: { 8: currencyFormat, 9: currencyFormat, 10: percentFormat, 11: currencyFormat, 12: currencyFormat },
  });

  const expenseRows = [
    ...fixedExpenses.map((expense) => [
      'Fijo mensual',
      'Mensual',
      expense.concepto || '',
      numberOrBlank(expense.montoMensual),
      expense.pagado ? 'Sí' : 'No',
      expense.impactaResultado ? 'Sí' : 'No',
      expense.observaciones || '',
    ]),
    ...variableExpenses.map((expense) => [
      'Variable',
      toDateText(expense.fecha),
      expense.concepto || '',
      numberOrBlank(expense.monto),
      '',
      'Sí',
      expense.observaciones || '',
    ]),
  ];
  addSheet(workbook, {
    name: 'Gastos',
    headers: ['Tipo', 'Fecha / período', 'Concepto', 'Monto', 'Pagado', 'Impacta resultado', 'Observaciones'],
    rows: expenseRows,
    widths: [18, 23, 34, 18, 14, 20, 48],
    formats: { 4: currencyFormat },
  });

  const movementRows = movements.map((movement) => [
    toDateText(movement.fecha),
    movement.productoId || '',
    movement.nombreProducto || '',
    movement.tipo || '',
    numberOrBlank(movement.delta),
    numberOrBlank(movement.stockAnterior),
    numberOrBlank(movement.stockNuevo),
    movement.referenciaId || '',
    movement.motivo || '',
  ]);
  addSheet(workbook, {
    name: 'Movimientos stock',
    headers: ['Fecha', 'ID producto', 'Producto', 'Tipo', 'Variación', 'Stock anterior', 'Stock nuevo', 'Referencia', 'Motivo'],
    rows: movementRows,
    widths: [23, 24, 34, 18, 14, 16, 16, 28, 40],
  });

  if (monthlyClosing) {
    addSheet(workbook, {
      name: 'Cierre mensual',
      headers: ['Mes', 'Ventas totales', 'Costo mercadería', 'Comisiones vendedores', 'Gastos fijos', 'Gastos variables', 'Meta mensual', 'Fuente', 'Actualizado por', 'Actualizado el'],
      rows: [[
        month,
        numberOrBlank(monthlyClosing.ventasTotales),
        numberOrBlank(monthlyClosing.costoMercaderia),
        numberOrBlank(monthlyClosing.comisionesVendedores),
        numberOrBlank(monthlyClosing.gastosFijosOperativos),
        numberOrBlank(monthlyClosing.gastosVariablesOperativos),
        numberOrBlank(monthlyClosing.metaVentasMensual),
        monthlyClosing.fuente || '',
        monthlyClosing.actualizadoPor || '',
        toDateText(monthlyClosing.updatedAt),
      ]],
      widths: [14, 18, 20, 22, 18, 20, 18, 46, 30, 23],
      formats: { 2: currencyFormat, 3: currencyFormat, 4: currencyFormat, 5: currencyFormat, 6: currencyFormat, 7: currencyFormat },
    });
  }

  return workbook;
};

export const exportAdminWorkbook = async (data) => {
  const workbook = buildAdminWorkbook(data);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nowin-resumen-${data.month}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
