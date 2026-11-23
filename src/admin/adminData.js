import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  db,
} from '../firestoreClient';

const productsCollection = collection(db, 'productos');
const financialProductsCollection = collection(db, 'datosFinancierosProductos');
const salesCollection = collection(db, 'ventas');
const movementsCollection = collection(db, 'movimientosStock');

export const subscribePublicProducts = (onProducts, onError) => {
  const activeProducts = query(productsCollection, where('activo', '==', true));
  return onSnapshot(activeProducts, (snapshot) => {
    onProducts(snapshot.docs.map((productDoc) => ({
      id: productDoc.id,
      ...productDoc.data(),
    })));
  }, onError);
};

export const subscribeAdminCollection = (collectionName, onItems, onError, constraints = []) => {
  const source = collection(db, collectionName);
  const sourceQuery = constraints.length ? query(source, ...constraints) : source;
  return onSnapshot(sourceQuery, (snapshot) => {
    onItems(snapshot.docs.map((itemDoc) => ({
      id: itemDoc.id,
      ...itemDoc.data(),
    })));
  }, onError);
};

export const subscribeAdminInventory = (onInventory, onError) => {
  let publicProducts = [];
  let financialProducts = [];
  let publicReady = false;
  let financialReady = false;
  let receivedError = false;

  const publish = () => {
    if (!receivedError && publicReady && financialReady) {
      const financialById = new Map(financialProducts.map((item) => [item.id, item]));
      onInventory(publicProducts.map((product) => ({
        ...product,
        financial: financialById.get(product.id) || null,
      })));
    }
  };
  const fail = (error) => {
    receivedError = true;
    onError(error);
  };

  const unsubscribeProducts = onSnapshot(productsCollection, (snapshot) => {
    publicProducts = snapshot.docs.map((productDoc) => ({
      id: productDoc.id,
      ...productDoc.data(),
    }));
    publicReady = true;
    publish();
  }, fail);
  const unsubscribeFinancial = onSnapshot(financialProductsCollection, (snapshot) => {
    financialProducts = snapshot.docs.map((productDoc) => ({
      id: productDoc.id,
      ...productDoc.data(),
    }));
    financialReady = true;
    publish();
  }, fail);

  return () => {
    unsubscribeProducts();
    unsubscribeFinancial();
  };
};

export const createPendingWebOrder = async ({ customer, cart }) => runTransaction(db, async (transaction) => {
  const productRefs = cart.map((item) => doc(db, 'productos', String(item.id)));
  const productSnapshots = [];

  for (const productRef of productRefs) {
    productSnapshots.push(await transaction.get(productRef));
  }

  const items = cart.map((item, index) => {
    const snapshot = productSnapshots[index];
    if (!snapshot.exists()) {
      throw new Error(`El producto ${item.title} ya no está disponible. Actualizá el carrito.`);
    }

    const product = snapshot.data();
    const nombreProducto = product.nombre || product.title;
    const precioUnitario = Number(product.precio ?? product.price);
    if (product.activo !== true || !nombreProducto || !Number.isFinite(precioUnitario) || precioUnitario < 0) {
      throw new Error(`${item.title} ya no está disponible para la venta.`);
    }
    if (Number(item.price) !== precioUnitario) {
      throw new Error(`El precio de ${nombreProducto} cambió. Actualizá el carrito antes de continuar.`);
    }

    const cantidad = Number(item.quantity);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error(`La cantidad de ${nombreProducto} no es válida.`);
    }

    return {
      productoId: snapshot.id,
      nombreProducto,
      cantidad,
      precioUnitario,
      subtotal: precioUnitario * cantidad,
    };
  });
  const totalVendido = items.reduce((total, item) => total + item.subtotal, 0);
  const saleRef = doc(salesCollection);

  transaction.set(saleRef, {
    origen: 'web',
    vendedor: 'WEB',
    cliente: customer.nombre,
    telefono: customer.telefono,
    direccion: customer.direccion,
    items,
    totalVendido,
    estado: 'pendiente',
    fecha: serverTimestamp(),
  });

  return { id: saleRef.id, items, totalVendido };
});

const getInventoryRefs = (productIds) => productIds.flatMap((productId) => [
  doc(db, 'productos', productId),
  doc(db, 'datosFinancierosProductos', productId),
]);

