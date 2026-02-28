import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, AlertTriangle, CheckCircle, Clock, Activity, Shield, Navigation, Thermometer, Droplets, BarChart3, X, AlertCircle, Layers } from 'lucide-react';

// Fix leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '' });

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
  'nbi_nyk': [
    { lat: -1.29, lon: 36.82 }, { lat: -0.55, lon: 36.35 }, { lat: -0.30, lon: 36.08 },
    { lat: -0.18, lon: 35.8 }, { lat: -0.09, lon: 34.77 }
  ],
};

// ─── DEPOTS & STATIONS ───────────────────────────────────────────────────────
const DEPOTS = [
  { id: 'DEP-001', name: 'Kipevu (Mombasa)', lat: -4.05, lon: 39.67, color: '#3b82f6', geofenceKm: 5 },
  { id: 'DEP-002', name: 'Nairobi West', lat: -1.29, lon: 36.82, color: '#22c55e', geofenceKm: 8 },
  { id: 'DEP-003', name: 'Eldoret', lat: 0.51, lon: 35.27, color: '#f59e0b', geofenceKm: 5 },
  { id: 'DEP-004', name: 'Kisumu', lat: -0.09, lon: 34.77, color: '#a855f7', geofenceKm: 5 },
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

// ─── TILE LAYERS ─────────────────────────────────────────────────────────────
const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: 'Dark',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: 'Light',
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    label: 'Streets',
  },
};

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
    const progress = 0.05 + r1 * 0.85;

    const isAlert = i % 7 === 0 || i % 13 === 0;
    const baseTemp = fuelType === 'Diesel' ? 28 + r2 * 8 : 26 + r2 * 6;
    const baseDensity = fuelType === 'Diesel' ? 830 + r3 * 10 : 740 + r3 * 10;
    const tempDelta = r4 * 6 - 1;
    const thermalExpCoeff = fuelType === 'Diesel' ? 0.00065 : 0.0012;
    const legitimateVolChange = baseVol * thermalExpCoeff * tempDelta;
    const illegalLoss = isAlert ? baseVol * (0.03 + r5 * 0.05) : 0;
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
        message: `Truck stopped 18 min outside approved dwell zone.`,
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

// ─── STATUS HELPERS ───────────────────────────────────────────────────────────
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
    'in-transit': 'bg-green-100 text-green-800', alert: 'bg-red-100 text-red-800',
    delivered: 'bg-blue-100 text-blue-800', loading: 'bg-yellow-100 text-yellow-800',
    idle: 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

// ─── TRUCK ICON FACTORY ───────────────────────────────────────────────────────
function createTruckIcon(truck: TruckData, selected: boolean) {
  const col = statusColor(truck.status);
  const size = selected ? 40 : 32;
  const half = size / 2;
  const pulse = truck.status === 'alert'
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid #ef4444;animation:ctPulse 1.6s ease-out infinite;pointer-events:none;"></div>`
    : '';
  const ring = selected
    ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid white;pointer-events:none;"></div>`
    : '';
  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}${ring}
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${col};
          border:${selected ? 3 : 2}px solid rgba(255,255,255,0.9);
          box-shadow:0 2px 12px rgba(0,0,0,0.5),0 0 0 1px ${col}55;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:transform 0.15s;
        ">
          <svg width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="7" width="14" height="10" rx="1.5" fill="white" fill-opacity="0.95"/>
            <path d="M15 10h5l3 3.5V17h-8V10z" fill="white" fill-opacity="0.95"/>
            <circle cx="5.5" cy="19" r="2" fill="white" fill-opacity="0.95"/>
            <circle cx="18.5" cy="19" r="2" fill="white" fill-opacity="0.95"/>
          </svg>
        </div>
      </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 6)],
  });
}

