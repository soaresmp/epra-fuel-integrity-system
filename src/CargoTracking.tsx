import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Truck, MapPin, AlertTriangle, CheckCircle, Clock, Activity, Shield, Navigation, Thermometer, Droplets, BarChart3, Eye, X, RefreshCw, AlertCircle, Zap, TrendingDown, Filter, Download } from 'lucide-react';

// ─── TYPES ─────────────────────────────────────────────────────────────────
interface Waypoint { lat: number; lon: number; }

interface TruckAlert {
  id: string;
  type: 'volume_drop' | 'density_shift' | 'route_deviation' | 'unauthorized_stop' | 'temp_anomaly' | 'seal_breach' | 'geofence';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface TruckData {
  id: string;
  plate: string;
  driver: string;
  transporter: string;
  fuelType: 'Diesel' | 'Gasoline' | 'Kerosene';
  depot: string;
  destination: string;
  route: Waypoint[];
  routeProgress: number;
  status: 'loading' | 'in-transit' | 'alert' | 'delivered' | 'idle';
  baselineVolume: number;
  baselineTemp: number;
  baselineDensity: number;
  currentVolume: number;
  currentTemp: number;
  currentDensity: number;
  currentLat: number;
  currentLon: number;
  speed: number;
  dwellTime: number;
  alerts: TruckAlert[];
  sealIntact: boolean;
  geofenceCompliant: boolean;
  loadingTime: string;
  expectedDelivery: string;
  volumeVariancePct: number;
  densityVariancePct: number;
  compartments: string;
  sealNo: string;
  markerConc: number;
}

// ─── MAP PROJECTION ─────────────────────────────────────────────────────────
const MAP = { minLon: 33.9, maxLon: 41.9, minLat: -4.7, maxLat: 4.6 };
const W = 800, H = 600, PAD = 20;

function toSvgX(lon: number) { return PAD + ((lon - MAP.minLon) / (MAP.maxLon - MAP.minLon)) * (W - PAD * 2); }
function toSvgY(lat: number) { return PAD + ((MAP.maxLat - lat) / (MAP.maxLat - MAP.minLat)) * (H - PAD * 2); }

// ─── KENYA OUTLINE ──────────────────────────────────────────────────────────
const KENYA_POLY = [
  [4.6, 34.9], [4.6, 36.0], [4.2, 37.5], [4.5, 38.5],
  [4.4, 41.0], [3.5, 41.9], [1.6, 41.9], [0.5, 41.5],
  [-0.5, 41.5], [-2.0, 41.5], [-4.1, 39.6],
  [-4.7, 38.5], [-3.5, 37.0], [-1.8, 36.9],
  [-1.0, 34.1], [0.0, 33.9], [0.9, 34.1],
  [2.0, 34.0], [3.5, 34.1], [4.2, 34.5], [4.6, 34.9]
].map(([lat, lon]) => `${toSvgX(lon)},${toSvgY(lat)}`).join(' ');

// ─── ROUTES ─────────────────────────────────────────────────────────────────
const ROUTES: Record<string, Waypoint[]> = {
  'msa_nbi': [
    { lat: -4.05, lon: 39.67 }, { lat: -3.5, lon: 39.2 }, { lat: -3.1, lon: 38.9 },
    { lat: -2.6, lon: 38.2 }, { lat: -2.1, lon: 37.8 }, { lat: -1.7, lon: 37.2 },
    { lat: -1.4, lon: 37.0 }, { lat: -1.29, lon: 36.82 }
  ],
  'nbi_nku': [
    { lat: -1.29, lon: 36.82 }, { lat: -1.1, lon: 36.7 }, { lat: -0.85, lon: 36.55 },
    { lat: -0.55, lon: 36.35 }, { lat: -0.30, lon: 36.08 }
  ],
  'nku_eld': [
    { lat: -0.30, lon: 36.08 }, { lat: 0.0, lon: 35.8 }, { lat: 0.3, lon: 35.5 },
    { lat: 0.51, lon: 35.27 }
  ],
  'nbi_eld': [
    { lat: -1.29, lon: 36.82 }, { lat: -0.30, lon: 36.08 }, { lat: 0.0, lon: 35.8 },
    { lat: 0.51, lon: 35.27 }
  ],
  'nbi_ksu': [
    { lat: -1.29, lon: 36.82 }, { lat: -0.30, lon: 36.08 }, { lat: -0.37, lon: 35.6 },
    { lat: -0.25, lon: 35.1 }, { lat: -0.09, lon: 34.77 }
  ],
  'nbi_thk': [
    { lat: -1.29, lon: 36.82 }, { lat: -1.15, lon: 36.9 }, { lat: -1.03, lon: 37.07 }
  ],
  'nbi_mru': [
    { lat: -1.29, lon: 36.82 }, { lat: -1.03, lon: 37.07 }, { lat: -0.5, lon: 37.3 },
    { lat: 0.05, lon: 37.65 }
  ],
  'nbi_nak': [
    { lat: -1.29, lon: 36.82 }, { lat: -0.95, lon: 36.65 }, { lat: -0.55, lon: 36.4 },
    { lat: -0.30, lon: 36.08 }
  ],
  'eld_ksu': [
    { lat: 0.51, lon: 35.27 }, { lat: 0.25, lon: 35.1 }, { lat: 0.1, lon: 34.95 },
    { lat: -0.09, lon: 34.77 }
  ],
  'nbi_karen': [
    { lat: -1.29, lon: 36.82 }, { lat: -1.3, lon: 36.75 }, { lat: -1.32, lon: 36.71 }
  ],
  'msa_malindi': [
    { lat: -4.05, lon: 39.67 }, { lat: -3.5, lon: 39.85 }, { lat: -3.23, lon: 40.12 },
    { lat: -2.8, lon: 40.4 }, { lat: -3.22, lon: 40.12 }
  ],
  'nbi_nyk': [
    { lat: -1.29, lon: 36.82 }, { lat: -0.55, lon: 36.35 }, { lat: -0.30, lon: 36.08 },
    { lat: -0.18, lon: 35.8 }, { lat: -0.09, lon: 34.77 }
  ],
};

// ─── DEPOTS & STATIONS ───────────────────────────────────────────────────────
const DEPOTS = [
  { id: 'DEP-001', name: 'Kipevu (Mombasa)', lat: -4.05, lon: 39.67, color: '#1d4ed8' },
  { id: 'DEP-002', name: 'Nairobi West', lat: -1.29, lon: 36.82, color: '#15803d' },
  { id: 'DEP-003', name: 'Eldoret', lat: 0.51, lon: 35.27, color: '#b45309' },
  { id: 'DEP-004', name: 'Kisumu', lat: -0.09, lon: 34.77, color: '#7c3aed' },
];

const STATIONS = [
  { name: 'Total Westlands', lat: -1.264, lon: 36.805 },
  { name: 'Shell Uhuru Hwy', lat: -1.286, lon: 36.817 },
  { name: 'Rubis Kilimani', lat: -1.290, lon: 36.783 },
  { name: 'Engen Karen', lat: -1.320, lon: 36.708 },
  { name: 'Total Nyali', lat: -4.043, lon: 39.720 },
  { name: 'Shell Moi Ave', lat: -4.060, lon: 39.668 },
  { name: 'Rubis Oginga', lat: -0.092, lon: 34.768 },
  { name: 'Total Milimani', lat: -0.102, lon: 34.762 },
  { name: 'Shell Uganda Rd', lat: 0.514, lon: 35.270 },
  { name: 'Engen Rupa Mall', lat: 0.520, lon: 35.282 },
  { name: 'Total Nakuru', lat: -0.303, lon: 36.080 },
  { name: 'Shell Thika Rd', lat: -1.033, lon: 37.069 },
  { name: 'Total Meru', lat: 0.047, lon: 37.650 },
];

// ─── INTERPOLATION ───────────────────────────────────────────────────────────
function interpolate(route: Waypoint[], progress: number): Waypoint {
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];
  const seg = (route.length - 1) * progress;
  const idx = Math.floor(seg);
  const frac = seg - idx;
  const a = route[Math.min(idx, route.length - 2)];
  const b = route[Math.min(idx + 1, route.length - 1)];
  return { lat: a.lat + (b.lat - a.lat) * frac, lon: a.lon + (b.lon - a.lon) * frac };
}