const calculateSale = (items, inventoryById, commissionRate = null) => {
  let comisionMonto = 0;
  const aggregatedItems = new Map();
  items.forEach((item) => {
    const productId = String(item.productoId);
    const existing = aggregatedItems.get(productId);
    if (existing && Number(existing.precioUnitario) !== Number(item.precioUnitario)) {
      throw new Error(`El producto ${item.nombreProducto} tiene precios distintos en la misma venta.`);
    }
    aggregatedItems.set(productId, {
      ...item,
      productoId: productId,
      cantidad: Number(item.cantidad) + Number(existing?.cantidad || 0),
    });
  });

  const saleItems = [...aggregatedItems.values()].map((item) => {
    const inventory = inventoryById.get(item.productoId);
    if (!inventory) throw new Error(`Faltan datos de inventario para ${item.nombreProducto}.`);

    const cantidad = Number(item.cantidad);
    const precioUnitario = Number(item.precioUnitario);
    const costoUnitario = Number(inventory.costoProduccion);
    const itemCommissionRate = commissionRate === null
      ? Number(inventory.comisionDefault || 0)
      : Number(commissionRate);
    if (!Number.isInteger(cantidad) || cantidad < 1 || !Number.isFinite(precioUnitario) || !Number.isFinite(costoUnitario)) {
      throw new Error(`Los datos de venta de ${item.nombreProducto} no son válidos.`);
    }
    if (!Number.isFinite(itemCommissionRate) || itemCommissionRate < 0 || itemCommissionRate > 100) {
      throw new Error(`La comisión de ${item.nombreProducto} no es válida.`);
    }
    if (inventory.productPrice !== undefined && precioUnitario !== Number(inventory.productPrice)) {
      throw new Error(`El precio de ${item.nombreProducto} cambió. Actualizá el pedido antes de confirmarlo.`);
    }
    if (Number(inventory.stockActual) < cantidad) {
      throw new Error(`Stock insuficiente para ${item.nombreProducto}.`);
    }

    const subtotal = precioUnitario * cantidad;
    const costoSubtotal = costoUnitario * cantidad;
    comisionMonto += subtotal * itemCommissionRate / 100;
    return { ...item, precioUnitario, costoUnitario, subtotal, costoSubtotal };
  });
  const totalVendido = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const costoTotal = saleItems.reduce((sum, item) => sum + item.costoSubtotal, 0);

  return {
    items: saleItems,
    totalVendido,
    costoTotal,
    comisionPorcentaje: totalVendido ? comisionMonto / totalVendido * 100 : 0,
    comisionMonto,
    gananciaNowin: totalVendido - costoTotal - comisionMonto,
  };
};

const writeStockMovement = (transaction, { productId, name, type, delta, previousStock, referenceId, reason }) => {
  const movementRef = doc(movementsCollection);
  transaction.set(movementRef, {
    productoId: productId,
    nombreProducto: name,
    tipo: type,
    delta,
    stockAnterior: previousStock,
    stockNuevo: previousStock + delta,
    referenciaId: referenceId,
    motivo: reason,
    fecha: serverTimestamp(),
  });
};

const applySaleToInventory = (transaction, sale, inventoryById, movementType, referenceId) => {
  for (const item of sale.items) {
    const inventory = inventoryById.get(item.productoId);
    const newStock = Number(inventory.stockActual) - item.cantidad;
    transaction.update(doc(db, 'datosFinancierosProductos', item.productoId), {
      stockActual: newStock,
      unidadesVendidas: Number(inventory.unidadesVendidas || 0) + item.cantidad,
    });
    writeStockMovement(transaction, {
      productId: item.productoId,
      name: item.nombreProducto,
      type: movementType,
      delta: -item.cantidad,
      previousStock: Number(inventory.stockActual),
      referenceId,
      reason: `Venta ${movementType === 'venta_web' ? 'web' : 'manual'}`,
    });
  }
};

const readInventoryForSale = async (transaction, productIds) => {
  const refs = getInventoryRefs(productIds);
  const snapshots = [];
  for (const reference of refs) snapshots.push(await transaction.get(reference));
  const inventoryById = new Map();
  productIds.forEach((productId, index) => {
    const productSnapshot = snapshots[index * 2];
    const financialSnapshot = snapshots[index * 2 + 1];
    if (!productSnapshot.exists() || !financialSnapshot.exists()) {
      throw new Error('Un producto de la venta no tiene datos financieros completos.');
    }
    inventoryById.set(productId, {
      ...financialSnapshot.data(),
      productActive: productSnapshot.data().activo === true,
      productName: productSnapshot.data().nombre || productSnapshot.data().title,
      productPrice: Number(productSnapshot.data().precio ?? productSnapshot.data().price),
    });
  });
  return inventoryById;
};

