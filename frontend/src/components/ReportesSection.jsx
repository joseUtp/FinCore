import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Plus, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  BarChart2, 
  ShieldAlert,
  Info
} from 'lucide-react';

const DEFAULT_HISTORY = [
  { name: 'Ene', Ingresos: 95000, Egresos: 62000 },
  { name: 'Feb', Ingresos: 108000, Egresos: 71000 },
  { name: 'Mar', Ingresos: 115000, Egresos: 75000 },
  { name: 'Abr', Ingresos: 121000, Egresos: 83000 },
  { name: 'May', Ingresos: 118000, Egresos: 79000 },
  { name: 'Jun', Ingresos: 124500, Egresos: 78250 }
];

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

const ReportesSection = () => {
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [initialBalance, setInitialBalance] = useState(47180.00);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Simulation Controls
  const [horizon, setHorizon] = useState(6); // 3, 6, 12 months
  const [growthRate, setGrowthRate] = useState(3.5); // Monthly sales growth % (-15% to 15%)
  const [expenseRate, setExpenseRate] = useState(1.5); // Monthly expense increase % (-15% to 15%)
  
  // Simulated Events
  const [simulatedEvents, setSimulatedEvents] = useState([
    { id: 1, type: 'INGRESO', description: 'Cobro de Contrato Anual', amount: 35000, month: 3 },
    { id: 2, type: 'EGRESO', description: 'Renovación de Infraestructura Cloud', amount: 12000, month: 2 }
  ]);

  // Form state for new simulated event
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState('EGRESO');
  const [newEventAmount, setNewEventAmount] = useState('');
  const [newEventMonth, setNewEventMonth] = useState('1');

  // Chart view: 'balance' (Saldo Acumulado) or 'flow' (Flujo Mensual)
  const [chartTab, setChartTab] = useState('balance');

  useEffect(() => {
    // Intentar cargar datos reales del dashboard
    Promise.all([
      fetch('/api/dashboard/charts').then(res => res.json()).catch(() => null),
      fetch('/api/dashboard/stats').then(res => res.json()).catch(() => null)
    ])
    .then(([chartsResult, statsResult]) => {
      if (chartsResult && chartsResult.monthly && chartsResult.monthly.length > 0) {
        setHistory(chartsResult.monthly);
      }
      if (statsResult) {
        const saldoStat = statsResult.find(s => s.title === "Saldo Actual");
        if (saldoStat) {
          const parsedVal = parseFloat(saldoStat.value.replace(/,/g, ''));
          if (!isNaN(parsedVal)) {
            setInitialBalance(parsedVal);
          }
        }
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching dashboard data for simulation:', err);
      setLoading(false);
    });
  }, []);

  // Determine starting point for future months based on history
  const lastHistoryItem = history[history.length - 1];
  const lastMonthName = lastHistoryItem ? lastHistoryItem.name : 'Jun';
  const lastMonthIdx = MONTH_NAMES.indexOf(lastMonthName);
  const startMonthIdx = lastMonthIdx !== -1 ? (lastMonthIdx + 1) % 12 : 6; // default Jul

  // Helper to map index to month name (e.g. Month 1 = Jul, Month 2 = Ago...)
  const getFutureMonthName = (monthOffset) => {
    const idx = (startMonthIdx + monthOffset - 1) % 12;
    return MONTH_NAMES[idx];
  };

  // 1. Back-calculate historical balances for continuity
  let tempBalance = initialBalance;
  const historyWithBalance = [];
  for (let i = history.length - 1; i >= 0; i--) {
    const netFlow = history[i].Ingresos - history[i].Egresos;
    historyWithBalance.unshift({
      ...history[i],
      Saldo: tempBalance,
      isProjected: false
    });
    tempBalance -= netFlow;
  }

  // 2. Project future months
  const lastIngresos = lastHistoryItem ? lastHistoryItem.Ingresos : 124500;
  const lastEgresos = lastHistoryItem ? lastHistoryItem.Egresos : 78250;
  
  let prevBalance = initialBalance;
  const projections = [];
  
  for (let i = 1; i <= horizon; i++) {
    const name = getFutureMonthName(i);
    
    // Growth formula (compounded monthly)
    let ingresos = lastIngresos * Math.pow(1 + growthRate / 100, i);
    let egresos = lastEgresos * Math.pow(1 + expenseRate / 100, i);
    
    // Add custom events
    const monthEvents = simulatedEvents.filter(e => parseInt(e.month) === i);
    monthEvents.forEach(e => {
      if (e.type === 'INGRESO') {
        ingresos += e.amount;
      } else if (e.type === 'EGRESO') {
        egresos += e.amount;
      }
    });
    
    const net = ingresos - egresos;
    const balance = prevBalance + net;
    
    projections.push({
      name: `${name} (Sim)`,
      Ingresos: Math.round(ingresos),
      Egresos: Math.round(egresos),
      Saldo: Math.round(balance),
      isProjected: true
    });
    
    prevBalance = balance;
  }

  // Combined dataset for charts
  const combinedData = [...historyWithBalance, ...projections];

  // Calculations for Key Stats
  const finalProjectedBalance = projections[projections.length - 1]?.Saldo || initialBalance;
  
  // Calculate burn rate as the average projected expense
  const burnRate = projections.reduce((acc, p) => acc + p.Egresos, 0) / horizon;
  
  // Runway = Current Balance / Burn Rate
  const runwayMonths = burnRate > 0 ? (initialBalance / burnRate) : 99;
  
  // Find minimum projected balance to check for insolvency
  const minProjectedBalance = Math.min(...projections.map(p => p.Saldo));
  const insolvencyMonth = projections.find(p => p.Saldo < 0);

  // Health Score Determination
  let healthScore = 'A+';
  let healthColor = 'text-emerald-500 bg-emerald-50 border-emerald-100';
  let healthDesc = 'Flujo de caja óptimo y runway saludable';

  if (minProjectedBalance < 0) {
    healthScore = 'D';
    healthColor = 'text-rose-600 bg-rose-50 border-rose-100';
    healthDesc = 'Riesgo inminente de insolvencia';
  } else if (runwayMonths < 3) {
    healthScore = 'C-';
    healthColor = 'text-amber-600 bg-amber-50 border-amber-100';
    healthDesc = 'Runway ajustado, alta dependencia de cobranzas';
  } else if (runwayMonths < 6) {
    healthScore = 'B';
    healthColor = 'text-blue-600 bg-blue-50 border-blue-100';
    healthDesc = 'Operaciones estables, runway moderado';
  }

  // Handle Event Submissions
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventDesc.trim() || !newEventAmount) return;

    const newEvent = {
      id: Date.now(),
      type: newEventType,
      description: newEventDesc,
      amount: parseFloat(newEventAmount),
      month: parseInt(newEventMonth)
    };

    setSimulatedEvents([...simulatedEvents, newEvent]);
    setNewEventDesc('');
    setNewEventAmount('');
  };

  // Remove event
  const handleRemoveEvent = (id) => {
    setSimulatedEvents(simulatedEvents.filter(e => e.id !== id));
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setGrowthRate(3.5);
    setExpenseRate(1.5);
    setHorizon(6);
    setSimulatedEvents([]);
  };

  // Export report simulator
  const handleExportReport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      
      // Crear contenido de reporte legible y descargarlo
      const reportLines = [
        "================================================",
        "          FINCORE - REPORTE DE SIMULACIÓN        ",
        "================================================",
        `Fecha de Emisión: ${new Date().toLocaleDateString()}`,
        `Saldo Inicial Actual: S/ ${initialBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
        `Horizonte Simulado: ${horizon} meses`,
        `Tasa Proyectada Mensual de Ingresos: ${growthRate}%`,
        `Tasa Proyectada Mensual de Gastos: ${expenseRate}%`,
        "------------------------------------------------",
        "METRICAS DE PRONÓSTICO:",
        `Saldo Final Proyectado: S/ ${finalProjectedBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
        `Burn Rate Promedio Proyectado: S/ ${Math.round(burnRate).toLocaleString('es-PE')} / mes`,
        `Runway de Efectivo Estimado: ${runwayMonths.toFixed(1)} meses`,
        `Salud Financiera Proyectada: ${healthScore} (${healthDesc})`,
        "------------------------------------------------",
        "EVENTOS EXTRAORDINARIOS SIMULADOS:",
        simulatedEvents.length === 0 
          ? "Ninguno registrado." 
          : simulatedEvents.map(e => `* Mes ${e.month} (${getFutureMonthName(e.month)}): [${e.type}] ${e.description} - S/ ${e.amount.toLocaleString('es-PE')}`).join("\n"),
        "================================================"
      ].join("\n");

      const blob = new Blob([reportLines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FinCore_Simulacion_${horizon}m.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  // Custom tooltips for Recharts
  const CustomTooltipCombined = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isProj = payload[0].payload.isProjected;
      return (
        <div className="bg-[#0B0B0B] text-white p-4 rounded-xl border border-zinc-800 shadow-xl text-xs max-w-xs space-y-2">
          <div className="flex justify-between items-center gap-4">
            <span className="font-semibold text-zinc-300">{label}</span>
            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${isProj ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {isProj ? 'Simulación' : 'Histórico'}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-emerald-400 flex justify-between gap-6">
              <span>Ingresos:</span>
              <span className="font-semibold">S/ {payload[0].value.toLocaleString('es-PE')}</span>
            </p>
            <p className="text-rose-400 flex justify-between gap-6">
              <span>Egresos:</span>
              <span className="font-semibold">S/ {payload[1].value.toLocaleString('es-PE')}</span>
            </p>
            <div className="h-px bg-zinc-800 my-1"></div>
            <p className="text-blue-400 flex justify-between gap-6 font-bold">
              <span>Saldo:</span>
              <span>S/ {payload[2].value.toLocaleString('es-PE')}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-10 h-10 text-zinc-400 animate-spin" />
        <p className="text-sm font-medium text-zinc-500">Cargando simulador financiero...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Simulador de Flujo de Caja y Runway</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Proyecta tu flujo neto y simula escenarios de crecimiento de ventas, recortes de gastos y compras de capital.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResetSimulation}
            className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-semibold hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restablecer
          </button>
          <button 
            onClick={handleExportReport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Exportar Reporte
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Saldo Final Proyectado */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Saldo Final Proyectado</span>
            <h3 className="text-2xl font-bold text-zinc-900">
              S/ {finalProjectedBalance.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <span className={`text-[10px] font-bold flex items-center gap-1 ${finalProjectedBalance >= initialBalance ? 'text-emerald-600' : 'text-rose-600'}`}>
              {finalProjectedBalance >= initialBalance ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
              {finalProjectedBalance >= initialBalance ? 'Incremento proyectado' : 'Consumo de efectivo'}
            </span>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
            <Wallet className="w-5 h-5 text-zinc-600" />
          </div>
        </div>

        {/* Card 2: Runway */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Runway Promedio</span>
            <h3 className="text-2xl font-bold text-zinc-900">
              {runwayMonths > 50 ? 'Estable' : `${runwayMonths.toFixed(1)} meses`}
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium">
              Sosteniendo operaciones sin nuevos ingresos
            </span>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
            <Calendar className="w-5 h-5 text-zinc-600" />
          </div>
        </div>

        {/* Card 3: Burn Rate Proyectado */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Burn Rate Promedio</span>
            <h3 className="text-2xl font-bold text-zinc-900">
              S/ {Math.round(burnRate).toLocaleString('es-PE')} <span className="text-xs font-normal text-zinc-400">/ mes</span>
            </h3>
            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Gastos simulados recurrentes
            </span>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
            <TrendingDown className="w-5 h-5 text-rose-500" />
          </div>
        </div>

        {/* Card 4: Salud Financiera */}
        <div className={`p-6 rounded-2xl border flex items-start justify-between transition-all duration-300 ${healthColor}`}>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold opacity-70 uppercase tracking-wider">Salud Financiera Proyectada</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black">{healthScore}</h3>
            </div>
            <p className="text-[10px] font-semibold opacity-85 leading-tight">{healthDesc}</p>
          </div>
          <div className="p-3 bg-white/60 border border-current/10 rounded-xl">
            {healthScore === 'D' ? (
              <ShieldAlert className="w-5 h-5" />
            ) : healthScore === 'C-' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Insolvency Alarm Alert */}
      {insolvencyMonth && (
        <div className="p-5 bg-rose-50/50 border border-rose-200/60 rounded-2xl flex items-start gap-4 animate-pulse">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-950">¡Riesgo de Quiebra de Caja en {insolvencyMonth.name.replace(' (Sim)', '')}!</h4>
            <p className="text-xs text-rose-800/90 leading-relaxed max-w-3xl">
              Bajo las tasas de crecimiento y gastos especificadas, el saldo total acumulado caerá a 
              <strong> S/ {insolvencyMonth.Saldo.toLocaleString('es-PE')}</strong>. Se aconseja incrementar las ventas en un 
              <strong> {Math.max(0, Math.ceil((insolvencyMonth.Egresos - insolvencyMonth.Ingresos) / lastIngresos * 100))}%</strong> o ajustar los egresos en consecuencia.
            </p>
          </div>
        </div>
      )}

      {/* Middle Section: Chart and Control Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts: Left Side (Col span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <h3 className="text-md font-bold text-zinc-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Proyección Gráfica Financiera
            </h3>
            
            {/* Chart Sub Tabs */}
            <div className="bg-zinc-100/80 p-0.5 rounded-lg flex self-start">
              <button 
                onClick={() => setChartTab('balance')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all ${chartTab === 'balance' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                Saldo Acumulado
              </button>
              <button 
                onClick={() => setChartTab('flow')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all ${chartTab === 'flow' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                Ingresos vs Egresos
              </button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-80 w-full flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="projSaldoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717A', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717A', fontSize: 11 }}
                  tickFormatter={(val) => `S/ ${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltipCombined />} cursor={{ fill: '#F9FAFB' }} />
                
                {/* Vertical Divider between History and Simulation */}
                <ReferenceLine 
                  x={`${lastMonthName}`} 
                  stroke="#94A3B8" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  label={{ value: 'SIMULACIÓN ➔', fill: '#64748B', fontSize: 9, position: 'top', fontWeight: 'bold', offset: 12 }} 
                />

                {chartTab === 'balance' ? (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="Saldo" 
                      stroke="#3B82F6" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#projSaldoGradient)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Saldo" 
                      stroke="#1D4ED8" 
                      strokeWidth={2}
                      dot={{ r: 3, stroke: '#1D4ED8', strokeWidth: 1, fill: '#fff' }}
                    />
                  </>
                ) : (
                  <>
                    <Bar dataKey="Ingresos" barSize={18}>
                      {combinedData.map((entry, index) => (
                        <Cell 
                          key={`cell-in-${index}`} 
                          fill="#10B981" 
                          opacity={entry.isProjected ? 0.45 : 0.95} 
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Egresos" barSize={18}>
                      {combinedData.map((entry, index) => (
                        <Cell 
                          key={`cell-eg-${index}`} 
                          fill="#FB7185" 
                          opacity={entry.isProjected ? 0.45 : 0.95} 
                        />
                      ))}
                    </Bar>
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Ingresos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span> Egresos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-500 inline-block relative -top-0.5"></span> Saldo Efectivo
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400 italic">
              (Opaco: Real | Translúcido: Proyección)
            </span>
          </div>
        </div>

        {/* Controls Panel: Right Side (Col span 1) */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-md font-bold text-zinc-900 border-b border-zinc-100 pb-3">Controles del Simulador</h3>
            
            {/* Horizon Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Horizonte de Simulación</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 6, 12].map((months) => (
                  <button
                    key={months}
                    onClick={() => setHorizon(months)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      horizon === months 
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' 
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {months} Meses
                  </button>
                ))}
              </div>
            </div>

            {/* Income growth slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-500 uppercase tracking-wider">Crecimiento Ventas/Ingresos</label>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${growthRate >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {growthRate >= 0 ? '+' : ''}{growthRate}% / mes
                </span>
              </div>
              <input 
                type="range" 
                min="-15" 
                max="15" 
                step="0.5"
                value={growthRate}
                onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-950"
              />
              <div className="flex justify-between text-[9px] text-zinc-400 font-semibold uppercase">
                <span>-15% Caída</span>
                <span>0% Plano</span>
                <span>+15% Alza</span>
              </div>
            </div>

            {/* Expense increase slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-500 uppercase tracking-wider">Aumento Costos/Gastos</label>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${expenseRate <= 1.5 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {expenseRate >= 0 ? '+' : ''}{expenseRate}% / mes
                </span>
              </div>
              <input 
                type="range" 
                min="-15" 
                max="15" 
                step="0.5"
                value={expenseRate}
                onChange={(e) => setExpenseRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-950"
              />
              <div className="flex justify-between text-[9px] text-zinc-400 font-semibold uppercase">
                <span>-15% Ahorro</span>
                <span>0% Plano</span>
                <span>+15% Inflación</span>
              </div>
            </div>
          </div>

          {/* Quick simulation summary card */}
          <div className="mt-8 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/50 flex gap-3 text-xs">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-indigo-900 leading-normal">
              <span className="font-bold block text-indigo-950">Dinámica de Ajustes</span>
              Los cambios en ventas e inflación se componen mensualmente. Ajustar el crecimiento de ventas a un valor positivo incrementa el saldo final exponencialmente en el largo plazo.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Custom Extraordinary Events Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Form: Add Event */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
          <h3 className="text-md font-bold text-zinc-900 border-b border-zinc-100 pb-3 mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" />
            Agregar Evento Extraordinario Proyectado
          </h3>
          
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Descripción del Evento</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Cobro de Factura Final, Compra Servidor, Pago Impuesto"
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipo</label>
                <select 
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-semibold"
                >
                  <option value="INGRESO">Ingreso (S/ +)</option>
                  <option value="EGRESO">Egreso (S/ -)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Monto (S/)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="Monto en Soles"
                  value={newEventAmount}
                  onChange={(e) => setNewEventAmount(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mes de Ocurrencia (Simulado)</label>
                <select 
                  value={newEventMonth}
                  onChange={(e) => setNewEventMonth(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all font-semibold"
                >
                  {Array.from({ length: horizon }).map((_, i) => {
                    const mNum = i + 1;
                    return (
                      <option key={mNum} value={mNum}>
                        Mes {mNum} ({getFutureMonthName(mNum)})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Simular Evento
            </button>
          </form>
        </div>

        {/* List: Events Simulated */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-zinc-900 border-b border-zinc-100 pb-3 mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Eventos Simulados Activos
            </h3>

            {simulatedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <Info className="w-8 h-8 text-zinc-300" />
                <p className="text-xs font-semibold text-zinc-400 max-w-sm">
                  No hay eventos extraordinarios simulados actualmente. Agregue uno a la izquierda para ver su impacto en las curvas financieras.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto max-h-60 pr-1">
                {simulatedEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="p-3.5 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between group hover:border-zinc-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-bold text-[10px] ${event.type === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                        {event.type === 'INGRESO' ? 'ING' : 'EGR'}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-800">{event.description}</span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold">
                          <span>Mes {event.month} ({getFutureMonthName(event.month)})</span>
                          <span>•</span>
                          <span>S/ {event.amount.toLocaleString('es-PE')}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveEvent(event.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50/50 transition-colors"
                      title="Eliminar evento simulado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-100 pt-4 mt-6 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
            <span>Total Eventos Simulados</span>
            <span className="text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-[4px]">{simulatedEvents.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesSection;