// ─── DATA GENERATION ─────────────────────────────────────────────────────────
const PLATES = [
  'KCA 123A','KBZ 456B','KCD 789C','KAA 234D','KCB 567E','KBY 890F','KBA 123G','KCC 456H',
  'KDA 789I','KDB 012J','KDC 345K','KDD 678L','KDE 901M','KDF 234N','KDG 567P','KDH 890Q',
  'KEA 123R','KEB 456S','KEC 789T','KED 012U','KEE 345V','KEF 678W','KEG 901X','KEH 234Y',
  'KFA 567Z','KFB 890A','KFC 123B','KFD 456C','KFE 789D','KFF 012E','KFG 345F','KFH 678G',
  'KGA 901H','KGB 234I','KGC 567J','KGD 890K','KGE 123L','KGF 456M','KGG 789N','KGH 012P',
  'KHA 345Q','KHB 678R','KHC 901S','KHD 234T','KHE 567U','KHF 890V','KHG 123W','KHH 456X',
  'KIA 789Y','KIB 012Z'
];
const DRIVERS = [
  'Joseph Kimani','Ahmed Ali','Samuel Korir','Paul Njoroge','Tom Ochieng','John Mutua','Hassan Omar',
  'David Cheruiyot','Peter Kariuki','Mary Wanjiru','James Odhiambo','Anne Muthoni','Ali Hassan',
  'Fatuma Mohamed','Michael Omondi','Lucy Achieng','Daniel Kiptoo','Ruth Chebet','Simon Kamau',
  'Elizabeth Wambui','Patrick Njenga','Jane Njeri','Francis Mwiti','Grace Otieno','David Kiplagat',
  'Sarah Kimani','John Mwangi','Moses Waweru','Catherine Maina','George Otieno','Susan Wanjiku',
  'Robert Mwangi','Alice Njeri','Charles Omondi','Dorothy Achieng','Emmanuel Cheruiyot','Faith Korir',
  'Geoffrey Mutua','Hannah Omar','Isaac Ochieng','Janet Kimani','Kevin Ali','Lilian Njoroge',
  'Martin Korir','Nancy Mutua','Oscar Kariuki','Patricia Wanjiru','Quincy Odhiambo','Rachel Muthoni',
  'Stephen Hassan'
];
const TRANSPORTERS = [
  'KenTrans Logistics Ltd','Coast Fuel Carriers','Rift Valley Transporters','SafeHaul Kenya Ltd',
  'Lake Basin Logistics','Nairobi Bulk Carriers','EPRA Certified Hauliers','Peak Fuel Transport'
];