export const recordManualSale = async ({ date, seller, customer, items, commissionRate }) => runTransaction(db, async (transaction) => {
  const productIds = [...new Set(items.map((item) => String(item.productoId)))];
  const inventoryById = await readInventoryForSale(transaction, productIds);

  const enrichedItems = items.map((item) => {
    const productId = String(item.productoId);
    const inventory = inventoryById.get(productId);
    if (!inventory.productActive) throw new Error(`${inventory.productName} está inactivo.`);
    return {
      productoId,
      nombreProducto: inventory.productName,
      cantidad: Number(item.cantidad),
      precioUnitario: inventory.productPrice,
    };
  });
  const calculated = calculateSale(enrichedItems, inventoryById, Number(commissionRate));
  const saleRef = doc(salesCollection);
  const dateValue = new Date(`${date}T12:00:00`);
  if (Number.isNaN(dateValue.getTime())) throw new Error('La fecha de venta no es válida.');
  const sale = {
    origen: 'manual',
    vendedor: seller.trim(),
    cliente: customer.trim(),
    items: calculated.items,
    totalVendido: calculated.totalVendido,
    costoTotal: calculated.costoTotal,
    comisionPorcentaje: calculated.comisionPorcentaje,
    comisionMonto: calculated.comisionMonto,
    gananciaNowin: calculated.gananciaNowin,
    estado: 'confirmada',
    fecha: Timestamp.fromDate(dateValue),
  };

  applySaleToInventory(transaction, sale, inventoryById, 'venta_manual', saleRef.id);
  transaction.set(saleRef, sale);
  return sale;
});

export const confirmWebSale = async (saleId) => runTransaction(db, async (transaction) => {
  const saleRef = doc(db, 'ventas', saleId);
  const saleSnapshot = await transaction.get(saleRef);
  if (!saleSnapshot.exists()) throw new Error('No se encontró el pedido.');
  const sale = saleSnapshot.data();
  if (sale.estado !== 'pendiente' || sale.origen !== 'web') {
    throw new Error('Solo se pueden confirmar pedidos web pendientes.');
  }

  const productIds = [...new Set(sale.items.map((item) => String(item.productoId)))];
  const inventoryById = await readInventoryForSale(transaction, productIds);
  const calculated = calculateSale(sale.items, inventoryById);
  const confirmedSale = {
    ...sale,
    ...calculated,
    estado: 'confirmada',
    confirmadaAt: serverTimestamp(),
  };

  applySaleToInventory(transaction, confirmedSale, inventoryById, 'venta_web', saleId);
  transaction.update(saleRef, confirmedSale);
  return confirmedSale;
});

export const cancelSale = async (saleId, reason = 'Anulación desde el panel') => runTransaction(db, async (transaction) => {
  const saleRef = doc(db, 'ventas', saleId);
  const saleSnapshot = await transaction.get(saleRef);
  if (!saleSnapshot.exists()) throw new Error('No se encontró la venta.');
  const sale = saleSnapshot.data();
  if (sale.estado === 'anulada') throw new Error('Esta venta ya está anulada.');

  if (sale.estado === 'confirmada') {
    const productIds = [...new Set(sale.items.map((item) => String(item.productoId)))];
    const refs = productIds.map((productId) => doc(db, 'datosFinancierosProductos', productId));
    const snapshots = [];
    for (const reference of refs) snapshots.push(await transaction.get(reference));
    const inventoryById = new Map(productIds.map((productId, index) => {
      if (!snapshots[index].exists()) throw new Error(`Faltan datos de stock para ${productId}.`);
      return [productId, snapshots[index].data()];
    }));

    const itemsByProduct = new Map();
    sale.items.forEach((item) => {
      const productId = String(item.productoId);
      const previous = itemsByProduct.get(productId);
      itemsByProduct.set(productId, { ...item, productoId: productId, cantidad: Number(item.cantidad) + Number(previous?.cantidad || 0) });
    });

    for (const item of itemsByProduct.values()) {
      const inventory = inventoryById.get(String(item.productoId));
      const previousStock = Number(inventory.stockActual);
      const delta = Number(item.cantidad);
      transaction.update(doc(db, 'datosFinancierosProductos', String(item.productoId)), {
        stockActual: previousStock + delta,
        unidadesVendidas: Math.max(0, Number(inventory.unidadesVendidas || 0) - delta),
      });
      writeStockMovement(transaction, {
        productId: String(item.productoId),
        name: item.nombreProducto,
        type: 'anulacion',
        delta,
        previousStock,
        referenceId: saleId,
        reason,
      });
    }
  }

  transaction.update(saleRef, { estado: 'anulada', motivoAnulacion: reason, anuladaAt: serverTimestamp() });
});