function createDepotIcon(depot: typeof DEPOTS[0]) {
  return L.divIcon({
    html: `
      <div style="
        width:44px;height:44px;border-radius:10px;
        background:${depot.color};
        border:2px solid rgba(255,255,255,0.8);
        box-shadow:0 3px 14px rgba(0,0,0,0.6);
        display:flex;align-items:center;justify-content:center;
        flex-direction:column;gap:1px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" stroke-width="1.5" fill="none"/>
          <polyline points="9 22 9 12 15 12 15 22" stroke="white" stroke-width="1.5" fill="none"/>
        </svg>
      </div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -28],
  });
}

function createStationIcon() {
  return L.divIcon({
    html: `<div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

// ─── MAP CONTROLLER ───────────────────────────────────────────────────────────
function MapFlyTo({ truck }: { truck: TruckData | null }) {
  const map = useMap();
  const lastId = useRef<string | null>(null);
  useEffect(() => {
    if (truck && truck.id !== lastId.current) {
      lastId.current = truck.id;
      map.flyTo([truck.currentLat, truck.currentLon], 12, { duration: 1.2, easeLinearity: 0.5 });
    }
  }, [truck, map]);
  return null;
}

// ─── GLOBAL STYLE INJECTION ───────────────────────────────────────────────────
function MapStyles() {
  return (
    <style>{`
      @keyframes ctPulse {
        0%   { transform: scale(1);   opacity: 0.9; }
        70%  { transform: scale(2.4); opacity: 0;   }
        100% { transform: scale(1);   opacity: 0;   }
      }
      .leaflet-popup-content-wrapper {
        background: #0f172a !important;
        color: #f1f5f9 !important;
        border: 1px solid #334155 !important;
        border-radius: 14px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
        padding: 0 !important;
      }
      .leaflet-popup-content { margin: 0 !important; padding: 0 !important; }
      .leaflet-popup-tip-container .leaflet-popup-tip { background: #0f172a !important; }
      .leaflet-popup-close-button { color: #94a3b8 !important; top: 8px !important; right: 8px !important; font-size: 18px !important; }
      .leaflet-control-zoom a {
        background: #1e293b !important; color: #f1f5f9 !important;
        border-color: #334155 !important;
      }
      .leaflet-control-zoom a:hover { background: #334155 !important; }
      .leaflet-bar { border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,0.5) !important; border-radius: 10px !important; overflow: hidden; }
    `}</style>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const CargoTrackingView = () => {
  const [trucks, setTrucks] = useState<TruckData[]>(() => generateTrucks());
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'alerts' | 'reports'>('map');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFuel, setFilterFuel] = useState('all');
  const [tileStyle, setTileStyle] = useState<keyof typeof TILE_LAYERS>('dark');
  const [showRoutes, setShowRoutes] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [tick, setTick] = useState(0);

  // ── LIVE SIMULATION ───────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setTrucks(prev => prev.map(truck => {
        if (truck.status === 'delivered' || truck.status === 'loading') return truck;
        const step = 0.001 + Math.random() * 0.002;
        const newProgress = Math.min(truck.routeProgress + step, 1.0);
        const newStatus: TruckData['status'] = newProgress >= 0.99 ? 'delivered' : truck.status;
        const pos = interpolate(truck.route, newProgress);
        const tempFluc = (Math.random() - 0.5) * 0.4;
        const newTemp = Math.round((truck.currentTemp + tempFluc) * 10) / 10;
        const newDensity = Math.round((truck.currentDensity + (Math.random() - 0.5) * 0.3) * 10) / 10;
        const thermalCoeff = truck.fuelType === 'Diesel' ? 0.00065 : 0.0012;
        const newVol = truck.currentVolume + Math.round(truck.currentVolume * thermalCoeff * tempFluc);
        return {
          ...truck,
          routeProgress: newProgress,
          status: newStatus,
          currentLat: pos.lat,
          currentLon: pos.lon,
          currentTemp: newTemp,
          currentDensity: newDensity,
          currentVolume: newVol,
          volumeVariancePct: Math.round(Math.abs(newVol - truck.baselineVolume) / truck.baselineVolume * 1000) / 10,
          speed: truck.dwellTime > 0 ? 0 : Math.round(55 + Math.random() * 45),
        } as TruckData;
      }));
      setTick(t => t + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // ── COMPUTED ──────────────────────────────────────────────────────────────
  const allAlerts = trucks.flatMap(t => t.alerts.map(a => ({ ...a, truckId: t.id, plate: t.plate })));
  const unackedAlerts = allAlerts.filter(a => !a.acknowledged);
  const counts = {
    total: trucks.length,
    inTransit: trucks.filter(t => t.status === 'in-transit').length,
    alert: trucks.filter(t => t.status === 'alert').length,
    delivered: trucks.filter(t => t.status === 'delivered').length,
  };

  const filtered = trucks.filter(t =>
    (filterStatus === 'all' || t.status === filterStatus) &&
    (filterFuel === 'all' || t.fuelType === filterFuel)
  );

  // ── MAP VIEW ──────────────────────────────────────────────────────────────
  const MapView = () => {
    const layer = TILE_LAYERS[tileStyle];
    return (
      <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-700" style={{ height: 520 }}>
        <MapStyles />
        <MapContainer
          center={[-1.0, 37.2]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url={layer.url} attribution={layer.attribution} subdomains="abcd" maxZoom={19} />
          <ZoomControl position="topright" />
          <MapFlyTo truck={selectedTruck} />

          {/* Geofence zones */}
          {showGeofences && DEPOTS.map(d => (
            <Circle
              key={d.id}
              center={[d.lat, d.lon]}
              radius={d.geofenceKm * 1000}
              pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: 0.07, weight: 1.5, dashArray: '6 4' }}
            />
          ))}

          {/* Approved route corridors */}
          {showRoutes && Object.entries(ROUTES).map(([key, pts]) => (
            <Polyline
              key={key}
              positions={pts.map(p => [p.lat, p.lon] as [number, number])}
              pathOptions={{ color: '#fbbf24', weight: 2.5, opacity: 0.35, dashArray: '10 6' }}
            />
          ))}

          {/* Station markers */}
          {STATIONS.map(s => (
            <Marker key={s.name} position={[s.lat, s.lon]} icon={createStationIcon()}>
              <Popup>
                <div style={{ padding: '8px 12px', minWidth: 120 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 2 }}>STATION</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{s.name}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Depot markers */}
          {DEPOTS.map(d => (
            <Marker key={d.id} position={[d.lat, d.lon]} icon={createDepotIcon(d)}>
              <Popup>
                <div style={{ padding: '12px 14px', minWidth: 160 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Loading Depot</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {trucks.filter(t => t.depot === d.name && t.status !== 'delivered').length} trucks active
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Truck markers */}
          {filtered.map(truck => (
            <Marker
              key={`${truck.id}-${tick}`}
              position={[truck.currentLat, truck.currentLon]}
              icon={createTruckIcon(truck, selectedTruck?.id === truck.id)}
              eventHandlers={{ click: () => setSelectedTruck(t => t?.id === truck.id ? null : truck) }}
            >
              <Popup>
                <div style={{ padding: '14px', minWidth: 220, fontFamily: 'system-ui, sans-serif' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(truck.status), flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{truck.plate}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, background: statusColor(truck.status) + '33', color: statusColor(truck.status), padding: '2px 8px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>{truck.status}</span>
                  </div>
                  {/* Route */}
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                    <span style={{ color: '#94a3b8' }}>From</span> {truck.depot}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                    <span style={{ color: '#94a3b8' }}>To</span> {truck.destination}
                  </div>
                  {/* Progress */}
                  <div style={{ background: '#1e293b', borderRadius: 6, height: 5, marginBottom: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(truck.routeProgress * 100)}%`, height: '100%', background: statusColor(truck.status), borderRadius: 6 }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginBottom: 10 }}>{Math.round(truck.routeProgress * 100)}% complete · ETA {truck.expectedDelivery}</div>
                  {/* Sensors */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                    {[
                      { label: 'Temp', value: `${truck.currentTemp}°C`, ok: Math.abs(truck.currentTemp - truck.baselineTemp) < 8 },
                      { label: 'Density', value: `${truck.currentDensity}`, ok: truck.densityVariancePct < 1 },
                      { label: 'Volume', value: `${(truck.currentVolume / 1000).toFixed(1)}kL`, ok: truck.volumeVariancePct < 1.5 },
                    ].map(s => (
                      <div key={s.label} style={{ background: s.ok ? '#14532d33' : '#7f1d1d33', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: s.ok ? '#4ade80' : '#f87171' }}>{s.value}</div>
                        <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Driver / speed */}
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>
                    <span style={{ color: '#94a3b8' }}>Driver: </span>{truck.driver}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                    <span><span style={{ color: '#94a3b8' }}>Speed: </span>{truck.speed} km/h</span>
                    <span><span style={{ color: '#94a3b8' }}>Fuel: </span>{truck.fuelType}</span>
                  </div>
                  {/* Alerts */}
                  {truck.alerts.length > 0 && (
                    <div style={{ marginTop: 10, borderTop: '1px solid #1e293b', paddingTop: 8 }}>
                      {truck.alerts.slice(0, 2).map(a => (
                        <div key={a.id} style={{ fontSize: 10, color: a.severity === 'high' ? '#f87171' : '#fbbf24', marginBottom: 3 }}>
                          ⚠ {a.message.slice(0, 70)}{a.message.length > 70 ? '…' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map overlay controls */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
          {/* Tile switcher */}
          <div className="bg-slate-900 bg-opacity-90 backdrop-blur-sm rounded-xl p-2 shadow-xl border border-slate-700">
            <div className="flex items-center gap-1 mb-1.5">
              <Layers className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400 font-semibold">Map Style</span>
            </div>
            <div className="flex gap-1">
              {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map(k => (
                <button
                  key={k}
                  onClick={() => setTileStyle(k)}
                  className={`text-xs px-2 py-1 rounded-lg font-semibold transition capitalize ${
                    tileStyle === k ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {TILE_LAYERS[k].label}
                </button>
              ))}
            </div>
          </div>
          {/* Layer toggles */}
          <div className="bg-slate-900 bg-opacity-90 backdrop-blur-sm rounded-xl p-2 shadow-xl border border-slate-700">
            <div className="space-y-1.5">
              {[
                { label: 'Routes', value: showRoutes, toggle: () => setShowRoutes(v => !v) },
                { label: 'Geofences', value: showGeofences, toggle: () => setShowGeofences(v => !v) },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.toggle}
                  className={`flex items-center gap-2 w-full text-xs px-2 py-1 rounded-lg transition ${
                    item.value ? 'text-green-400' : 'text-slate-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-sm border ${item.value ? 'bg-green-600 border-green-500' : 'border-slate-600'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="bg-slate-900 bg-opacity-90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-xl border border-slate-700 flex gap-4">
            {[
              { label: 'Total', val: counts.total, col: '#f1f5f9' },
              { label: 'In-Transit', val: counts.inTransit, col: '#4ade80' },
              { label: 'Alert', val: counts.alert, col: '#f87171' },
              { label: 'Delivered', val: counts.delivered, col: '#60a5fa' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-sm font-bold" style={{ color: item.col }}>{item.val}</div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-3 right-14 z-[1000]">
          <div className="bg-slate-900 bg-opacity-90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-green-400">LIVE</span>
            <span className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    );
  };

  // ── TRUCK LIST ────────────────────────────────────────────────────────────
  const ListView = () => (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
      {filtered.map(truck => (
        <div
          key={truck.id}
          onClick={() => { setSelectedTruck(truck); setActiveTab('map'); }}
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
            <span>{truck.id}</span><span>{Math.round(truck.routeProgress * 100)}% complete</span>
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
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm text-gray-800">{alert.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${alert.severity === 'high' ? 'bg-red-100 text-red-700' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{alert.severity.toUpperCase()}</span>
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
    const suspectLoss = trucks.filter(t => t.volumeVariancePct > 1.5).reduce((s, t) => s + Math.max(0, t.baselineVolume - t.currentVolume), 0);

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Loaded', value: `${(totalLoaded / 1000).toFixed(1)}K L`, icon: '⛽', color: 'bg-blue-50 text-blue-800' },
            { label: 'In Transit', value: `${(totalCurrent / 1000).toFixed(1)}K L`, icon: '🚛', color: 'bg-green-50 text-green-800' },
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
          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-green-600" />Fleet Status</h4>
          {[
            { label: 'In-Transit', count: counts.inTransit, color: 'bg-green-500' },
            { label: 'Alert', count: counts.alert, color: 'bg-red-500' },
            { label: 'Delivered', count: counts.delivered, color: 'bg-blue-500' },
          ].map(item => (
            <div key={item.label} className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-0.5"><span>{item.label}</span><span>{item.count}/{counts.total}</span></div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.count / counts.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" />Integrity Summary</h4>
          <div className="space-y-2 text-sm">
            {[
              ['Active Alerts', allAlerts.length, 'text-red-600'],
              ['Unacknowledged', unackedAlerts.length, 'text-orange-600'],
              ['Geofence Violations', trucks.filter(t => !t.geofenceCompliant).length, 'text-yellow-600'],
              ['Seal Breaches', trucks.filter(t => !t.sealIntact).length, 'text-red-600'],
              ['Fully Compliant', trucks.filter(t => t.alerts.length === 0 && t.sealIntact && t.geofenceCompliant).length, 'text-green-600'],
            ].map(([label, val, cls]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-gray-600">{label}</span>
                <span className={`font-bold ${cls}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── TRUCK DETAIL MODAL ────────────────────────────────────────────────────
  const TruckModal = () => {
    if (!selectedTruck || activeTab !== 'map') return null;
    const t = selectedTruck;
    const tempCorrectedVol = Math.round(t.baselineVolume * (1 + (t.fuelType === 'Diesel' ? 0.00065 : 0.0012) * (t.currentTemp - t.baselineTemp)));
    const unexplainedLoss = Math.max(0, tempCorrectedVol - t.currentVolume);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-[2000] flex items-end sm:items-center justify-center p-2 sm:p-4" onClick={() => setSelectedTruck(null)}>
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className={`p-4 rounded-t-2xl flex items-center justify-between ${t.status === 'alert' ? 'bg-red-600' : t.status === 'delivered' ? 'bg-blue-600' : 'bg-green-700'} text-white`}>
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
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Navigation className="w-4 h-4 text-green-600" />Route Progress</div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" /><span className="truncate">{t.depot}</span>
                <span className="text-gray-400">→</span>
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" /><span className="truncate">{t.destination}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(t.routeProgress * 100, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Dep. {t.loadingTime}</span><span>{Math.round(t.routeProgress * 100)}%</span><span>ETA {t.expectedDelivery}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-green-600" />Live Sensors</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Temperature', baseline: `${t.baselineTemp}°C`, current: `${t.currentTemp}°C`, ok: Math.abs(t.currentTemp - t.baselineTemp) < 8 },
                  { label: 'Density', baseline: `${t.baselineDensity}`, current: `${t.currentDensity}`, ok: t.densityVariancePct < 1 },
                  { label: 'Volume', baseline: `${t.baselineVolume.toLocaleString()}L`, current: `${t.currentVolume.toLocaleString()}L`, ok: t.volumeVariancePct < 1.5 },
                ].map(s => (
                  <div key={s.label} className={`rounded-lg p-2 text-center ${s.ok ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={`text-sm font-bold ${s.ok ? 'text-green-800' : 'text-red-700'}`}>{s.current}</div>
                    <div className="text-xs text-gray-500">Base: {s.baseline}</div>
                    <div className="text-xs font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" />Integrity</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Temp-adjusted vol</span><span className="font-medium">{tempCorrectedVol.toLocaleString()} L</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Unexplained loss</span><span className={`font-bold ${unexplainedLoss > 100 ? 'text-red-600' : 'text-green-600'}`}>{unexplainedLoss > 0 ? `${unexplainedLoss.toLocaleString()} L` : 'None'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Vol. variance</span><span className={`font-medium ${t.volumeVariancePct > 1.5 ? 'text-red-600' : 'text-green-600'}`}>{t.volumeVariancePct}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Seal</span><span className={`font-bold ${t.sealIntact ? 'text-green-600' : 'text-red-600'}`}>{t.sealIntact ? '✓ Intact' : '✗ Compromised'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Geofence</span><span className={`font-bold ${t.geofenceCompliant ? 'text-green-600' : 'text-red-600'}`}>{t.geofenceCompliant ? '✓ Compliant' : '✗ Violation'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">GPS</span><span className="font-medium">{t.currentLat.toFixed(4)}, {t.currentLon.toFixed(4)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Speed</span><span className="font-medium">{t.speed} km/h</span></div>
              </div>
            </div>
            {t.alerts.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Active Alerts ({t.alerts.length})</div>
                {t.alerts.map(a => (
                  <div key={a.id} className={`rounded-lg p-2.5 border-l-4 text-xs mb-2 ${a.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
                    <div className="font-semibold text-gray-800 mb-0.5">{a.id} · {a.severity.toUpperCase()}</div>
                    <div className="text-gray-600">{a.message}</div>
                    <div className="text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{a.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
            {t.status === 'delivered' && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" />Digital Proof of Delivery</div>
                <div className="space-y-1 text-xs text-blue-700">
                  <div>Loaded: {t.baselineVolume.toLocaleString()} L at {t.loadingTime}</div>
                  <div>Delivered: {t.currentVolume.toLocaleString()} L</div>
                  <div>Temperature reconciliation: Applied</div>
                  <div>Integrity: {t.alerts.length === 0 ? '✓ COMPLIANT' : '⚠ REVIEW REQUIRED'}</div>
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
  const tabs = [
    { key: 'map' as const, label: 'Live Map', icon: <MapPin className="w-4 h-4" /> },
    { key: 'list' as const, label: 'Trucks', icon: <Truck className="w-4 h-4" />, badge: counts.total },
    { key: 'alerts' as const, label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" />, badge: unackedAlerts.length },
    { key: 'reports' as const, label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 space-y-4">
      <TruckModal />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-green-600" />Cargo Tracking &amp; Monitoring
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time in-transit fuel visibility · SCT Module</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />LIVE
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: counts.total, color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'In-Transit', value: counts.inTransit, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Alerts', value: counts.alert, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Delivered', value: counts.delivered, color: 'text-blue-700', bg: 'bg-blue-50' },
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
            {tab.badge ? (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {(tab.badge as number) > 9 ? '9+' : tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Filters for list tab */}
      {activeTab === 'list' && (
        <div className="flex gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500">
            <option value="all">All Status</option>
            <option value="in-transit">In-Transit</option>
            <option value="alert">Alert</option>
            <option value="delivered">Delivered</option>
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

      {activeTab === 'map' && <MapView />}
      {activeTab === 'list' && <ListView />}
      {activeTab === 'alerts' && <AlertsView />}
      {activeTab === 'reports' && <ReportsView />}
    </div>
  );
};

export default CargoTrackingView;