function rng(seed: number) { return ((seed * 1664525 + 1013904223) & 0xffffffff) / 0xffffffff; }

function generateTrucks(): TruckData[] {
  const truckRouteMap: [string, string, string, string, number][] = [
    // [depot, destination, routeKey, fuelType, baseVol]
    ['Nairobi West', 'Total Westlands', 'nbi_karen', 'Gasoline', 5000],
    ['Nairobi West', 'Shell Uhuru Hwy', 'nbi_karen', 'Diesel', 6000],
    ['Nairobi West', 'Rubis Kilimani', 'nbi_karen', 'Gasoline', 4000],
    ['Nairobi West', 'Engen Karen', 'nbi_karen', 'Diesel', 4500],
    ['Nairobi West', 'Total Nakuru', 'nbi_nak', 'Diesel', 5500],
    ['Nairobi West', 'Total Nakuru', 'nbi_nak', 'Gasoline', 5000],
    ['Nairobi West', 'Shell Thika Rd', 'nbi_thk', 'Diesel', 4000],
    ['Nairobi West', 'Shell Thika Rd', 'nbi_thk', 'Gasoline', 3500],
    ['Nairobi West', 'Total Meru', 'nbi_mru', 'Diesel', 4500],
    ['Nairobi West', 'Total Meru', 'nbi_mru', 'Diesel', 5000],
    ['Nairobi West', 'Shell Uganda Rd', 'nbi_eld', 'Diesel', 5500],
    ['Nairobi West', 'Shell Uganda Rd', 'nbi_eld', 'Gasoline', 5000],
    ['Nairobi West', 'Rubis Oginga', 'nbi_ksu', 'Diesel', 4500],
    ['Nairobi West', 'Rubis Oginga', 'nbi_ksu', 'Gasoline', 4000],
    ['Nairobi West', 'Total Milimani', 'nbi_ksu', 'Diesel', 5000],
    ['Nairobi West', 'Total Milimani', 'nbi_ksu', 'Kerosene', 3000],
    ['Nairobi West', 'Total Westlands', 'nbi_karen', 'Diesel', 5500],
    ['Nairobi West', 'Engen Karen', 'nbi_karen', 'Gasoline', 4000],
    ['Nairobi West', 'Total Nakuru', 'nbi_nak', 'Kerosene', 3500],
    ['Nairobi West', 'Engen Rupa Mall', 'nbi_eld', 'Diesel', 4500],
    ['Kipevu (Mombasa)', 'Total Nyali', 'msa_nbi', 'Diesel', 5200],
    ['Kipevu (Mombasa)', 'Shell Moi Ave', 'msa_nbi', 'Gasoline', 6000],
    ['Kipevu (Mombasa)', 'Total Nyali', 'msa_nbi', 'Kerosene', 3000],
    ['Kipevu (Mombasa)', 'Shell Moi Ave', 'msa_nbi', 'Diesel', 5500],
    ['Kipevu (Mombasa)', 'Total Westlands', 'msa_nbi', 'Gasoline', 5000],
    ['Kipevu (Mombasa)', 'Shell Uhuru Hwy', 'msa_nbi', 'Diesel', 5500],
    ['Kipevu (Mombasa)', 'Rubis Kilimani', 'msa_nbi', 'Gasoline', 4500],
    ['Kipevu (Mombasa)', 'Shell Thika Rd', 'msa_nbi', 'Diesel', 5000],
    ['Kipevu (Mombasa)', 'Total Nakuru', 'msa_nbi', 'Gasoline', 4500],
    ['Kipevu (Mombasa)', 'Total Meru', 'msa_nbi', 'Diesel', 5000],
    ['Eldoret', 'Shell Uganda Rd', 'eld_ksu', 'Diesel', 4000],
    ['Eldoret', 'Engen Rupa Mall', 'eld_ksu', 'Gasoline', 4000],
    ['Eldoret', 'Rubis Oginga', 'eld_ksu', 'Diesel', 4500],
    ['Eldoret', 'Total Milimani', 'eld_ksu', 'Gasoline', 4000],
    ['Eldoret', 'Shell Uganda Rd', 'eld_ksu', 'Kerosene', 3000],
    ['Eldoret', 'Total Nakuru', 'nku_eld', 'Diesel', 5000],
    ['Eldoret', 'Total Nakuru', 'nku_eld', 'Gasoline', 4500],
    ['Eldoret', 'Shell Thika Rd', 'nbi_eld', 'Diesel', 4000],
    ['Kisumu', 'Rubis Oginga', 'eld_ksu', 'Diesel', 3500],
    ['Kisumu', 'Total Milimani', 'eld_ksu', 'Gasoline', 3500],
    ['Kisumu', 'Rubis Oginga', 'eld_ksu', 'Kerosene', 2500],
    ['Kisumu', 'Shell Uganda Rd', 'eld_ksu', 'Diesel', 4000],
    ['Kisumu', 'Engen Rupa Mall', 'eld_ksu', 'Gasoline', 3500],
    ['Kisumu', 'Total Nakuru', 'nbi_nyk', 'Diesel', 4500],
    ['Kisumu', 'Shell Uhuru Hwy', 'nbi_nyk', 'Gasoline', 4000],
    ['Nairobi West', 'Shell Uhuru Hwy', 'nbi_karen', 'Kerosene', 3000],
    ['Nairobi West', 'Total Westlands', 'nbi_thk', 'Diesel', 5000],
    ['Kipevu (Mombasa)', 'Engen Rupa Mall', 'msa_nbi', 'Gasoline', 5000],
    ['Nairobi West', 'Total Milimani', 'nbi_ksu', 'Gasoline', 4500],
    ['Eldoret', 'Total Meru', 'nbi_eld', 'Diesel', 5000],
  ];

  const now = new Date();

  return truckRouteMap.map((cfg, i) => {
    const [depot, destination, routeKey, fuelType, baseVol] = cfg;
    const seed = i * 137 + 42;
    const r1 = rng(seed), r2 = rng(seed + 1), r3 = rng(seed + 2);
    const r4 = rng(seed + 3), r5 = rng(seed + 4);

    const route = ROUTES[routeKey] || ROUTES['nbi_nak'];
    const progress = 0.05 + r1 * 0.85; // between 5% and 90% of journey

    const isAlert = i % 7 === 0 || i % 13 === 0; // ~20% of trucks have alerts
    const baseTemp = fuelType === 'Diesel' ? 28 + r2 * 8 : 26 + r2 * 6;
    const baseDensity = fuelType === 'Diesel' ? 830 + r3 * 10 : 740 + r3 * 10;
    // Temp-corrected volume: ~0.065% per °C for diesel, ~0.12% per °C for gasoline
    const tempDelta = r4 * 6 - 1; // -1 to +5 degrees in transit
    const thermalExpCoeff = fuelType === 'Diesel' ? 0.00065 : 0.0012;
    const legitimateVolChange = baseVol * thermalExpCoeff * tempDelta;
    const illegalLoss = isAlert ? baseVol * (0.03 + r5 * 0.05) : 0; // 3-8% illegal offtake
    const currentTemp = baseTemp + tempDelta;
    const currentDensity = baseDensity - (fuelType === 'Diesel' ? 0.6 : 0.8) * tempDelta;
    const currentVol = Math.round(baseVol + legitimateVolChange - illegalLoss);
    const volVariance = illegalLoss / baseVol;
    const densityVariance = isAlert ? Math.abs(r5 * 0.015) : Math.abs(r2 * 0.003);

    const pos = interpolate(route, progress);
    const status: TruckData['status'] = progress >= 0.98 ? 'delivered' : isAlert ? 'alert' : 'in-transit';

    const hours = Math.floor(6 + r1 * 8);
    const mins = Math.floor(r2 * 60);
    const loadTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    const etaHours = hours + Math.floor(3 + r3 * 6);
    const etaTime = `${String(etaHours % 24).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const truckAlerts: TruckAlert[] = [];
    if (illegalLoss > 0) {
      truckAlerts.push({
        id: `ALT-${String(i + 1).padStart(3, '0')}-V`,
        type: 'volume_drop',
        severity: illegalLoss > baseVol * 0.05 ? 'high' : 'medium',
        message: `Volume loss of ${Math.round(illegalLoss)}L exceeds thermal-adjusted baseline. Possible illegal offtake.`,
        timestamp: new Date(now.getTime() - Math.floor(r5 * 3600000)).toLocaleTimeString(),
        acknowledged: i % 13 === 0,
      });
    }
    if (densityVariance > 0.008) {
      truckAlerts.push({
        id: `ALT-${String(i + 1).padStart(3, '0')}-D`,
        type: 'density_shift',
        severity: 'medium',
        message: `Density shifted ${(densityVariance * 100).toFixed(2)}% beyond expected range. Possible adulteration.`,
        timestamp: new Date(now.getTime() - Math.floor(r4 * 1800000)).toLocaleTimeString(),
        acknowledged: false,
      });
    }
    if (i % 11 === 0) {
      truckAlerts.push({
        id: `ALT-${String(i + 1).padStart(3, '0')}-S`,
        type: 'unauthorized_stop',
        severity: 'high',
        message: `Truck stopped for 18 min outside approved dwell zone at -1.54°N, 37.02°E.`,
        timestamp: new Date(now.getTime() - Math.floor(r3 * 900000)).toLocaleTimeString(),
        acknowledged: false,
      });
    }

    return {
      id: `TRK-${String(i + 1).padStart(3, '0')}`,
      plate: PLATES[i % PLATES.length],
      driver: DRIVERS[i % DRIVERS.length],
      transporter: TRANSPORTERS[i % TRANSPORTERS.length],
      fuelType: fuelType as 'Diesel' | 'Gasoline' | 'Kerosene',
      depot,
      destination,
      route,
      routeProgress: progress,
      status,
      baselineVolume: baseVol,
      baselineTemp: Math.round(baseTemp * 10) / 10,
      baselineDensity: Math.round(baseDensity * 10) / 10,
      currentVolume: currentVol,
      currentTemp: Math.round(currentTemp * 10) / 10,
      currentDensity: Math.round(currentDensity * 10) / 10,
      currentLat: pos.lat,
      currentLon: pos.lon,
      speed: status === 'alert' && truckAlerts.some(a => a.type === 'unauthorized_stop') ? 0 : Math.round(60 + r1 * 40),
      dwellTime: i % 11 === 0 ? 18 : 0,
      alerts: truckAlerts,
      sealIntact: !(i % 17 === 0),
      geofenceCompliant: !(i % 11 === 0),
      loadingTime: loadTime,
      expectedDelivery: etaTime,
      volumeVariancePct: Math.round(volVariance * 1000) / 10,
      densityVariancePct: Math.round(densityVariance * 1000) / 10,
      compartments: `C1${i % 3 !== 0 ? ', C2' : ''}${i % 5 === 0 ? ', C3' : ''}`,
      sealNo: `SL-2026-${String(i + 1).padStart(4, '0')}`,
      markerConc: Math.round((14.5 + r5 * 1.5) * 10) / 10,
    };
  });
}

// ─── ALERT BADGE ─────────────────────────────────────────────────────────────
function AlertBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
      {count > 9 ? '9+' : count}
    </span>
  );
}

// ─── STATUS COLOR ─────────────────────────────────────────────────────────────
function statusColor(status: TruckData['status']) {
  switch (status) {
    case 'in-transit': return '#16a34a';
    case 'alert': return '#dc2626';
    case 'delivered': return '#2563eb';
    case 'loading': return '#d97706';
    default: return '#6b7280';
  }
}

function statusBadge(status: TruckData['status']) {
  const map: Record<string, string> = {
    'in-transit': 'bg-green-100 text-green-800',
    alert: 'bg-red-100 text-red-800',
    delivered: 'bg-blue-100 text-blue-800',
    loading: 'bg-yellow-100 text-yellow-800',
    idle: 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const CargoTrackingView = () => {
  const [trucks, setTrucks] = useState<TruckData[]>(() => generateTrucks());
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'alerts' | 'reports'>('map');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFuel, setFilterFuel] = useState<string>('all');
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<any>(null);

  // ── LIVE SIMULATION ──────────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTrucks(prev => prev.map(truck => {
        if (truck.status === 'delivered' || truck.status === 'loading') return truck;
        const step = (0.001 + Math.random() * 0.002); // 0.1–0.3% per tick
        const newProgress = Math.min(truck.routeProgress + step, 1.0);
        const newStatus: TruckData['status'] = newProgress >= 0.99 ? 'delivered' : truck.status;
        const pos = interpolate(truck.route, newProgress);

        // Sensor fluctuations
        const tempFluc = (Math.random() - 0.5) * 0.4;
        const newTemp = Math.round((truck.currentTemp + tempFluc) * 10) / 10;
        const densFluc = (Math.random() - 0.5) * 0.3;
        const newDensity = Math.round((truck.currentDensity + densFluc) * 10) / 10;
        // Volume natural thermal change
        const thermalCoeff = truck.fuelType === 'Diesel' ? 0.00065 : 0.0012;
        const volChange = Math.round(truck.currentVolume * thermalCoeff * tempFluc);
        const newVolume = truck.currentVolume + volChange;
        const volVariancePct = Math.round(Math.abs(newVolume - truck.baselineVolume) / truck.baselineVolume * 1000) / 10;

        return {
          ...truck,
          routeProgress: newProgress,
          status: newStatus,
          currentLat: pos.lat,
          currentLon: pos.lon,
          currentTemp: newTemp,
          currentDensity: newDensity,
          currentVolume: newVolume,
          volumeVariancePct: volVariancePct,
          speed: truck.dwellTime > 0 ? 0 : Math.round(55 + Math.random() * 45),
          lastUpdate: new Date(),
        } as TruckData;
      }));
      setTick(t => t + 1);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ── COMPUTED ──────────────────────────────────────────────────────────────
  const allAlerts = trucks.flatMap(t => t.alerts.map(a => ({ ...a, truckId: t.id, plate: t.plate })));
  const unackedAlerts = allAlerts.filter(a => !a.acknowledged);
  const countByStatus = {
    total: trucks.length,
    inTransit: trucks.filter(t => t.status === 'in-transit').length,
    alert: trucks.filter(t => t.status === 'alert').length,
    delivered: trucks.filter(t => t.status === 'delivered').length,
    loading: trucks.filter(t => t.status === 'loading').length,
  };

  const filtered = trucks.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchFuel = filterFuel === 'all' || t.fuelType === filterFuel;
    return matchStatus && matchFuel;
  });

  // ── MAP VIEW ──────────────────────────────────────────────────────────────
  const MapView = () => (
    <div className="bg-gray-900 rounded-xl overflow-hidden" style={{ height: 520 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        {/* Ocean grid */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`gh-${i}`} x1={0} y1={i * 60} x2={W} y2={i * 60} stroke="#1e3a5f" strokeWidth={0.5} opacity={0.4} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`gv-${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} stroke="#1e3a5f" strokeWidth={0.5} opacity={0.4} />
        ))}

        {/* Kenya land */}
        <polygon points={KENYA_POLY} fill="#166534" fillOpacity={0.3} stroke="#22c55e" strokeWidth={1.5} />

        {/* Route lines */}
        {Object.entries(ROUTES).map(([key, pts]) => (
          <polyline
            key={key}
            points={pts.map(p => `${toSvgX(p.lon)},${toSvgY(p.lat)}`).join(' ')}
            fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="4 3"
          />
        ))}

        {/* Depots */}
        {DEPOTS.map(d => (
          <g key={d.id}>
            <circle cx={toSvgX(d.lon)} cy={toSvgY(d.lat)} r={14} fill={d.color} fillOpacity={0.25} stroke={d.color} strokeWidth={2} />
            <circle cx={toSvgX(d.lon)} cy={toSvgY(d.lat)} r={7} fill={d.color} />
            <text x={toSvgX(d.lon)} y={toSvgY(d.lat) - 18} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">{d.name}</text>
          </g>
        ))}

        {/* Stations */}
        {STATIONS.map(s => (
          <circle key={s.name} cx={toSvgX(s.lon)} cy={toSvgY(s.lat)} r={4} fill="#f59e0b" stroke="#fbbf24" strokeWidth={1} opacity={0.8} />
        ))}

        {/* Trucks */}
        {filtered.map(truck => {
          const cx = toSvgX(truck.currentLon);
          const cy = toSvgY(truck.currentLat);
          const col = statusColor(truck.status);
          const isSelected = selectedTruck?.id === truck.id;
          return (
            <g key={truck.id} onClick={() => setSelectedTruck(truck)} style={{ cursor: 'pointer' }}>
              {isSelected && <circle cx={cx} cy={cy} r={18} fill={col} fillOpacity={0.2} stroke={col} strokeWidth={2} />}
              {/* Pulse ring for alert trucks */}
              {truck.status === 'alert' && (
                <circle cx={cx} cy={cy} r={14} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.6}>
                  <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Truck body */}
              <rect x={cx - 7} y={cy - 5} width={14} height={10} rx={2} fill={col} />
              <rect x={cx - 3} y={cy - 8} width={8} height={6} rx={1} fill={col} fillOpacity={0.8} />
              {/* Wheels */}
              <circle cx={cx - 4} cy={cy + 5} r={2} fill="#1f2937" />
              <circle cx={cx + 4} cy={cy + 5} r={2} fill="#1f2937" />
              {/* Truck ID on hover */}
              {isSelected && (
                <text x={cx} y={cy - 22} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">{truck.plate}</text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g>
          <rect x={8} y={H - 95} width={160} height={88} rx={4} fill="#0f172a" fillOpacity={0.85} />
          {[
            { col: '#16a34a', label: 'In-Transit' },
            { col: '#dc2626', label: 'Alert' },
            { col: '#2563eb', label: 'Delivered' },
            { col: '#d97706', label: 'Loading' },
          ].map((item, i) => (
            <g key={item.label}>
              <circle cx={22} cy={H - 82 + i * 18} r={5} fill={item.col} />
              <text x={34} y={H - 78 + i * 18} fill="white" fontSize={9}>{item.label}</text>
            </g>
          ))}
          <circle cx={22} cy={H - 82 + 4 * 18} r={3} fill="#f59e0b" />
          <text x={34} y={H - 78 + 4 * 18} fill="white" fontSize={9}>Station</text>
        </g>

        {/* Live indicator */}
        <g>
          <circle cx={W - 50} cy={16} r={5} fill="#22c55e">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x={W - 42} y={20} fill="#22c55e" fontSize={10} fontWeight="bold">LIVE</text>
        </g>

        {/* Tick counter (for reactivity) */}
        <text x={W - 80} y={H - 8} fill="#374151" fontSize={8}>
          {`Updated: ${new Date().toLocaleTimeString()}`}
        </text>
      </svg>
    </div>
  );

  // ── TRUCK LIST ────────────────────────────────────────────────────────────
  const ListView = () => (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
      {filtered.map(truck => (
        <div
          key={truck.id}
          onClick={() => setSelectedTruck(truck)}
          className={`bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-md transition border-l-4 ${
            truck.status === 'alert' ? 'border-red-500' : truck.status === 'delivered' ? 'border-blue-500' : 'border-green-500'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-800 text-sm">{truck.plate}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(truck.status)}`}>{truck.status}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${truck.fuelType === 'Diesel' ? 'bg-blue-50 text-blue-700' : truck.fuelType === 'Gasoline' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}`}>{truck.fuelType}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">{truck.depot} → {truck.destination}</div>
            </div>
            {truck.alerts.length > 0 && (
              <span className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" />{truck.alerts.length}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-orange-500" />{truck.currentTemp}°C</div>
            <div className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-500" />{truck.currentDensity} kg/m³</div>
            <div className="flex items-center gap-1"><Activity className="w-3 h-3 text-green-500" />{truck.currentVolume.toLocaleString()}L</div>
          </div>
          <div className="mt-2 bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(truck.routeProgress * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>{truck.id}</span>
            <span>{Math.round(truck.routeProgress * 100)}% complete</span>
          </div>
        </div>
      ))}
    </div>
  );

  // ── ALERTS LIST ───────────────────────────────────────────────────────────
  const AlertsView = () => (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
      {allAlerts.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
          <p>No active alerts</p>
        </div>
      )}
      {allAlerts.map((alert, idx) => (
        <div key={idx} className={`bg-white rounded-lg p-3 shadow border-l-4 ${
          alert.severity === 'high' ? 'border-red-500' : alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
        } ${alert.acknowledged ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                <span className="font-semibold text-sm text-gray-800">{alert.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-700' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>{alert.severity.toUpperCase()}</span>
                {alert.acknowledged && <span className="text-xs text-gray-400 bg-gray-100 px-2 rounded-full">Acknowledged</span>}
              </div>
              <p className="text-xs text-gray-600">{alert.message}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{(alert as any).plate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{alert.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── REPORTS ───────────────────────────────────────────────────────────────
  const ReportsView = () => {
    const totalLoaded = trucks.reduce((s, t) => s + t.baselineVolume, 0);
    const totalCurrent = trucks.reduce((s, t) => s + t.currentVolume, 0);
    const totalDelivered = trucks.filter(t => t.status === 'delivered').reduce((s, t) => s + t.currentVolume, 0);
    const highAlerts = allAlerts.filter(a => a.severity === 'high').length;
    const suspectLoss = trucks.filter(t => t.volumeVariancePct > 1.5).reduce((s, t) => s + (t.baselineVolume - t.currentVolume), 0);

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Loaded', value: `${(totalLoaded / 1000).toFixed(1)}K L`, icon: '⛽', color: 'bg-blue-50 text-blue-800' },
            { label: 'Total In Transit', value: `${(totalCurrent / 1000).toFixed(1)}K L`, icon: '🚛', color: 'bg-green-50 text-green-800' },
            { label: 'Delivered', value: `${(totalDelivered / 1000).toFixed(1)}K L`, icon: '✅', color: 'bg-indigo-50 text-indigo-800' },
            { label: 'Suspect Loss', value: `${Math.max(0, Math.round(suspectLoss)).toLocaleString()} L`, icon: '⚠️', color: 'bg-red-50 text-red-800' },
          ].map(item => (
            <div key={item.label} className={`rounded-lg p-3 ${item.color}`}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="font-bold text-lg">{item.value}</div>
              <div className="text-xs">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-green-600" />Fleet Status Summary</h4>
          {[
            { label: 'In-Transit', count: countByStatus.inTransit, total: countByStatus.total, color: 'bg-green-500' },
            { label: 'Alert', count: countByStatus.alert, total: countByStatus.total, color: 'bg-red-500' },
            { label: 'Delivered', count: countByStatus.delivered, total: countByStatus.total, color: 'bg-blue-500' },
            { label: 'Loading', count: countByStatus.loading, total: countByStatus.total, color: 'bg-yellow-500' },
          ].map(item => (
            <div key={item.label} className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                <span>{item.label}</span><span>{item.count}/{item.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.count / item.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" />Integrity Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Active Alerts</span><span className="font-bold text-red-600">{allAlerts.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Unacknowledged</span><span className="font-bold text-orange-600">{unackedAlerts.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">High Severity</span><span className="font-bold text-red-700">{highAlerts}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Geofence Violations</span><span className="font-bold text-yellow-600">{trucks.filter(t => !t.geofenceCompliant).length}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Seal Breaches</span><span className="font-bold text-red-600">{trucks.filter(t => !t.sealIntact).length}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Compliant Trucks</span><span className="font-bold text-green-600">{trucks.filter(t => t.alerts.length === 0 && t.sealIntact && t.geofenceCompliant).length}</span></div>
          </div>
        </div>
      </div>
    );
  };

  // ── TRUCK DETAIL MODAL ────────────────────────────────────────────────────
  const TruckModal = () => {
    if (!selectedTruck) return null;
    const t = selectedTruck;
    const tempCorrectedVol = Math.round(t.baselineVolume * (1 + (t.fuelType === 'Diesel' ? 0.00065 : 0.0012) * (t.currentTemp - t.baselineTemp)));
    const unexplainedLoss = Math.max(0, tempCorrectedVol - t.currentVolume);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4" onClick={() => setSelectedTruck(null)}>
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className={`p-4 rounded-t-2xl sm:rounded-t-2xl flex items-center justify-between ${t.status === 'alert' ? 'bg-red-600' : t.status === 'delivered' ? 'bg-blue-600' : 'bg-green-700'} text-white`}>
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span className="font-bold">{t.plate}</span>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">{t.id}</span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">{t.driver} · {t.transporter}</p>
            </div>
            <button onClick={() => setSelectedTruck(null)} className="p-1.5 rounded-full hover:bg-white hover:bg-opacity-20"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 space-y-4">
            {/* Route */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Navigation className="w-4 h-4 text-green-600" />Route</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">{t.depot}</span>
                <span className="text-gray-400">→</span>
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="truncate">{t.destination}</span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(t.routeProgress * 100, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Departed {t.loadingTime}</span>
                <span>{Math.round(t.routeProgress * 100)}%</span>
                <span>ETA {t.expectedDelivery}</span>
              </div>
            </div>

            {/* Sensors */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Activity className="w-4 h-4 text-green-600" />Live Sensor Readings</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Temperature', baseline: `${t.baselineTemp}°C`, current: `${t.currentTemp}°C`, icon: <Thermometer className="w-4 h-4 text-orange-500" />, ok: Math.abs(t.currentTemp - t.baselineTemp) < 8 },
                  { label: 'Density', baseline: `${t.baselineDensity}`, current: `${t.currentDensity}`, unit: 'kg/m³', icon: <Droplets className="w-4 h-4 text-blue-500" />, ok: t.densityVariancePct < 1 },
                  { label: 'Volume', baseline: `${t.baselineVolume.toLocaleString()}L`, current: `${t.currentVolume.toLocaleString()}L`, icon: <Activity className="w-4 h-4 text-green-500" />, ok: t.volumeVariancePct < 1.5 },
                ].map(item => (
                  <div key={item.label} className={`rounded-lg p-2 text-center ${item.ok ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex justify-center mb-1">{item.icon}</div>
                    <div className={`text-sm font-bold ${item.ok ? 'text-green-800' : 'text-red-700'}`}>{item.current}</div>
                    <div className="text-xs text-gray-500">Base: {item.baseline}</div>
                    <div className="text-xs font-semibold mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrity */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Shield className="w-4 h-4 text-green-600" />Integrity Analysis</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Temp-adjusted vol expected</span><span className="font-medium">{tempCorrectedVol.toLocaleString()} L</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Unexplained volume loss</span><span className={`font-bold ${unexplainedLoss > 100 ? 'text-red-600' : 'text-green-600'}`}>{unexplainedLoss > 0 ? `${unexplainedLoss.toLocaleString()} L` : 'None'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Volume variance</span><span className={`font-medium ${t.volumeVariancePct > 1.5 ? 'text-red-600' : 'text-green-600'}`}>{t.volumeVariancePct}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Density variance</span><span className={`font-medium ${t.densityVariancePct > 1.0 ? 'text-orange-600' : 'text-green-600'}`}>{t.densityVariancePct}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Seal status</span><span className={`font-bold ${t.sealIntact ? 'text-green-600' : 'text-red-600'}`}>{t.sealIntact ? '✓ Intact' : '✗ Compromised'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Geofence</span><span className={`font-bold ${t.geofenceCompliant ? 'text-green-600' : 'text-red-600'}`}>{t.geofenceCompliant ? '✓ Compliant' : '✗ Violation'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Marker concentration</span><span className="font-medium">{t.markerConc} ppm</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Current GPS</span><span className="font-medium">{t.currentLat.toFixed(4)}°, {t.currentLon.toFixed(4)}°</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Speed</span><span className="font-medium">{t.speed} km/h</span></div>
              </div>
            </div>

            {/* Alerts */}
            {t.alerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2"><AlertCircle className="w-4 h-4" />Active Alerts ({t.alerts.length})</div>
                <div className="space-y-2">
                  {t.alerts.map(a => (
                    <div key={a.id} className={`rounded-lg p-2.5 border-l-4 text-xs ${a.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
                      <div className="font-semibold text-gray-800 mb-0.5">{a.id} · {a.severity.toUpperCase()}</div>
                      <div className="text-gray-600">{a.message}</div>
                      <div className="text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{a.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proof of delivery for completed */}
            {t.status === 'delivered' && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-2"><CheckCircle className="w-4 h-4" />Digital Proof of Delivery</div>
                <div className="space-y-1 text-xs text-blue-700">
                  <div>Loaded: {t.baselineVolume.toLocaleString()} L at {t.loadingTime}</div>
                  <div>Delivered: {t.currentVolume.toLocaleString()} L</div>
                  <div>Temperature reconciliation: Applied</div>
                  <div>Integrity status: {t.alerts.length === 0 ? '✓ COMPLIANT' : '⚠ REVIEW REQUIRED'}</div>
                  <div>Seal: {t.sealNo}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'map', label: 'Live Map', icon: <MapPin className="w-4 h-4" /> },
    { key: 'list', label: 'Trucks', icon: <Truck className="w-4 h-4" />, badge: countByStatus.total },
    { key: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" />, badge: unackedAlerts.length },
    { key: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 space-y-4">
      <TruckModal />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-green-600" />
            Cargo Tracking & Monitoring
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time in-transit fuel visibility · SCT Module</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: countByStatus.total, color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'In-Transit', value: countByStatus.inTransit, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Alerts', value: countByStatus.alert, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Delivered', value: countByStatus.delivered, color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-lg p-2 text-center`}>
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0 relative transition ${
              activeTab === tab.key ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            {tab.icon}{tab.label}
            {tab.badge ? <AlertBadge count={tab.badge} /> : null}
          </button>
        ))}
      </div>

      {/* Filters (for list tab) */}
      {activeTab === 'list' && (
        <div className="flex gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500">
            <option value="all">All Status</option>
            <option value="in-transit">In-Transit</option>
            <option value="alert">Alert</option>
            <option value="delivered">Delivered</option>
            <option value="loading">Loading</option>
          </select>
          <select value={filterFuel} onChange={e => setFilterFuel(e.target.value)} className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500">
            <option value="all">All Fuel Types</option>
            <option value="Diesel">Diesel</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Kerosene">Kerosene</option>
          </select>
          <span className="text-xs text-gray-500 self-center">{filtered.length} trucks</span>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'map' && <MapView />}
      {activeTab === 'list' && <ListView />}
      {activeTab === 'alerts' && <AlertsView />}
      {activeTab === 'reports' && <ReportsView />}
    </div>
  );
};

export default CargoTrackingView;
