import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Download, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import {
  adjustProductStock,
  cancelSale,
  confirmWebSale,
  getAdminProfile,
  importProducts,
  recordManualSale,
  removeExpense,
  saveExpense,
  saveFinancialConfig,
  saveFinancialProductData,
  saveMonthlyClosing,
  saveProductActive,
  saveProductPrice,
  subscribeAdminInventory,
  subscribeExpenses,
  subscribeFinancialConfig,
  subscribeMonthlySales,
  subscribeRecentMovements,
  subscribeRecentSales,
} from './adminData';
import {
  calculateDashboardMetrics,
  formatMoney,
  formatPercent,
  parseProductImport,
} from './adminModel';
import './AdminDashboard.css';

const COMMISSION_OPTIONS = [0, 10, 15, 20, 25, 30];
const ADMIN_TABS = [
  ['summary', 'Resumen gerencial'],
  ['inventory', 'Inventario y precios'],
  ['sales', 'Ventas'],
  ['expenses', 'Gastos'],
  ['import', 'Importador inicial'],
];

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const shiftMonth = (month, offset) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const asDate = (value) => {
  if (value?.toDate) return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const monthOf = (value) => {
  const date = asDate(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '';
};

const productName = (product) => product.nombre || product.title || 'Producto sin nombre';
const productCategory = (product) => product.categoria || product.category || '';

const AdminDashboard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [month, setMonth] = useState(currentMonth);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [previousMonthSales, setPreviousMonthSales] = useState([]);
  const [movements, setMovements] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [variableExpenses, setVariableExpenses] = useState([]);
  const [financialConfig, setFinancialConfig] = useState(null);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');
  const [authError, setAuthError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const actionInProgress = useRef(false);
  const authCheckSequence = useRef(0);
  const authorized = Boolean(authUser) && isAdminUser;
  const previousMonth = useMemo(() => shiftMonth(month, -1), [month]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentCheck = ++authCheckSequence.current;
      setAuthChecking(true);
      if (!user) {
        setAuthUser(null);
        setIsAdminUser(false);
        setAuthChecking(false);
        return;
      }

      try {
        const profile = await getAdminProfile(user.uid);
        if (currentCheck !== authCheckSequence.current) return;
        if (!profile) {
          setAuthError('Esta cuenta no está autorizada para administrar Nowin.');
          await signOut(auth);
          return;
        }
        setAuthError('');
        setAuthUser(user);
        setIsAdminUser(true);
      } catch (error) {
        if (currentCheck !== authCheckSequence.current) return;
        console.error('No se pudo validar el acceso administrativo.', error);
        setAuthError('No se pudo validar el acceso. Revisá Authentication y las reglas de Firestore.');
        await signOut(auth);
      } finally {
        if (currentCheck === authCheckSequence.current) setAuthChecking(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authorized) return undefined;
    setPageError('');
    const handleError = (error) => {
      console.error('No se pudieron cargar los datos administrativos.', error);
      setPageError('No se pudieron cargar algunos datos. Verificá las reglas de Firestore y volvé a intentar.');
    };
    const unsubscribers = [
      subscribeAdminInventory(setInventory, handleError),
      subscribeRecentSales(setSales, handleError),
      subscribeRecentMovements(setMovements, handleError),
      subscribeExpenses('gastosFijos', setFixedExpenses, handleError),
      subscribeExpenses('gastosVariables', setVariableExpenses, handleError),
      subscribeFinancialConfig(setFinancialConfig, handleError),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [authorized]);

  useEffect(() => {
    if (!authorized || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return undefined;
    return subscribeMonthlySales(month, setMonthlySales, (error) => {
      console.error('No se pudieron cargar las ventas del mes.', error);
      setPageError('No se pudieron cargar las ventas del mes. Verificá las reglas y los índices de Firestore.');
    });
  }, [authorized, month]);

  useEffect(() => {
    if (!authorized || !/^\d{4}-(0[1-9]|1[0-2])$/.test(previousMonth)) return undefined;
    return subscribeMonthlySales(previousMonth, setPreviousMonthSales, (error) => {
      console.error('No se pudieron cargar las ventas del mes anterior.', error);
      setPageError('No se pudo calcular la comparación mensual. Revisá las reglas y los índices de Firestore.');
    });
  }, [authorized, previousMonth]);

  useEffect(() => {
    if (!authorized) return undefined;
    let timeoutId;
    const expireSession = () => {
      setSessionExpired(true);
      setAuthUser(null);
      setIsAdminUser(false);
      signOut(auth).catch((error) => {
        console.error('No se pudo cerrar la sesión por inactividad.', error);
        setAuthError('La sesión se bloqueó, pero no se pudo cerrar en Firebase.');
      });
    };
    const resetTimeout = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(expireSession, 15 * 60 * 1000);
    };
    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'wheel'];

    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetTimeout, { passive: true }));
    window.addEventListener('scroll', resetTimeout, { passive: true });
    resetTimeout();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetTimeout));
      window.removeEventListener('scroll', resetTimeout);
    };
  }, [authorized]);

  useEffect(() => {
    const savedMonth = financialConfig?.mesActivo;
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(savedMonth || '')) setMonth(savedMonth);
  }, [financialConfig?.mesActivo]);

  const monthlyVariableExpenses = useMemo(
    () => variableExpenses.filter((expense) => monthOf(expense.fecha) === month),
    [variableExpenses, month]
  );
  const previousMonthlyVariableExpenses = useMemo(
    () => variableExpenses.filter((expense) => monthOf(expense.fecha) === previousMonth),
    [variableExpenses, previousMonth]
  );
  const monthlyClosing = financialConfig?.cierresMensuales?.[month] || null;
  const previousMonthlyClosing = financialConfig?.cierresMensuales?.[previousMonth] || null;
  const metrics = useMemo(() => calculateDashboardMetrics({
    sales: monthlySales,
    fixedExpenses,
    variableExpenses: monthlyVariableExpenses,
    goal: financialConfig?.metaVentasMensual,
    monthlyClosing,
  }), [monthlySales, fixedExpenses, monthlyVariableExpenses, financialConfig?.metaVentasMensual, monthlyClosing]);
  const previousMetrics = useMemo(() => calculateDashboardMetrics({
    sales: previousMonthSales,
    fixedExpenses,
    variableExpenses: previousMonthlyVariableExpenses,
    goal: financialConfig?.metaVentasMensual,
    monthlyClosing: previousMonthlyClosing,
  }), [previousMonthSales, fixedExpenses, previousMonthlyVariableExpenses, financialConfig?.metaVentasMensual, previousMonthlyClosing]);
  const salesTrend = previousMetrics.totalVendido > 0
    ? (metrics.totalVendido - previousMetrics.totalVendido) / previousMetrics.totalVendido * 100
    : null;

  const runAction = async (action, successMessage) => {
    if (actionInProgress.current) return false;
    actionInProgress.current = true;
    setBusy(true);
    setPageError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      return true;
    } catch (error) {
      console.error('Falló una operación del panel administrativo.', error);
      setPageError(error instanceof Error ? error.message : 'La operación no pudo completarse.');
      return false;
    } finally {
      actionInProgress.current = false;
      setBusy(false);
    }
  };

  const showValidationError = (message) => {
    setPageError(message);
    setNotice('');
  };

  const exportWorkbook = () => runAction(async () => {
    const { exportAdminWorkbook } = await import('./exportAdminWorkbook');
    await exportAdminWorkbook({
      month,
      metrics,
      inventory,
      sales,
      monthlySales,
      fixedExpenses,
      variableExpenses,
      movements,
      monthlyClosing,
    });
  }, `Excel del resumen administrativo ${month} descargado.`);

  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setAuthError('');
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
      setSessionExpired(false);
    } catch (error) {
      console.error('No se pudo iniciar sesión en Firebase Authentication.', error);
      setPassword('');
      if (['auth/configuration-not-found', 'auth/operation-not-allowed'].includes(error.code)) {
        setAuthError('Firebase Authentication no está configurado. Habilitá el proveedor Correo/contraseña en el proyecto nowin-86d07.');
      } else {
        setAuthError(error.code === 'auth/invalid-credential'
          ? 'El correo o la contraseña no son correctos.'
          : 'No se pudo iniciar sesión. Revisá la configuración de Firebase Authentication.');
      }
    } finally {
      setBusy(false);
    }
  };

  const lockPanel = async () => {
    setEmail('');
    setPassword('');
    setSessionExpired(false);
    setAuthUser(null);
    setIsAdminUser(false);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('No se pudo cerrar la sesión de Firebase Authentication.', error);
      setAuthError('El panel quedó bloqueado, pero no se pudo cerrar la sesión de Firebase.');
    }
  };

  const changeMonth = (nextMonth) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(nextMonth)) return;
    setMonth(nextMonth);
    runAction(
      () => saveFinancialConfig({ mesActivo: nextMonth }),
      `Mes activo actualizado a ${nextMonth}.`
    );
  };

  if (authChecking) {
    return <main className="admin-page"><p className="admin-loading" role="status">Verificando acceso…</p></main>;
  }

  if (!authUser || !isAdminUser) {
    return (
      <main className="admin-page">
        <section className="admin-access-card" aria-labelledby="admin-login-title">
          <p className="admin-eyebrow">NOWIN · ACCESO PRIVADO</p>
          <h1 id="admin-login-title">Ingresar al panel</h1>
          <p className="admin-access-description">Usá una cuenta de Firebase Authentication autorizada para administrar Nowin.</p>
          {sessionExpired && <div className="admin-alert admin-alert-warning" role="status">La sesión se bloqueó después de 15 minutos sin actividad. Ingresá nuevamente.</div>}
          <form onSubmit={login} className="admin-form">
            <label htmlFor="admin-email">Correo electrónico</label>
            <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="admin-password">Contraseña</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {authError && <p className="admin-error" role="alert">{authError}</p>}
            <button type="submit" className="admin-primary-button" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
          </form>
          <p className="admin-security-note"><ShieldCheck size={16} aria-hidden="true" /> Firestore solo permite el acceso a cuentas cuyo UID esté en la lista de administradores.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <p className="admin-eyebrow">NOWIN · ADMINISTRACIÓN</p>
          <h1>Gestión del negocio</h1>
          <span>{authUser.email}</span>
        </div>
        <div className="admin-topbar-controls">
          <label className="admin-month-field">Mes activo<input type="month" value={month} onChange={(event) => changeMonth(event.target.value)} /></label>
          <button type="button" className="admin-lock-button" onClick={lockPanel} aria-label="Bloquear panel y cerrar sesión">
            <LogOut size={17} aria-hidden="true" /> Bloquear panel <span>(Salir)</span>
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Secciones administrativas">
        {ADMIN_TABS.map(([id, label]) => (
          <button
            type="button"
            key={id}
            className={activeTab === id ? 'active' : ''}
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {pageError && <div className="admin-alert admin-alert-error" role="alert">{pageError}</div>}
      {notice && <div className="admin-alert admin-alert-success" role="status">{notice}</div>}
      {busy && <div className="admin-busy" role="status"><RefreshCw size={16} /> Procesando…</div>}

      {activeTab === 'summary' && (
        <SummaryTab
          metrics={metrics}
          salesTrend={salesTrend}
          month={month}
          monthlyClosing={monthlyClosing}
          updatedBy={authUser.email}
          busy={busy}
          onNavigate={setActiveTab}
          onValidationError={showValidationError}
          onExportWorkbook={exportWorkbook}
          onSaveGoal={(goal) => runAction(
            () => monthlyClosing
              ? saveMonthlyClosing(month, { ...monthlyClosing, metaVentasMensual: goal, actualizadoPor: authUser.email })
              : saveFinancialConfig({ metaVentasMensual: goal, mesActivo: month }),
            'Meta mensual actualizada.'
          )}
          onSaveClosing={(values) => runAction(
            () => saveMonthlyClosing(month, { ...values, mesActivo: month, actualizadoPor: authUser.email }),
            'Cierre mensual agregado guardado.'
          )}
        />
      )}
      {activeTab === 'inventory' && (
        <InventoryTab
          inventory={inventory}
          movements={movements}
          onValidationError={showValidationError}
          onSavePrice={(productId, price) => runAction(() => saveProductPrice(productId, price), 'Precio actualizado.')}
          onSaveActive={(productId, active) => runAction(() => saveProductActive(productId, active), 'Disponibilidad actualizada.')}
          onAdjustStock={(values) => runAction(() => adjustProductStock(values), 'Movimiento de stock registrado.')}
          onSaveFinancialData={(productId, values) => runAction(() => saveFinancialProductData(productId, values), 'Datos de costos y stock guardados.')}
        />
      )}
      {activeTab === 'sales' && (
        <SalesTab
          inventory={inventory}
          sales={sales}
          onValidationError={showValidationError}
          onCreateSale={(values) => runAction(() => recordManualSale(values), 'Venta manual registrada y stock actualizado.')}
          onConfirm={(saleId) => runAction(() => confirmWebSale(saleId), 'Pedido confirmado y stock descontado.')}
          onCancel={(saleId) => runAction(() => cancelSale(saleId), 'Venta anulada y stock reintegrado si correspondía.')}
        />
      )}
      {activeTab === 'expenses' && (
        <ExpensesTab
          fixedExpenses={fixedExpenses}
          variableExpenses={monthlyVariableExpenses}
          month={month}
          onSaveFixed={(id, values) => runAction(() => saveExpense('gastosFijos', id, values), 'Gasto fijo guardado.')}
          onSaveVariable={(values) => runAction(() => saveExpense('gastosVariables', null, values), 'Gasto variable registrado.')}
          onRemove={(collectionName, id) => runAction(() => removeExpense(collectionName, id), 'Gasto eliminado.')}
        />
      )}
      {activeTab === 'import' && (
        <ImportTab onImport={(products) => runAction(() => importProducts(products), `${products.length} producto(s) importado(s).`)} />
      )}
    </main>
  );
};

const SummaryTab = ({
  metrics,
  salesTrend,
  month,
  monthlyClosing,
  updatedBy,
  onNavigate,
  onValidationError,
  onSaveGoal,
  onSaveClosing,
  onExportWorkbook,
  busy,
}) => {
  const [goal, setGoal] = useState(String(metrics.metaVentas || ''));
  const [showClosingForm, setShowClosingForm] = useState(false);
  const [closingDraft, setClosingDraft] = useState({
    ventasTotales: '',
    costoMercaderia: '',
    comisionesVendedores: '',
    gastosFijosOperativos: '',
    gastosVariablesOperativos: '',
    metaVentasMensual: String(metrics.metaVentas || ''),
  });
  useEffect(() => setGoal(String(metrics.metaVentas || '')), [metrics.metaVentas]);
  useEffect(() => {
    setClosingDraft({
      ventasTotales: monthlyClosing?.ventasTotales ?? '',
      costoMercaderia: monthlyClosing?.costoMercaderia ?? '',
      comisionesVendedores: monthlyClosing?.comisionesVendedores ?? '',
      gastosFijosOperativos: monthlyClosing?.gastosFijosOperativos ?? '',
      gastosVariablesOperativos: monthlyClosing?.gastosVariablesOperativos ?? '',
      metaVentasMensual: monthlyClosing?.metaVentasMensual ?? metrics.metaVentas ?? '',
    });
  }, [monthlyClosing, month, metrics.metaVentas]);

  const cards = [
    {
      label: 'Ventas totales',
      value: formatMoney(metrics.totalVendido),
      detail: salesTrend === null
        ? 'Sin base para comparar'
        : `${salesTrend > 0 ? '+' : ''}${salesTrend.toFixed(1)}% vs. mes anterior`,
      trend: salesTrend === null ? '' : salesTrend >= 0 ? 'positive' : 'negative',
    },
    { label: 'Costo de mercadería', value: formatMoney(metrics.costoTotal) },
    { label: 'Margen bruto', value: formatMoney(metrics.margenBruto), detail: `${formatPercent(metrics.margenPorcentaje)} de las ventas` },
    { label: 'Comisiones vendedores', value: formatMoney(metrics.comisiones), detail: `${formatPercent(metrics.comisionPorcentaje)} sobre ventas` },
    { label: 'Ganancia operativa', value: formatMoney(metrics.gananciaOperativa) },
    { label: 'Gastos fijos operativos', value: formatMoney(metrics.gastosFijos) },
    { label: 'Gastos variables operativos', value: formatMoney(metrics.gastosVariables) },
    { label: 'Resultado final NOWIN', value: formatMoney(metrics.resultadoFinal), detail: `${formatPercent(metrics.resultadoPorcentaje)} de las ventas`, featured: true },
    {
      label: 'Punto de equilibrio',
      value: metrics.puntoEquilibrio === null ? '—' : formatMoney(metrics.puntoEquilibrio),
      detail: metrics.puntoEquilibrio === null ? 'Sin margen positivo' : 'Ventas necesarias para cubrir gastos',
    },
    {
      label: 'Meta de ventas mensual',
      value: metrics.metaVentas > 0 ? formatMoney(metrics.metaVentas) : 'Sin definir',
    },
    {
      label: 'Ventas faltantes',
      value: metrics.ventasFaltantes === null ? '—' : formatMoney(metrics.ventasFaltantes),
      detail: metrics.ventasFaltantes === null ? 'Definí una meta mensual' : metrics.ventasFaltantes === 0 ? 'Meta alcanzada' : 'Para alcanzar la meta',
    },
  ];
  const isEmpty = [
    metrics.totalVendido,
    metrics.costoTotal,
    metrics.comisiones,
    metrics.gastosFijos,
    metrics.gastosVariables,
  ].every((value) => Number(value) === 0) && !monthlyClosing;

  const updateClosingDraft = (field) => (event) => {
    setClosingDraft((current) => ({ ...current, [field]: event.target.value }));
  };
  const submitClosing = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(Object.entries(closingDraft).map(([key, value]) => [key, Number(value)]));
    if (Object.values(values).some((value) => !Number.isFinite(value) || value < 0)) {
      onValidationError('Completá todos los importes del cierre con valores válidos mayores o iguales a cero.');
      return;
    }
    if (await onSaveClosing({ ...values, actualizadoPor: updatedBy })) setShowClosingForm(false);
  };

  return (
    <section className="admin-tab-content" aria-labelledby="admin-summary-title">
      <div className="admin-section-heading">
        <div>
          <h2 id="admin-summary-title">Resumen gerencial</h2>
          <p>{metrics.isMonthlyClosing ? 'Indicadores del cierre agregado del mes seleccionado.' : 'Indicadores de ventas confirmadas y gastos del mes seleccionado.'}</p>
        </div>
        <div className="admin-export-actions">
          <button type="button" className="admin-secondary-button admin-export-button" onClick={onExportWorkbook} disabled={busy}>
            <Download size={16} aria-hidden="true" />
            Generar Excel
          </button>
          <small>Incluye el mes activo, inventario, gastos, hasta 500 ventas recientes y 100 movimientos de stock.</small>
        </div>
      </div>
      <div className="admin-kpi-grid">
        {cards.map((card) => (
          <article className={`admin-kpi${card.featured ? ' admin-kpi-featured' : ''}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            {card.detail && <small className={card.trend ? `admin-kpi-trend admin-kpi-trend-${card.trend}` : ''}>{card.detail}</small>}
          </article>
        ))}
      </div>
      <section className="admin-closing-panel" aria-label="Cierre agregado del mes">
        <div className="admin-closing-heading">
          <div>
            <h3>Cierre agregado · {month}</h3>
            <p>Guarda un resumen de planilla sin crear ventas, gastos ni movimientos de stock.</p>
          </div>
          <button type="button" className="admin-secondary-button" aria-expanded={showClosingForm} onClick={() => setShowClosingForm((open) => !open)}>
            {monthlyClosing ? 'Editar cierre' : 'Cargar cierre'}
          </button>
        </div>
        {monthlyClosing && (
          <p className="admin-closing-status" role="status">
            Cierre agregado activo; reemplaza los totales transaccionales de este mes en el resumen. Fuente: {monthlyClosing.fuente || 'carga manual'}.
          </p>
        )}
        {showClosingForm && (
          <form className="admin-action-form" onSubmit={submitClosing}>
            <div className="admin-form-grid">
              <label>Ventas totales<input type="number" min="0" step="0.01" value={closingDraft.ventasTotales} onChange={updateClosingDraft('ventasTotales')} required /></label>
              <label>Costo de mercadería<input type="number" min="0" step="0.01" value={closingDraft.costoMercaderia} onChange={updateClosingDraft('costoMercaderia')} required /></label>
              <label>Comisiones vendedores<input type="number" min="0" step="0.01" value={closingDraft.comisionesVendedores} onChange={updateClosingDraft('comisionesVendedores')} required /></label>
              <label>Gastos fijos operativos<input type="number" min="0" step="0.01" value={closingDraft.gastosFijosOperativos} onChange={updateClosingDraft('gastosFijosOperativos')} required /></label>
              <label>Gastos variables operativos<input type="number" min="0" step="0.01" value={closingDraft.gastosVariablesOperativos} onChange={updateClosingDraft('gastosVariablesOperativos')} required /></label>
              <label>Meta de ventas mensual<input type="number" min="0" step="0.01" value={closingDraft.metaVentasMensual} onChange={updateClosingDraft('metaVentasMensual')} required /></label>
            </div>
            <p className="admin-closing-help">Margen, porcentajes, resultado, punto de equilibrio y ventas faltantes se calculan a partir de estos importes.</p>
            <div className="admin-form-actions">
              <button type="button" className="admin-secondary-button" onClick={() => setShowClosingForm(false)}>Cancelar</button>
              <button type="submit" className="admin-primary-button">Guardar cierre agregado</button>
            </div>
          </form>
        )}
      </section>
      {isEmpty && (
        <section className="admin-empty-guide" aria-labelledby="admin-empty-guide-title">
          <div>
            <span className="admin-empty-guide-eyebrow">PRIMEROS PASOS</span>
            <h3 id="admin-empty-guide-title">Todavía no hay movimientos este mes</h3>
            <p>Elegí una acción para empezar a completar el resumen del negocio.</p>
          </div>
          <div className="admin-empty-guide-actions">
            <button type="button" className="admin-primary-button" onClick={() => onNavigate('sales')}>Cargar primera venta</button>
            <button type="button" className="admin-secondary-button" onClick={() => onNavigate('expenses')}>Registrar un gasto</button>
            <button type="button" className="admin-secondary-button" onClick={() => onNavigate('import')}>Abrir importador</button>
          </div>
        </section>
      )}
      <section className="admin-goal-panel" aria-label="Avance de meta mensual">
        <div className="admin-goal-heading">
          <div><span>Meta de ventas mensual</span><strong>{formatMoney(metrics.totalVendido)} / {metrics.metaVentas ? formatMoney(metrics.metaVentas) : 'Sin definir'}</strong></div>
          <b>{metrics.avanceMeta.toFixed(0)}%</b>
        </div>
        <div className="admin-progress-track"><span style={{ width: `${metrics.avanceMeta}%` }} /></div>
        <form className="admin-inline-form" onSubmit={(event) => { event.preventDefault(); onSaveGoal(Number(goal)); }}>
          <label>Definir meta<input type="number" min="0" step="1" value={goal} onChange={(event) => setGoal(event.target.value)} required /></label>
          <button type="submit" className="admin-primary-button">Guardar meta</button>
        </form>
      </section>
    </section>
  );
};

const InventoryTab = ({ inventory, movements, onSavePrice, onSaveActive, onAdjustStock, onSaveFinancialData, onValidationError }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [stockFilter, setStockFilter] = useState('all');
  const [lowStockLimit, setLowStockLimit] = useState('5');
  const [priceDrafts, setPriceDrafts] = useState({});
  const [financeProduct, setFinanceProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState('');
  const [adjustType, setAdjustType] = useState('reposicion');
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const threshold = Number(lowStockLimit);
  const getPrice = (product) => Number(product.precio ?? product.price);
  const getStock = (product) => Number(product.financial?.stockActual);
  const lowStockCount = inventory.filter((product) => product.financial && getStock(product) <= threshold).length;
  const criticalStockCount = inventory.filter((product) => product.financial && getStock(product) <= 2).length;
  const noPriceCount = inventory.filter((product) => !Number.isFinite(getPrice(product)) || getPrice(product) <= 0).length;
  const filtered = inventory.filter((product) => {
    const matchesText = `${productName(product)} ${productCategory(product)}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Todas' || productCategory(product) === category;
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && product.financial && getStock(product) <= threshold) ||
      (stockFilter === 'critical' && product.financial && getStock(product) <= 2) ||
      (stockFilter === 'no-price' && (!Number.isFinite(getPrice(product)) || getPrice(product) <= 0));
    return matchesText && matchesCategory && matchesStock;
  });
  const categories = [...new Set(inventory.map(productCategory).filter(Boolean))];

  const handlePriceSave = async (product) => {
    const price = Number(priceDrafts[product.id] ?? product.precio ?? product.price);
    if (!Number.isFinite(price) || price < 0) {
      onValidationError('Ingresá un precio válido.');
      return;
    }
    if (!await onSavePrice(product.id, price)) return;
    setPriceDrafts((drafts) => {
      const next = { ...drafts };
      delete next[product.id];
      return next;
    });
  };

  return (
    <section className="admin-tab-content">
      <div className="admin-section-heading">
        <div>
          <h2>Inventario y precios</h2>
          <p>El precio y el estado activo se sincronizan con la vidriera.</p>
        </div>
        {lowStockCount > 0 && <span className="admin-low-stock-summary">{lowStockCount} producto{lowStockCount === 1 ? '' : 's'} con stock bajo</span>}
      </div>
      <div className="admin-toolbar">
        <input type="search" aria-label="Buscar producto" placeholder="Buscar por nombre o categoría…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filtrar categoría" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="Todas">Todas las categorías</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="admin-threshold-field">Alerta de stock bajo ≤<input type="number" min="0" value={lowStockLimit} onChange={(event) => setLowStockLimit(event.target.value)} /></label>
      </div>
      <div className="admin-filter-bar" role="group" aria-label="Filtros rápidos de inventario">
        <button type="button" className={stockFilter === 'all' ? 'active' : ''} aria-pressed={stockFilter === 'all'} onClick={() => setStockFilter('all')}>Todos <span>{inventory.length}</span></button>
        <button type="button" className={stockFilter === 'low' ? 'active' : ''} aria-pressed={stockFilter === 'low'} onClick={() => setStockFilter('low')}>Stock bajo <span>{lowStockCount}</span></button>
        <button type="button" className={stockFilter === 'critical' ? 'active' : ''} aria-pressed={stockFilter === 'critical'} onClick={() => setStockFilter('critical')}>Crítico <span>{criticalStockCount}</span></button>
        <button type="button" className={stockFilter === 'no-price' ? 'active' : ''} aria-pressed={stockFilter === 'no-price'} onClick={() => setStockFilter('no-price')}>Sin precio <span>{noPriceCount}</span></button>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Costo</th><th>Stock actual</th><th>Activo</th><th>Acciones</th></tr></thead>
          <tbody>
            {filtered.map((product) => {
              const stock = getStock(product);
              const stockClass = !product.financial
                ? 'admin-stock-badge-missing'
                : stock < 0
                  ? 'admin-stock-badge-negative'
                  : stock <= 2
                    ? 'admin-stock-badge-critical'
                    : stock <= threshold
                      ? 'admin-stock-badge-low'
                      : 'admin-stock-badge-ok';
              const stockLabel = !product.financial
                ? 'Sin cargar'
                : stock < 0
                  ? `${stock} · Negativo`
                  : stock <= 2
                    ? `${stock} · Crítico`
                    : stock <= threshold
                      ? `${stock} · Bajo`
                      : String(stock);
              return (
                <tr key={product.id}>
                  <td>{productName(product)}</td>
                  <td>{productCategory(product)}</td>
                  <td>
                    <div className="admin-price-editor">
                      <input type="number" min="0" step="1" aria-label={`Precio de ${productName(product)}`} value={priceDrafts[product.id] ?? product.precio ?? product.price ?? ''} onChange={(event) => setPriceDrafts((drafts) => ({ ...drafts, [product.id]: event.target.value }))} />
                      <button type="button" onClick={() => handlePriceSave(product)}>Guardar</button>
                    </div>
                  </td>
                  <td>{product.financial ? formatMoney(product.financial.costoProduccion) : <button type="button" className="admin-text-button" onClick={() => setFinanceProduct(product)}>Completar datos</button>}</td>
                  <td><span className={`admin-stock-badge ${stockClass}`}>{stockLabel}</span></td>
                  <td><label className="admin-switch"><input type="checkbox" checked={product.activo === true} onChange={(event) => onSaveActive(product.id, event.target.checked)} /><span>{product.activo ? 'Sí' : 'No'}</span></label></td>
                  <td><button type="button" className="admin-secondary-button" onClick={() => setAdjustProduct(product.id)}>Reposición / ajuste</button></td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan="7" className="admin-empty-row">No hay productos que coincidan con el filtro.</td></tr>}
          </tbody>
        </table>
      </div>

      {financeProduct && (
        <FinancialDataForm
          product={financeProduct}
          onValidationError={onValidationError}
          onCancel={() => setFinanceProduct(null)}
          onSave={async (values) => {
            if (await onSaveFinancialData(financeProduct.id, values)) setFinanceProduct(null);
          }}
        />
      )}

      {adjustProduct && (
        <form
          className="admin-action-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!await onAdjustStock({ productId: adjustProduct, type: adjustType, delta: Number(adjustDelta), reason: adjustReason })) return;
            setAdjustProduct('');
            setAdjustDelta('');
            setAdjustReason('');
          }}
        >
          <h3>Registrar movimiento de stock</h3>
          <p>{productName(inventory.find((item) => item.id === adjustProduct) || {})}</p>
          <label>Tipo<select value={adjustType} onChange={(event) => setAdjustType(event.target.value)}><option value="reposicion">Reposición</option><option value="ajuste">Ajuste</option></select></label>
          <label>{adjustType === 'reposicion' ? 'Unidades a ingresar' : 'Variación (+/-)'}<input type="number" step="1" value={adjustDelta} onChange={(event) => setAdjustDelta(event.target.value)} required /></label>
          <label>Motivo<input value={adjustReason} onChange={(event) => setAdjustReason(event.target.value)} required /></label>
          <div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={() => setAdjustProduct('')}>Cancelar</button><button type="submit" className="admin-primary-button">Guardar movimiento</button></div>
        </form>
      )}

      <section className="admin-history">
        <h3>Últimos movimientos de stock</h3>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Variación</th><th>Stock final</th><th>Motivo</th></tr></thead>
            <tbody>{movements.slice(0, 20).map((movement) => <tr key={movement.id}><td>{asDate(movement.fecha)?.toLocaleString('es-AR') || '—'}</td><td>{movement.nombreProducto}</td><td>{movement.tipo}</td><td>{movement.delta}</td><td>{movement.stockNuevo}</td><td>{movement.motivo}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

const FinancialDataForm = ({ product, onSave, onCancel, onValidationError }) => {
  const [values, setValues] = useState({
    costoProduccion: '',
    comisionDefault: '0',
    stockInicial: '',
    unidadesVendidas: '0',
    stockActual: '',
  });
  const setField = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  return (
    <form className="admin-action-form" onSubmit={async (event) => {
      event.preventDefault();
      const numbers = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)]));
      if (Object.values(numbers).some((value) => !Number.isFinite(value)) ||
        numbers.costoProduccion < 0 || numbers.stockInicial < 0 || numbers.unidadesVendidas < 0 ||
        !Number.isInteger(numbers.stockInicial) || !Number.isInteger(numbers.unidadesVendidas) || !Number.isInteger(numbers.stockActual) ||
        !COMMISSION_OPTIONS.includes(numbers.comisionDefault)) {
        onValidationError('Revisá costo, comisión y unidades; los campos deben contener valores válidos.');
        return;
      }
      await onSave(numbers);
    }}>
      <h3>Completar datos privados · {productName(product)}</h3>
      <div className="admin-form-grid">
        <label>Costo de producción<input type="number" min="0" step="0.01" value={values.costoProduccion} onChange={setField('costoProduccion')} required /></label>
        <label>Comisión predeterminada<select value={values.comisionDefault} onChange={setField('comisionDefault')}>{COMMISSION_OPTIONS.map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></label>
        <label>Stock inicial<input type="number" min="0" step="1" value={values.stockInicial} onChange={setField('stockInicial')} required /></label>
        <label>Unidades vendidas<input type="number" min="0" step="1" value={values.unidadesVendidas} onChange={setField('unidadesVendidas')} required /></label>
        <label>Stock actual<input type="number" step="1" value={values.stockActual} onChange={setField('stockActual')} required /></label>
      </div>
      <div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={onCancel}>Cancelar</button><button type="submit" className="admin-primary-button">Guardar</button></div>
    </form>
  );
};

const SalesTab = ({ inventory, sales, onCreateSale, onConfirm, onCancel, onValidationError }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [seller, setSeller] = useState('');
  const [customer, setCustomer] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [commissionRate, setCommissionRate] = useState('0');
  const [originFilter, setOriginFilter] = useState('all');
  const selectedProduct = inventory.find((product) => product.id === productId);
  const selectedPrice = Number(selectedProduct?.precio ?? selectedProduct?.price ?? 0);
  const selectedCost = Number(selectedProduct?.financial?.costoProduccion || 0);
  const saleQuantity = Number(quantity) || 0;
  const commission = selectedPrice * saleQuantity * Number(commissionRate) / 100;
  const visibleSales = sales.filter((sale) => originFilter === 'all' || sale.origen === originFilter);
  const availableProducts = inventory.filter((product) => product.financial && product.activo === true);

  return (
    <section className="admin-tab-content">
      <div className="admin-section-heading"><div><h2>Ventas</h2><p>Ventas manuales y pedidos recibidos por la tienda.</p></div></div>
      <form className="admin-action-form" onSubmit={async (event) => {
        event.preventDefault();
        if (!selectedProduct || !seller.trim() || !customer.trim() || saleQuantity < 1 || !Number.isInteger(saleQuantity)) {
          onValidationError('Completá vendedor, cliente, producto y una cantidad válida.');
          return;
        }
        if (!await onCreateSale({
          date,
          seller,
          customer,
          items: [{ productoId: selectedProduct.id, nombreProducto: productName(selectedProduct), cantidad: saleQuantity }],
          commissionRate: Number(commissionRate),
        })) return;
        setCustomer('');
        setQuantity('1');
      }}>
        <h3>Carga rápida de venta manual</h3>
        <div className="admin-form-grid">
          <label>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label>Vendedor<input value={seller} onChange={(event) => setSeller(event.target.value)} placeholder="Nombre del vendedor" required /></label>
          <label>Cliente<input value={customer} onChange={(event) => setCustomer(event.target.value)} required /></label>
          <label>Producto<select value={productId} onChange={(event) => setProductId(event.target.value)} required><option value="">Seleccionar producto</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{productName(product)} · {formatMoney(product.precio ?? product.price)}</option>)}</select></label>
          <label>Cantidad<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
          <label>Comisión<select value={commissionRate} onChange={(event) => setCommissionRate(event.target.value)}>{COMMISSION_OPTIONS.map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></label>
        </div>
        <div className="admin-sale-preview">
          <span>Total vendido <strong>{formatMoney(selectedPrice * saleQuantity)}</strong></span>
          <span>Costo total <strong>{formatMoney(selectedCost * saleQuantity)}</strong></span>
          <span>Comisión <strong>{formatMoney(commission)}</strong></span>
          <span>Ganancia NOWIN <strong>{formatMoney((selectedPrice - selectedCost) * saleQuantity - commission)}</strong></span>
        </div>
        <button type="submit" className="admin-primary-button">Registrar venta y descontar stock</button>
      </form>

      <div className="admin-section-heading admin-sales-list-heading">
        <h3>Ventas recientes</h3>
        <label>Origen<select value={originFilter} onChange={(event) => setOriginFilter(event.target.value)}><option value="all">Todos</option><option value="web">Automática web</option><option value="manual">Manual</option></select></label>
      </div>
      <div className="admin-record-list" aria-label="Ventas recientes">
        {visibleSales.map((sale) => (
          <article className="admin-record-row" key={sale.id}>
            <div className="admin-record-leading">
              <span className="admin-record-kicker">{sale.origen === 'web' ? 'Pedido web' : 'Venta manual'} · {sale.vendedor || 'Sin vendedor'}</span>
              <strong>{sale.cliente || 'Venta sin cliente'}</strong>
              <span>{asDate(sale.fecha)?.toLocaleString('es-AR') || 'Fecha pendiente'}</span>
            </div>
            <div className="admin-record-trailing">
              <span className={`admin-status admin-status-${sale.estado}`}>{sale.estado}</span>
              <strong className="admin-record-amount">{formatMoney(sale.totalVendido)}</strong>
              <div className="admin-actions-cell">
                {sale.estado === 'pendiente' && <button type="button" className="admin-primary-button" onClick={() => onConfirm(sale.id)}>Confirmar</button>}
                {sale.estado !== 'anulada' && <button type="button" className="admin-danger-button" onClick={() => {
                  if (window.confirm('¿Anular esta venta? Si estaba confirmada, el stock se reintegrará.')) onCancel(sale.id);
                }}>Anular</button>}
              </div>
            </div>
          </article>
        ))}
        {!visibleSales.length && <p className="admin-record-empty">Todavía no hay ventas registradas.</p>}
      </div>
      <p className="admin-table-footnote">Se muestran las 500 ventas más recientes.</p>
    </section>
  );
};

const ExpensesTab = ({ fixedExpenses, variableExpenses, month, onSaveFixed, onSaveVariable, onRemove }) => {
  const [fixed, setFixed] = useState({ concepto: '', montoMensual: '', observaciones: '', pagado: false, impactaResultado: true });
  const [variable, setVariable] = useState({ fecha: `${month}-01`, concepto: '', monto: '', observaciones: '' });
  const [showFixedForm, setShowFixedForm] = useState(false);
  const [showVariableForm, setShowVariableForm] = useState(false);

  useEffect(() => setVariable((current) => ({ ...current, fecha: `${month}-01` })), [month]);

  return (
    <section className="admin-tab-content">
      <div className="admin-section-heading">
        <div><h2>Gastos fijos y variables</h2><p>Administrá gastos recurrentes y movimientos del mes.</p></div>
        <div className="admin-quick-actions">
          <button type="button" className="admin-secondary-button" aria-expanded={showFixedForm} onClick={() => setShowFixedForm((open) => !open)}>+ Gasto fijo</button>
          <button type="button" className="admin-primary-button" aria-expanded={showVariableForm} onClick={() => setShowVariableForm((open) => !open)}>+ Gasto variable</button>
        </div>
      </div>

      {showFixedForm && (
        <form className="admin-action-form" onSubmit={async (event) => {
          event.preventDefault();
          if (!await onSaveFixed(null, { ...fixed, montoMensual: Number(fixed.montoMensual) })) return;
          setFixed({ concepto: '', montoMensual: '', observaciones: '', pagado: false, impactaResultado: true });
          setShowFixedForm(false);
        }}>
          <h3>Agregar gasto fijo mensual</h3>
          <div className="admin-form-grid">
            <label>Concepto<input value={fixed.concepto} onChange={(event) => setFixed({ ...fixed, concepto: event.target.value })} required /></label>
            <label>Monto mensual<input type="number" min="0" step="0.01" value={fixed.montoMensual} onChange={(event) => setFixed({ ...fixed, montoMensual: event.target.value })} required /></label>
            <label>Observaciones<input value={fixed.observaciones} onChange={(event) => setFixed({ ...fixed, observaciones: event.target.value })} /></label>
            <label className="admin-check-field"><input type="checkbox" checked={fixed.pagado} onChange={(event) => setFixed({ ...fixed, pagado: event.target.checked })} /> Pagado</label>
            <label className="admin-check-field"><input type="checkbox" checked={fixed.impactaResultado} onChange={(event) => setFixed({ ...fixed, impactaResultado: event.target.checked })} /> Impacta resultado</label>
          </div>
          <div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={() => setShowFixedForm(false)}>Cancelar</button><button type="submit" className="admin-primary-button">Guardar gasto fijo</button></div>
        </form>
      )}

      <section className="admin-history">
        <h3>Gastos fijos mensuales</h3>
        <div className="admin-record-list">
          {fixedExpenses.map((expense) => (
            <article className="admin-record-row" key={expense.id}>
              <div className="admin-record-leading">
                <span className="admin-record-kicker">Gasto fijo mensual</span>
                <strong>{expense.concepto}</strong>
                <span>{expense.observaciones || 'Sin observaciones'}</span>
              </div>
              <div className="admin-record-trailing">
                <strong className="admin-record-amount">{formatMoney(expense.montoMensual)}</strong>
                <div className="admin-expense-controls">
                  <label><input aria-label={`Pagado: ${expense.concepto}`} type="checkbox" checked={Boolean(expense.pagado)} onChange={(event) => onSaveFixed(expense.id, { pagado: event.target.checked })} /> Pagado</label>
                  <label><input aria-label={`Impacta resultado: ${expense.concepto}`} type="checkbox" checked={Boolean(expense.impactaResultado)} onChange={(event) => onSaveFixed(expense.id, { impactaResultado: event.target.checked })} /> Impacta</label>
                  <button type="button" className="admin-danger-button" onClick={() => onRemove('gastosFijos', expense.id)}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
          {!fixedExpenses.length && <p className="admin-record-empty">Todavía no hay gastos fijos cargados.</p>}
        </div>
      </section>

      {showVariableForm && (
        <form className="admin-action-form" onSubmit={async (event) => {
          event.preventDefault();
          if (!await onSaveVariable({ ...variable, monto: Number(variable.monto), fecha: new Date(`${variable.fecha}T12:00:00`) })) return;
          setVariable({ ...variable, concepto: '', monto: '', observaciones: '' });
          setShowVariableForm(false);
        }}>
          <h3>Registrar gasto variable</h3>
          <div className="admin-form-grid">
            <label>Fecha<input type="date" value={variable.fecha} onChange={(event) => setVariable({ ...variable, fecha: event.target.value })} required /></label>
            <label>Concepto<input value={variable.concepto} onChange={(event) => setVariable({ ...variable, concepto: event.target.value })} required /></label>
            <label>Monto<input type="number" min="0" step="0.01" value={variable.monto} onChange={(event) => setVariable({ ...variable, monto: event.target.value })} required /></label>
            <label>Observaciones<input value={variable.observaciones} onChange={(event) => setVariable({ ...variable, observaciones: event.target.value })} /></label>
          </div>
          <div className="admin-form-actions"><button type="button" className="admin-secondary-button" onClick={() => setShowVariableForm(false)}>Cancelar</button><button type="submit" className="admin-primary-button">Guardar gasto variable</button></div>
        </form>
      )}

      <section className="admin-history">
        <h3>Gastos variables · {month}</h3>
        <div className="admin-record-list">
          {variableExpenses.map((expense) => (
            <article className="admin-record-row" key={expense.id}>
              <div className="admin-record-leading">
                <span className="admin-record-kicker">Gasto variable · {asDate(expense.fecha)?.toLocaleDateString('es-AR') || 'Fecha pendiente'}</span>
                <strong>{expense.concepto}</strong>
                <span>{expense.observaciones || 'Sin observaciones'}</span>
              </div>
              <div className="admin-record-trailing">
                <strong className="admin-record-amount">{formatMoney(expense.monto)}</strong>
                <button type="button" className="admin-danger-button" onClick={() => onRemove('gastosVariables', expense.id)}>Eliminar</button>
              </div>
            </article>
          ))}
          {!variableExpenses.length && <p className="admin-record-empty">No hay gastos variables para este mes.</p>}
        </div>
      </section>
    </section>
  );
};

const ImportTab = ({ onImport }) => {
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrors([]);
    setProducts([]);
    setFileName(file.name);
    try {
      const result = await parseProductImport(file);
      setProducts(result.products);
      setErrors(result.errors);
    } catch (error) {
      console.error('No se pudo leer el archivo de importación.', error);
      setErrors([error instanceof Error ? error.message : 'No se pudo leer el archivo.']);
    }
  };

  return (
    <section className="admin-tab-content">
      <div className="admin-section-heading"><div><h2>Importador inicial</h2><p>Importá JSON o CSV. Los costos y el stock se guardan en la colección privada.</p></div></div>
      <div className="admin-import-card">
        <label className="admin-file-input">Seleccionar archivo JSON o CSV<input type="file" accept=".json,.csv,application/json,text/csv" onChange={handleFile} /></label>
        <p>Campos obligatorios: nombre, categoria, precio, costoProduccion, comisionDefault, stockInicial, unidadesVendidas, stockActual y activo. Categorías: Sales, Especias, Repostería. Comisión: 0, 10, 15, 20, 25 o 30.</p>
        {fileName && <strong>{fileName} · {products.length} producto(s) válidos</strong>}
        {errors.length > 0 && <ul className="admin-import-errors" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
        {products.length > 0 && (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Costo</th><th>Stock</th><th>Activo</th></tr></thead>
                <tbody>{products.slice(0, 10).map((product, index) => <tr key={`${product.id || product.nombre}-${index}`}><td>{product.nombre}</td><td>{product.categoria}</td><td>{formatMoney(product.precio)}</td><td>{formatMoney(product.costoProduccion)}</td><td>{product.stockActual}</td><td>{product.activo ? 'Sí' : 'No'}</td></tr>)}</tbody>
              </table>
            </div>
            {products.length > 10 && <p>Vista previa de 10 de {products.length} productos.</p>}
            <button type="button" className="admin-primary-button" onClick={() => onImport(products)}>Importar {products.length} producto(s)</button>
          </>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;