export const adjustProductStock = async ({ productId, delta, type, reason }) => runTransaction(db, async (transaction) => {
  const productRef = doc(db, 'productos', productId);
  const financialRef = doc(db, 'datosFinancierosProductos', productId);
  const [productSnapshot, financialSnapshot] = await Promise.all([
    transaction.get(productRef),
    transaction.get(financialRef),
  ]);
  if (!productSnapshot.exists() || !financialSnapshot.exists()) {
    throw new Error('El producto no tiene datos completos para ajustar stock.');
  }

  const adjustment = Number(delta);
  if (!Number.isInteger(adjustment) || adjustment === 0) throw new Error('Ingresá una cantidad entera distinta de cero.');
  if (!['reposicion', 'ajuste'].includes(type)) throw new Error('El tipo de movimiento no es válido.');
  if (type === 'reposicion' && adjustment < 1) throw new Error('La reposición debe sumar unidades.');
  if (!reason.trim()) throw new Error('Ingresá el motivo del movimiento.');

  const financial = financialSnapshot.data();
  const previousStock = Number(financial.stockActual);
  const newStock = previousStock + adjustment;
  transaction.update(financialRef, { stockActual: newStock });
  writeStockMovement(transaction, {
    productId,
    name: productSnapshot.data().nombre || productSnapshot.data().title,
    type,
    delta: adjustment,
    previousStock,
    referenceId: `stock-${Date.now()}`,
    reason: reason.trim(),
  });
  return newStock;
});

export const saveProductPrice = (productId, price) => updateDoc(doc(db, 'productos', productId), {
  precio: Number(price),
  updatedAt: serverTimestamp(),
});

export const saveProductActive = (productId, active) => updateDoc(doc(db, 'productos', productId), {
  activo: active,
  updatedAt: serverTimestamp(),
});

export const saveExpense = (collectionName, expenseId, values) => {
  const expenseRef = expenseId ? doc(db, collectionName, expenseId) : doc(collection(db, collectionName));
  return setDoc(expenseRef, values, { merge: Boolean(expenseId) });
};

export const removeExpense = (collectionName, expenseId) => deleteDoc(doc(db, collectionName, expenseId));

export const saveFinancialConfig = (values) => setDoc(doc(db, 'configuracionFinanciera', 'nowin-general'), values, { merge: true });

export const saveMonthlyClosing = (month, values) => setDoc(
  doc(db, 'configuracionFinanciera', 'nowin-general'),
  {
    mesActivo: month,
    metaVentasMensual: values.metaVentasMensual,
    cierresMensuales: {
      [month]: {
        ...values,
        fuente: 'NOWIN - RESUMEN GERENCIAL AUTOMATIZADO',
        updatedAt: serverTimestamp(),
      },
    },
  },
  { merge: true }
);

export const importProducts = async (products) => {
  const chunkSize = 200;
  for (let offset = 0; offset < products.length; offset += chunkSize) {
    const batch = writeBatch(db);
    products.slice(offset, offset + chunkSize).forEach((product) => {
      const productRef = product.id
        ? doc(db, 'productos', product.id)
        : doc(productsCollection);
      const financialRef = doc(db, 'datosFinancierosProductos', productRef.id);
      const {
        id,
        costoProduccion,
        comisionDefault,
        stockInicial,
        unidadesVendidas,
        stockActual,
        ...publicProduct
      } = product;

      batch.set(productRef, { ...publicProduct, updatedAt: serverTimestamp() }, { merge: true });
      batch.set(financialRef, {
        costoProduccion,
        comisionDefault,
        stockInicial,
        unidadesVendidas,
        stockActual,
      }, { merge: true });
    });
    await batch.commit();
  }
};

export const subscribeRecentMovements = (onItems, onError) =>
  subscribeAdminCollection('movimientosStock', onItems, onError, [orderBy('fecha', 'desc'), limit(100)]);

export const subscribeRecentSales = (onItems, onError) =>
  subscribeAdminCollection('ventas', onItems, onError, [orderBy('fecha', 'desc'), limit(500)]);

export const subscribeMonthlySales = (month, onItems, onError) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const start = Timestamp.fromDate(new Date(year, monthNumber - 1, 1));
  const end = Timestamp.fromDate(new Date(year, monthNumber, 1));
  const monthlySales = query(
    salesCollection,
    where('fecha', '>=', start),
    where('fecha', '<', end),
    orderBy('fecha', 'desc')
  );
  return onSnapshot(monthlySales, (snapshot) => {
    onItems(snapshot.docs.map((saleDoc) => ({
      id: saleDoc.id,
      ...saleDoc.data(),
    })));
  }, onError);
};

export const subscribeExpenses = (collectionName, onItems, onError) =>
  subscribeAdminCollection(collectionName, onItems, onError);

export const subscribeFinancialConfig = (onConfig, onError) =>
  onSnapshot(doc(db, 'configuracionFinanciera', 'nowin-general'), (snapshot) => {
    onConfig(snapshot.exists() ? snapshot.data() : null);
  }, onError);

export const saveFinancialProductData = (productId, values) => setDoc(
  doc(db, 'datosFinancierosProductos', productId),
  values,
  { merge: true }
);

export const getAdminProfile = async (userId) => {
  const profile = await getDoc(doc(db, 'admins', userId));
  return profile.exists() ? profile.data() : null;
};
