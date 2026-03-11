import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { Menu, X, Home, Package, Truck, AlertCircle, BarChart3, Settings, Scan, CheckCircle, MapPin, Clock, Fuel, Building2, Store, Users, FileText, Eye, TrendingUp, ArrowDownCircle, ArrowUpCircle, Activity, Shield, Target, AlertTriangle, Crosshair, Camera, ClipboardCheck, Printer, Download, Navigation, Flame, Tag, Ship, Anchor, FlaskConical, Award, Calendar, Warehouse, Globe2, ChevronRight, BadgeCheck, Scale, Layers, Container, ChevronDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import CargoTrackingView from './CargoTracking';
import { translations, langLabels, Lang } from './i18n';

// ─── FUEL TRADING & LOGISTICS PLATFORM DATA ───────────────────────────────────

const FTL_PARTICIPANTS = [
  { id: 'IMP-001', name: 'TotalEnergies Kenya Ltd',           type: 'importer',   epraLic: 'EPRA/IMP/2024/001', kebsLic: 'KEBS/IMP/2024/001', status: 'active',    expires: '31/12/2025', country: 'France' },
  { id: 'IMP-002', name: 'Vitol Energy Kenya Ltd',            type: 'importer',   epraLic: 'EPRA/IMP/2024/002', kebsLic: '',                   status: 'active',    expires: '28/02/2026', country: 'Switzerland' },
  { id: 'IMP-003', name: 'Galana Oil Kenya Ltd',              type: 'importer',   epraLic: 'EPRA/IMP/2024/003', kebsLic: '',                   status: 'active',    expires: '31/08/2025', country: 'Kenya' },
  { id: 'OMC-001', name: 'Vivo Energy Kenya (Shell)',         type: 'omc',        epraLic: 'EPRA/OMC/2024/001', kebsLic: 'KEBS/OMC/2024/001', status: 'active',    expires: '30/06/2025', country: 'Kenya' },
  { id: 'OMC-002', name: 'Rubis Energy Kenya Ltd',            type: 'omc',        epraLic: 'EPRA/OMC/2024/002', kebsLic: 'KEBS/OMC/2024/002', status: 'active',    expires: '31/03/2026', country: 'France' },
  { id: 'OMC-003', name: 'Hass Petroleum Ltd',                type: 'omc',        epraLic: 'EPRA/OMC/2024/003', kebsLic: '',                   status: 'active',    expires: '31/12/2025', country: 'Kenya' },
  { id: 'MARK-001', name: 'Authentix International',          type: 'marking',    epraLic: 'EPRA/MARK/2024/001', kebsLic: 'KEBS/MARK/2024/001', status: 'active',  expires: '31/12/2026', country: 'USA' },
  { id: 'MARK-002', name: 'Tracerco Kenya Ltd',               type: 'marking',    epraLic: 'EPRA/MARK/2024/002', kebsLic: 'KEBS/MARK/2024/002', status: 'active',  expires: '30/09/2025', country: 'UK' },
  { id: 'DEP-001', name: 'KPC Kipevu Oil Storage Facility',   type: 'depot',      epraLic: 'EPRA/DEP/2024/001', kebsLic: 'KEBS/DEP/2024/001', status: 'active',    expires: '31/12/2025', country: 'Kenya' },
  { id: 'DEP-002', name: 'Essar Oil Kenya (Kipevu)',          type: 'depot',      epraLic: 'EPRA/DEP/2024/002', kebsLic: 'KEBS/DEP/2024/002', status: 'active',    expires: '31/08/2025', country: 'India' },
  { id: 'DEP-003', name: 'Bakri Cemenco (Mombasa)',           type: 'depot',      epraLic: 'EPRA/DEP/2024/003', kebsLic: '',                   status: 'suspended', expires: '28/02/2025', country: 'Switzerland' },
  { id: 'TRN-001', name: 'Gulf Energy Limited',               type: 'transporter', epraLic: 'EPRA/TRN/2024/001', kebsLic: '',                  status: 'active',    expires: '31/12/2025', country: 'Kenya' },
  { id: 'TRN-002', name: 'Petrovida Kenya Ltd',               type: 'transporter', epraLic: 'EPRA/TRN/2024/002', kebsLic: '',                  status: 'active',    expires: '30/09/2025', country: 'Kenya' },
  { id: 'TRN-003', name: 'Kenya Oil Transporters Co.',        type: 'transporter', epraLic: 'EPRA/TRN/2024/003', kebsLic: '',                  status: 'suspended', expires: '30/06/2025', country: 'Kenya' },
  { id: 'LAB-001', name: 'KEBS Regional Lab – Mombasa',       type: 'laboratory', epraLic: 'EPRA/LAB/2024/001', kebsLic: 'KEBS/LAB/2024/001', status: 'active',    expires: '31/12/2026', country: 'Kenya' },
  { id: 'LAB-002', name: 'Intertek Testing Services Kenya',   type: 'laboratory', epraLic: '',                   kebsLic: 'KEBS/LAB/2024/002', status: 'active',    expires: '30/09/2025', country: 'UK' },
  { id: 'SHIP-001', name: 'Inchcape Shipping Services Kenya', type: 'shipping',   epraLic: '',                   kebsLic: '',                   status: 'active',    expires: '31/12/2025', country: 'UK' },
  { id: 'SHIP-002', name: 'Maersk Kenya Ltd',                 type: 'shipping',   epraLic: '',                   kebsLic: '',                   status: 'active',    expires: '31/12/2025', country: 'Denmark' },
];

const FTL_CARGO = [
  { id: 'CARGO-001', vessel: 'MT Malaika',      imo: '9445678', flag: '🇲🇭 Marshall Is.', product: 'Diesel',       volume: 45000, origin: 'Jubail, Saudi Arabia',    refinery: 'Saudi Aramco Jubail', eta: '14/03/2026', bill: 'BL-2026-MA-001', importer: 'TotalEnergies Kenya Ltd',  status: 'in-transit',  riskScore: 12, riskLevel: 'Low'      },
  { id: 'CARGO-002', vessel: 'MT Pwani Star',   imo: '9334567', flag: '🇧🇸 Bahamas',      product: 'Petrol',       volume: 32000, origin: 'Fujairah, UAE',             refinery: 'ENOC Fujairah',       eta: '16/03/2026', bill: 'BL-2026-PS-002', importer: 'Vitol Energy Kenya Ltd',   status: 'declared',    riskScore: 8,  riskLevel: 'Low'      },
  { id: 'CARGO-003', vessel: 'MT Indian Ocean', imo: '9223456', flag: '🇵🇦 Panama',       product: 'Kerosene (IK)',volume: 28000, origin: 'Ras Tanura, Saudi Arabia', refinery: 'Saudi Aramco',        eta: '12/03/2026', bill: 'BL-2026-IO-003', importer: 'TotalEnergies Kenya Ltd',  status: 'discharged',  riskScore: 5,  riskLevel: 'Low'      },
  { id: 'CARGO-004', vessel: 'MT Bahari',       imo: '9112345', flag: '🇸🇬 Singapore',    product: 'Jet A-1',      volume: 18000, origin: 'Sikka, India',              refinery: 'Reliance Industries', eta: '20/03/2026', bill: 'BL-2026-BA-004', importer: 'Galana Oil Kenya Ltd',     status: 'declared',    riskScore: 22, riskLevel: 'Medium'   },
  { id: 'CARGO-005', vessel: 'MT Jahazi',       imo: '9001234', flag: '🇱🇷 Liberia',      product: 'Diesel',       volume: 52000, origin: 'Mina Al Ahmadi, Kuwait',   refinery: 'KPC Kuwait',          eta: '22/03/2026', bill: 'BL-2026-JH-005', importer: 'Vivo Energy Kenya (Shell)',status: 'sampling',    riskScore: 15, riskLevel: 'Low'      },
  { id: 'CARGO-006', vessel: 'MT Utamaduni',    imo: '8990123', flag: '🇵🇦 Panama',       product: 'Fuel Oil',     volume: 20000, origin: 'Rotterdam, Netherlands',    refinery: 'Shell Pernis',        eta: '25/03/2026', bill: 'BL-2026-UT-006', importer: 'Hass Petroleum Ltd',       status: 'declared',    riskScore: 41, riskLevel: 'High'     },
];

const FTL_LAYCAN = [
  { id: 'LYC-001', vessel: 'MT Indian Ocean', berth: 'Berth 3 – Essar Jetty', product: 'Kerosene (IK)', volume: 28000, start: '12/03/2026 06:00', end: '13/03/2026 22:00', status: 'completed', agent: 'Inchcape Shipping Services Kenya' },
  { id: 'LYC-002', vessel: 'MT Malaika',      berth: 'Berth 1 – KPC Kipevu', product: 'Diesel',       volume: 45000, start: '14/03/2026 06:00', end: '15/03/2026 18:00', status: 'active',    agent: 'Inchcape Shipping Services Kenya' },
  { id: 'LYC-003', vessel: 'MT Pwani Star',   berth: 'Berth 2 – KPC Kipevu', product: 'Petrol',       volume: 32000, start: '16/03/2026 08:00', end: '17/03/2026 14:00', status: 'confirmed', agent: 'Maersk Kenya Ltd' },
  { id: 'LYC-004', vessel: 'MT Jahazi',       berth: 'Berth 1 – KPC Kipevu', product: 'Diesel',       volume: 52000, start: '22/03/2026 06:00', end: '24/03/2026 06:00', status: 'confirmed', agent: 'Inchcape Shipping Services Kenya' },
  { id: 'LYC-005', vessel: 'MT Bahari',       berth: 'Berth 4 – KPC Jetty 2', product: 'Jet A-1',    volume: 18000, start: '20/03/2026 10:00', end: '21/03/2026 20:00', status: 'requested', agent: 'Maersk Kenya Ltd' },
  { id: 'LYC-006', vessel: 'MT Utamaduni',    berth: 'Pending allocation',   product: 'Fuel Oil',     volume: 20000, start: '25/03/2026 08:00', end: '26/03/2026 20:00', status: 'requested', agent: 'Inchcape Shipping Services Kenya' },
];

const FTL_LAB_TESTS = [
  { id: 'TEST-001', cargo: 'CARGO-003', vessel: 'MT Indian Ocean', product: 'Kerosene (IK)', lab: 'KEBS Mombasa',           sampledAt: '12/03/2026 08:30', completedAt: '12/03/2026 16:45', result: 'PASS' as const,
    tests: [{ param: 'Flash Point (°C)', std: '≥ 38', measured: '42.5', pass: true }, { param: 'Density (kg/m³)', std: '780–820', measured: '801.3', pass: true }, { param: 'Sulphur Content (ppm)', std: '< 500', measured: '215', pass: true }, { param: 'Water Content (%)', std: '< 0.05', measured: '0.01', pass: true }, { param: 'Visual Clarity', std: 'Clear', measured: 'Clear', pass: true }] },
  { id: 'TEST-002', cargo: 'CARGO-005', vessel: 'MT Jahazi',       product: 'Diesel',        lab: 'Intertek Mombasa',        sampledAt: '13/03/2026 09:00', completedAt: '',                result: 'PENDING' as const,
    tests: [{ param: 'Flash Point (°C)', std: '≥ 52', measured: '—', pass: null }, { param: 'Density (kg/m³)', std: '820–860', measured: '—', pass: null }, { param: 'Sulphur Content (ppm)', std: '< 50', measured: '—', pass: null }, { param: 'Cetane Number', std: '≥ 51', measured: '—', pass: null }, { param: 'Water Content (%)', std: '< 0.05', measured: '—', pass: null }] },
  { id: 'TEST-003', cargo: 'CARGO-006', vessel: 'MT Utamaduni',    product: 'Fuel Oil',      lab: 'KEBS Mombasa',           sampledAt: '11/03/2026 11:00', completedAt: '11/03/2026 19:30', result: 'FAIL' as const,
    tests: [{ param: 'Flash Point (°C)', std: '≥ 60', measured: '54.2', pass: false }, { param: 'Sulphur Content (%)', std: '< 0.5', measured: '1.2', pass: false }, { param: 'Density (kg/m³)', std: '900–1010', measured: '952.1', pass: true }, { param: 'Water Content (%)', std: '< 0.5', measured: '0.8', pass: false }, { param: 'Visual Clarity', std: 'Clear', measured: 'Hazy', pass: false }] },
];

const FTL_CLEARANCES = [
  { id: 'CLR-001', cargo: 'CARGO-003', vessel: 'MT Indian Ocean', product: 'Kerosene (IK)', volume: 28000, depot: 'Essar Oil Kenya (Kipevu)', kebsAt: '12/03/2026 18:00', epraAt: '12/03/2026 19:30', kraAt: '13/03/2026 08:00', authAt: '13/03/2026 09:00', status: 'authorized' as const },
  { id: 'CLR-002', cargo: 'CARGO-001', vessel: 'MT Malaika',      product: 'Diesel',        volume: 45000, depot: 'KPC Kipevu Oil Storage',   kebsAt: '',                 epraAt: '',                 kraAt: '',                 authAt: '',                status: 'awaiting-quality' as const },
  { id: 'CLR-003', cargo: 'CARGO-005', vessel: 'MT Jahazi',       product: 'Diesel',        volume: 52000, depot: 'KPC Kipevu Oil Storage',   kebsAt: '',                 epraAt: '',                 kraAt: '',                 authAt: '',                status: 'awaiting-quality' as const },
  { id: 'CLR-004', cargo: 'CARGO-006', vessel: 'MT Utamaduni',    product: 'Fuel Oil',      volume: 20000, depot: 'TBD',                      kebsAt: '',                 epraAt: '',                 kraAt: '',                 authAt: '',                status: 'rejected' as const },
];

const FTL_OFFLOADS = [
  { id: 'OFFL-001', clearance: 'CLR-001', vessel: 'MT Indian Ocean', product: 'Kerosene (IK)', depot: 'Essar Oil Kenya (Kipevu)', tank: 'Tank K-3',      startedAt: '13/03/2026 10:30', completedAt: '13/03/2026 22:15', volumeLoaded: 28000, volumeReceived: 27840, status: 'completed' as const },
  { id: 'OFFL-002', clearance: 'CLR-002', vessel: 'MT Malaika',      product: 'Diesel',        depot: 'KPC Kipevu Oil Storage',   tank: 'Tank D-1 / D-2', startedAt: '14/03/2026 12:00', completedAt: '',                volumeLoaded: 45000, volumeReceived: 0,     status: 'in-progress' as const },
  { id: 'OFFL-003', clearance: 'CLR-003', vessel: 'MT Jahazi',        product: 'Diesel',        depot: 'KPC Kipevu Oil Storage',   tank: 'TBD',            startedAt: '',                 completedAt: '',                volumeLoaded: 52000, volumeReceived: 0,     status: 'pending' as const },
];

// ─── SCT / CARGO-TRACKING SHARED FLEET DATA ──────────────────────────────────
// These constants mirror CargoTracking.tsx exactly so every SCT transaction maps
// 1-to-1 to the truck being monitored (same index → same plate, driver, etc.).
const FLEET_PLATES = [
  'KCA 123A','KBZ 456B','KCD 789C','KAA 234D','KCB 567E','KBY 890F','KBA 123G','KCC 456H',
  'KDA 789I','KDB 012J','KDC 345K','KDD 678L','KDE 901M','KDF 234N','KDG 567P','KDH 890Q',
  'KEA 123R','KEB 456S','KEC 789T','KED 012U','KEE 345V','KEF 678W','KEG 901X','KEH 234Y',
  'KFA 567Z','KFB 890A','KFC 123B','KFD 456C','KFE 789D','KFF 012E','KFG 345F','KFH 678G',
  'KGA 901H','KGB 234I','KGC 567J','KGD 890K','KGE 123L','KGF 456M','KGG 789N','KGH 012P',
  'KHA 345Q','KHB 678R','KHC 901S','KHD 234T','KHE 567U','KHF 890V','KHG 123W','KHH 456X',
  'KIA 789Y','KIB 012Z',
];
const FLEET_DRIVERS = [
  'Joseph Kimani','Ahmed Ali','Samuel Korir','Paul Njoroge','Tom Ochieng','John Mutua','Hassan Omar',
  'David Cheruiyot','Peter Kariuki','Mary Wanjiru','James Odhiambo','Anne Muthoni','Ali Hassan',
  'Fatuma Mohamed','Michael Omondi','Lucy Achieng','Daniel Kiptoo','Ruth Chebet','Simon Kamau',
  'Elizabeth Wambui','Patrick Njenga','Jane Njeri','Francis Mwiti','Grace Otieno','David Kiplagat',
  'Sarah Kimani','John Mwangi','Moses Waweru','Catherine Maina','George Otieno','Susan Wanjiku',
  'Robert Mwangi','Alice Njeri','Charles Omondi','Dorothy Achieng','Emmanuel Cheruiyot','Faith Korir',
  'Geoffrey Mutua','Hannah Omar','Isaac Ochieng','Janet Kimani','Kevin Ali','Lilian Njoroge',
  'Martin Korir','Nancy Mutua','Oscar Kariuki','Patricia Wanjiru','Quincy Odhiambo','Rachel Muthoni',
  'Stephen Hassan',
];
const FLEET_TRANSPORTERS = [
  'KenTrans Logistics Ltd','Coast Fuel Carriers','Rift Valley Transporters','SafeHaul Kenya Ltd',
  'Lake Basin Logistics','Nairobi Bulk Carriers','EPRA Certified Hauliers','Peak Fuel Transport',
];
// Driver license numbers — deterministic per driver index
const FLEET_LICENSES = FLEET_DRIVERS.map((_, i) =>
  `DL-${2021 + (i % 3)}-${String(100000 + (i * 12345) % 900000).padStart(6, '0')}`
);

// [depotShort, destinationShort, routeKey, fuelType, volumeL] — identical order to CargoTracking
const FLEET_DEFS: [string, string, string, string, number][] = [
  ['Nairobi West','Total Westlands','nbi_karen','Gasoline',5000],
  ['Nairobi West','Shell Uhuru Highway','nbi_karen','Diesel',6000],
  ['Nairobi West','Rubis Kilimani','nbi_karen','Gasoline',4000],
  ['Nairobi West','Engen Karen','nbi_karen','Diesel',4500],
  ['Nairobi West','Total Nakuru','nbi_nak','Diesel',5500],
  ['Nairobi West','Total Nakuru','nbi_nak','Gasoline',5000],
  ['Nairobi West','Shell Thika Road','nbi_thk','Diesel',4000],
  ['Nairobi West','Shell Thika Road','nbi_thk','Gasoline',3500],
  ['Nairobi West','Total Meru','nbi_mru','Diesel',4500],
  ['Nairobi West','Total Meru','nbi_mru','Diesel',5000],
  ['Nairobi West','Shell Uganda Road','nbi_eld','Diesel',5500],
  ['Nairobi West','Shell Uganda Road','nbi_eld','Gasoline',5000],
  ['Nairobi West','Rubis Oginga Odinga','nbi_ksu','Diesel',4500],
  ['Nairobi West','Rubis Oginga Odinga','nbi_ksu','Gasoline',4000],
  ['Nairobi West','Total Milimani','nbi_ksu','Diesel',5000],
  ['Nairobi West','Total Milimani','nbi_ksu','Kerosene',3000],
  ['Nairobi West','Total Westlands','nbi_karen','Diesel',5500],
  ['Nairobi West','Engen Karen','nbi_karen','Gasoline',4000],
  ['Nairobi West','Total Nakuru','nbi_nak','Kerosene',3500],
  ['Nairobi West','Engen Rupa Mall','nbi_eld','Diesel',4500],
  ['Kipevu (Mombasa)','Total Nyali','msa_nbi','Diesel',5200],
  ['Kipevu (Mombasa)','Shell Moi Avenue','msa_nbi','Gasoline',6000],
  ['Kipevu (Mombasa)','Total Nyali','msa_nbi','Kerosene',3000],
  ['Kipevu (Mombasa)','Shell Moi Avenue','msa_nbi','Diesel',5500],
  ['Kipevu (Mombasa)','Total Westlands','msa_nbi','Gasoline',5000],
  ['Kipevu (Mombasa)','Shell Uhuru Highway','msa_nbi','Diesel',5500],
  ['Kipevu (Mombasa)','Rubis Kilimani','msa_nbi','Gasoline',4500],
  ['Kipevu (Mombasa)','Shell Thika Road','msa_nbi','Diesel',5000],
  ['Kipevu (Mombasa)','Total Nakuru','msa_nbi','Gasoline',4500],
  ['Kipevu (Mombasa)','Total Meru','msa_nbi','Diesel',5000],
  ['Eldoret','Shell Uganda Road','eld_ksu','Diesel',4000],
  ['Eldoret','Engen Rupa Mall','eld_ksu','Gasoline',4000],
  ['Eldoret','Rubis Oginga Odinga','eld_ksu','Diesel',4500],
  ['Eldoret','Total Milimani','eld_ksu','Gasoline',4000],
  ['Eldoret','Shell Uganda Road','eld_ksu','Kerosene',3000],
  ['Eldoret','Total Nakuru','nku_eld','Diesel',5000],
  ['Eldoret','Total Nakuru','nku_eld','Gasoline',4500],
  ['Eldoret','Shell Thika Road','nbi_eld','Diesel',4000],
  ['Kisumu','Rubis Oginga Odinga','eld_ksu','Diesel',3500],
  ['Kisumu','Total Milimani','eld_ksu','Gasoline',3500],
  ['Kisumu','Rubis Oginga Odinga','eld_ksu','Kerosene',2500],
  ['Kisumu','Shell Uganda Road','eld_ksu','Diesel',4000],
  ['Kisumu','Engen Rupa Mall','eld_ksu','Gasoline',3500],
  ['Kisumu','Total Nakuru','nbi_nyk','Diesel',4500],
  ['Kisumu','Shell Uhuru Highway','nbi_nyk','Gasoline',4000],
  ['Nairobi West','Shell Uhuru Highway','nbi_karen','Kerosene',3000],
  ['Nairobi West','Total Westlands','nbi_thk','Diesel',5000],
  ['Kipevu (Mombasa)','Engen Rupa Mall','msa_nbi','Gasoline',5000],
  ['Nairobi West','Total Milimani','nbi_ksu','Gasoline',4500],
  ['Eldoret','Total Meru','nbi_eld','Diesel',5000],
];

const DEPOT_META: Record<string, { fullName: string; gps: string; approver: string }> = {
  'Nairobi West':     { fullName: 'Nairobi West Depot',           gps: '-1.3207, 36.8074', approver: 'Sarah Kimani'   },
  'Kipevu (Mombasa)':{ fullName: 'Kipevu Oil Storage Facility',  gps: '-4.0435, 39.6682', approver: 'John Mwangi'    },
  'Eldoret':          { fullName: 'Eldoret Depot',                 gps: '0.5143, 35.2698',  approver: 'David Kiplagat' },
  'Kisumu':           { fullName: 'Kisumu Depot',                  gps: '-0.0917, 34.7680', approver: 'Grace Otieno'   },
};

// Approximate ETA offsets by route (hours)
const ROUTE_ETA: Record<string, number> = {
  nbi_karen: 2, nbi_thk: 3, nbi_nak: 4, nbi_mru: 5,
  nku_eld: 3,   eld_ksu: 4, nbi_eld: 6, nbi_ksu: 7,
  msa_nbi: 9,   nbi_nyk: 8,
};

// Trucks where CargoTracking generates alerts (i%7===0 || i%13===0)
const ALERT_INDICES = new Set([0,7,13,14,21,26,28,35,39,42,49]);
// Trucks with unauthorised stop (i%11===0)
const STOP_INDICES  = new Set([0,11,22,33,44]);

function generateSCTTransactions() {
  return FLEET_DEFS.map(([depotShort, destination, routeKey, fuelType, volume], i) => {
    const depot   = DEPOT_META[depotShort];
    const forced  = ALERT_INDICES.has(i) || STOP_INDICES.has(i);
    const status  = forced || i % 2 === 1 ? 'in-transit' : 'completed';
    const date    = status === 'completed'
      ? (i % 3 === 0 ? '2026-02-08' : '2026-02-09')
      : '2026-02-10';
    const hour    = 6 + (i * 7) % 10;
    const min     = (i * 13) % 60;
    const etaH    = (hour + (ROUTE_ETA[routeKey] ?? 4)) % 24;
    const fmtTime = (h: number, m: number) =>
      `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    // Sensor readings consistent with cargo tracking baseline
    const baseTemp    = fuelType === 'Diesel' ? 28 + (i % 8) : fuelType === 'Gasoline' ? 26 + (i % 6) : 25 + (i % 5);
    const tempDec     = (i * 3) % 10;
    const baseDensity = fuelType === 'Diesel' ? 830 + (i % 10) : fuelType === 'Gasoline' ? 740 + (i % 10) : 790 + (i % 8);
    const densDec     = (i * 2) % 10;
    const compartment = volume >= 5500 ? 'C1, C2, C3' : volume >= 4000 ? 'C1, C2' : 'C1';
    const markerConc  = (14.5 + (i * 0.11) % 1.5).toFixed(1);
    const dateCompact = date.replace(/-/g, '');
    return {
      id:                  `TXN-${String(i + 1).padStart(3,'0')}`,
      truckId:             `TRK-${String(i + 1).padStart(3,'0')}`,
      from:                depot.fullName,
      to:                  destination,
      vehicle:             FLEET_PLATES[i],
      status,
      volume,
      type:                fuelType,
      date,
      time:                fmtTime(hour, min),
      driver:              FLEET_DRIVERS[i],
      driverLicense:       FLEET_LICENSES[i],
      transporter:         FLEET_TRANSPORTERS[i % FLEET_TRANSPORTERS.length],
      loadingBay:          `Bay ${(i % 3) + 1}`,
      compartment,
      sealNumberLoading:   `SL-${dateCompact}-${String(i + 1).padStart(3,'0')}`,
      sealNumberDelivery:  `SD-${dateCompact}-${String(i + 1).padStart(3,'0')}`,
      markerType:          'EPRA Molecular Marker',
      markerConcentration: `${markerConc} ppm`,
      markerBatchNo:       `MBN-2026-${String(87 + i).padStart(4,'0')}`,
      temperature:         `${baseTemp}.${tempDec}°C`,
      density:             `${baseDensity}.${densDec} kg/m³`,
      loadingTicket:       `LT-2026-${String(341 + i).padStart(5,'0')}`,
      expectedDelivery:    `${date} ${fmtTime(etaH, min)}`,
      gpsLoading:          depot.gps,
      approvedBy:          depot.approver,
    };
  });
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── LPG CYLINDER DATA ───────────────────────────────────────────────────────
const LPG_BRANDS = ['Total Gas', 'K-Gas', 'ProGas', 'Hashi Energy', 'Oryx Gas', 'Rubis LPG', 'Ven Gas'] as const;
const LPG_FILLING_PLANTS = [
  { id: 'FPL-001', name: 'KPRL Mombasa Bottling Plant',    city: 'Changamwe, Mombasa' },
  { id: 'FPL-002', name: 'Total Gas Nairobi Filling Plant', city: 'Industrial Area, Nairobi' },
  { id: 'FPL-003', name: 'Rubis LPG Eldoret Depot',        city: 'Eldoret Industrial' },
  { id: 'FPL-004', name: 'Hashi Energy Kisumu Plant',      city: 'Kisumu Port' },
  { id: 'FPL-005', name: 'ProGas Nairobi South Plant',     city: 'South B, Nairobi' },
];
const LPG_SIZES = [
  { kg: 3,  label: '3 kg',  tare: 3.5, max: 6.5,  wc: 6.7,  wp: 17.5, tp: 30 },
  { kg: 6,  label: '6 kg',  tare: 5.0, max: 11.0, wc: 13.4, wp: 17.5, tp: 30 },
];
const LPG_VALVE_TYPES = ['POL Valve (KGV-S)', 'POL Valve (KGV-L)', 'CGA-510 Valve', 'BS 341-3 Valve'];
const LPG_COUNTRIES   = ['Kenya', 'India', 'China', 'Turkey', 'South Africa'];
const LPG_DISTRIBUTORS = [
  { id: 'DIST-001', name: 'Nairobi LPG Distributors Ltd',   city: 'Industrial Area, Nairobi' },
  { id: 'DIST-002', name: 'Mombasa Gas Merchants Co.',       city: 'Mombasa Island' },
  { id: 'DIST-003', name: 'Rift Valley LPG Suppliers',       city: 'Nakuru Town' },
  { id: 'DIST-004', name: 'Lake Region Gas Distributors',    city: 'Kisumu Central' },
  { id: 'DIST-005', name: 'Mt. Kenya Gas Traders Ltd',       city: 'Nyeri Town' },
  { id: 'DIST-006', name: 'Coast Gas & Energy Merchants',    city: 'Kilifi, Coast' },
];

function generateLpgInventories(stations: { id: string; name: string; location: string }[]) {
  return stations.map((stn, si) => {
    const cylinders: any[] = [];
    let seed = si * 31337 + 7;
    const next = () => { seed = (seed * 1664525 + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
    const fmt2 = (n: number) => String(n).padStart(2, '0');

    // Only 3 kg and 6 kg cylinders; counts: 3kg→7-11, 6kg→9-13 (total ≤ 25 per station)
    LPG_SIZES.forEach((sz, szi) => {
      const count = [7, 9][szi] + Math.floor(next() * 5);
      for (let c = 0; c < count; c++) {
        const brand     = LPG_BRANDS[Math.floor(next() * LPG_BRANDS.length)];
        const plant     = LPG_FILLING_PLANTS[Math.floor(next() * LPG_FILLING_PLANTS.length)];
        const valveType = LPG_VALVE_TYPES[Math.floor(next() * LPG_VALVE_TYPES.length)];
        const country   = LPG_COUNTRIES[Math.floor(next() * LPG_COUNTRIES.length)];
        const status    = next() < 0.62 ? 'full' : 'empty';   // no 'in-use'
        const mfgYear   = 2018 + Math.floor(next() * 7);
        const mfgMonth  = 1 + Math.floor(next() * 12);
        // Date of issuance / last revalidation (independent of manufacture)
        const issueYear = 2020 + Math.floor(next() * 5);       // 2020-2024
        const issueMon  = 1 + Math.floor(next() * 12);
        const issueDay  = 1 + Math.floor(next() * 27);
        const fillDay   = 1 + Math.floor(next() * 25);
        const fillMon   = 1 + Math.floor(next() * 2);          // Jan or Feb 2026
        const fillHH    = 6  + Math.floor(next() * 10);
        const fillMM    = Math.floor(next() * 60);
        const dispHH    = 14 + Math.floor(next() * 5);
        const dispMM    = Math.floor(next() * 60);
        const recvHH    = 7  + Math.floor(next() * 8);
        const recvMM    = Math.floor(next() * 60);

        const sizeCode    = String(sz.kg).padStart(2, '0');
        const rfid        = `RFID-KE-${fmt2(si+1)}-${sizeCode}-${String(c+1).padStart(4,'0')}`;
        const serial      = `CYL-${brand.substring(0,2).toUpperCase()}-${mfgYear}-${String(si*1000+szi*200+c+1).padStart(5,'0')}`;
        const valveSerial = `VLV-${fmt2(si+1)}${szi+1}-${String(c+1).padStart(4,'0')}`;
        const kebsCertNo  = `KEBS/KS-836/${issueYear}/${String(Math.floor(next()*90000)+10000).padStart(5,'0')}`;
        const opId        = (pfx: string) => `${pfx}${String(Math.floor(next()*99)+1).padStart(3,'0')}`;

        const dist      = LPG_DISTRIBUTORS[Math.floor(next() * LPG_DISTRIBUTORS.length)];
        const fillSeal  = `FS-${plant.id}-${fmt2(fillMon)}2026-${String(c+1).padStart(4,'0')}`;
        const dispSeal  = `DS-${dist.id}-${fmt2(fillDay)}${fmt2(fillMon)}26-${String(c+1).padStart(3,'0')}`;
        const recvSeal  = `RS-${stn.id}-${fmt2(fillDay+1)}${fmt2(fillMon)}2026-${String(c+1).padStart(3,'0')}`;

        const stampChain: any[] = [
          {
            seq: 1, type: 'fill',
            date: `${fmt2(fillDay)}/${fmt2(fillMon)}/2026`, time: `${fmt2(fillHH)}:${fmt2(fillMM)}`,
            location: plant.name, locationId: plant.id, operatorId: opId('OPR-'),
            stampCode: fillSeal, integrity: 'verified',
            details: `Gas type: LPG (60% Butane / 40% Propane). Filling pressure: ${sz.wp} bar. Gross mass: ${sz.max} kg. Tamper-evident valve seal applied.`,
          },
          {
            seq: 2, type: 'dispatch',
            date: `${fmt2(fillDay)}/${fmt2(fillMon)}/2026`, time: `${fmt2(dispHH)}:${fmt2(dispMM)}`,
            location: dist.name, locationId: dist.id, operatorId: opId('DRV-'),
            stampCode: dispSeal, integrity: 'verified',
            details: `Delivered to ${dist.name}, ${dist.city}. Seal integrity verified on receipt. Cylinder added to distributor stock.`,
          },
          {
            seq: 3, type: 'receive',
            date: `${fmt2(fillDay+1)}/${fmt2(fillMon)}/2026`, time: `${fmt2(recvHH)}:${fmt2(recvMM)}`,
            location: stn.name, locationId: stn.id, operatorId: opId('ATT-'),
            stampCode: recvSeal, integrity: 'verified',
            details: `Distributed from ${dist.name} to ${stn.name}. Seal integrity check PASSED. Cylinder checked into station stock.`,
          },
        ];
        const hasInspection = next() > 0.30;
        if (hasInspection) {
          const inspSeal = `IS-EPRA-${String(Math.floor(next()*9000)+1000).padStart(4,'0')}-26`;
          stampChain.push({
            seq: 4, type: 'inspect',
            date: `${fmt2(fillDay+2)}/${fmt2(fillMon)}/2026`, time: `${fmt2(9+Math.floor(next()*4))}:${fmt2(Math.floor(next()*60))}`,
            location: stn.name, locationId: stn.id,
            operatorId: `EPRA-INS-${String(Math.floor(next()*20)+1).padStart(3,'0')}`,
            stampCode: inspSeal, integrity: 'verified',
            details: 'EPRA routine spot-check. Tare weight verified. Valve condition: OK. KEBS certificate valid.',
          });
        }
        if (next() > 0.45) {
          const consumerRef = `CV-APP-${String(Math.floor(next()*90000)+10000).padStart(5,'0')}`;
          const cvDay = fillDay + 2 + Math.floor(next() * 5);
          const cvHH  = 8 + Math.floor(next() * 13);
          stampChain.push({
            seq: hasInspection ? 5 : 4, type: 'consumer',
            date: `${fmt2(cvDay > 28 ? 28 : cvDay)}/${fmt2(fillMon)}/2026`, time: `${fmt2(cvHH)}:${fmt2(Math.floor(next()*60))}`,
            location: stn.name, locationId: stn.id,
            operatorId: `CONSUMER-APP`,
            stampCode: consumerRef, integrity: 'verified',
            details: 'Cylinder scanned by consumer via EPRA SafeGas smartphone app. RFID tag verified. Seal code matched. Authenticity confirmed.',
          });
        }
        cylinders.push({
          rfid, serial, brand, sizeKg: sz.kg, sizeLabel: sz.label,
          tareWeight: sz.tare, maxGrossWeight: sz.max, waterCapacity: sz.wc,
          workingPressure: sz.wp, testPressure: sz.tp,
          valveType, valveSerial, countryOfManufacture: country,
          manufactureDate:  `${fmt2(mfgMonth)}/${mfgYear}`,
          nextTestDate:     `${fmt2(mfgMonth)}/${mfgYear + 5}`,
          dateOfLastRefill: `${fmt2(fillDay)}/${fmt2(fillMon)}/2026`,
          dateOfIssuance:   `${fmt2(issueDay)}/${fmt2(issueMon)}/${issueYear}`,
          kebsCertNo,
          fillingPlant: plant.name, fillingPlantId: plant.id,
          status,
          refillStampSerial: fillSeal,   // fill stamp – shown only when status === 'full'
          currentSealCode:   stampChain[stampChain.length - 1].stampCode,
          stampChain, stationId: stn.id,
        });
      }
    });

    const summary: Record<number, { total: number; full: number; empty: number }> = {};
    LPG_SIZES.forEach(sz => {
      const s = cylinders.filter(c => c.sizeKg === sz.kg);
      summary[sz.kg] = { total: s.length, full: s.filter(c => c.status === 'full').length, empty: s.filter(c => c.status === 'empty').length };
    });
    return { stationId: stn.id, cylinders, summary, totalCylinders: cylinders.length };
  });
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── UNDERGROUND TANK / ATG SENSOR DATA ──────────────────────────────────────
// Exactly 5 of 15 stations (≈33%) carry Kerosene:  STN-001,005,006,009,013
const KEROSENE_STN_IDS = new Set(['STN-001', 'STN-005', 'STN-006', 'STN-009', 'STN-013']);
const ATG_MODELS = [
  { model: 'Veeder-Root TLS-450PLUS',          mfr: 'Veeder-Root' },
  { model: 'OPW SiteSentinel Integra 100',     mfr: 'OPW' },
  { model: 'Franklin FMS EVO 600D',            mfr: 'Franklin Fueling Systems' },
];

function generateStationTanks(stations: { id: string; name: string; capacity: number; current: number }[]) {
  return stations.map((stn, si) => {
    let seed = si * 7919 + 13;
    const next = () => { seed = (seed * 1664525 + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
    const fmt2 = (n: number) => String(n).padStart(2, '0');

    const hasK   = KEROSENE_STN_IDS.has(stn.id);
    const fuels  = (hasK ? ['Diesel', 'Gasoline', 'Kerosene'] : ['Diesel', 'Gasoline']) as ('Diesel' | 'Gasoline' | 'Kerosene')[];
    // Capacity split: D 45/55 %, G 35/45 %, K 20 %
    const capRatios = hasK ? [0.45, 0.35, 0.20] : [0.55, 0.45];
    const caps    = capRatios.map(r => Math.round(stn.capacity * r));
    // Current split – randomised but forced to sum to stn.current
    const rawFill = fuels.map(() => 0.50 + next() * 0.42);
    const rawCur  = caps.map((c, i) => c * rawFill[i]);
    const scale   = stn.current / rawCur.reduce((a, b) => a + b, 0);
    const currents = rawCur.map((c, i, arr) =>
      i === arr.length - 1
        ? stn.current - rawCur.slice(0, -1).map(v => Math.round(v * scale)).reduce((a, b) => a + b, 0)
        : Math.round(c * scale)
    );

    const baseAtg = Math.floor(next() * ATG_MODELS.length);

    const tanks = fuels.map((fuel, i) => {
      const cap     = caps[i];
      const cur     = currents[i];
      const fillPct = Math.round((cur / cap) * 100);
      const diam    = fuel === 'Kerosene' ? 2000 : cap >= 18000 ? 2700 : cap >= 12000 ? 2400 : 2100;
      const tempC   = Math.round((20 + next() * 12) * 10) / 10;
      const waterMm = Math.floor(next() * 15);
      const statusR = next();
      const sStatus = statusR > 0.93 ? 'offline' : statusR > 0.85 ? 'warning' : 'online';
      const syncMin = sStatus === 'offline' ? 180 + Math.floor(next() * 300)
                    : sStatus === 'warning'  ?  35 + Math.floor(next() * 55)
                    :                            Math.floor(next() * 12);
      const syncStr = syncMin < 60 ? `${syncMin} min ago` : `${Math.floor(syncMin / 60)}h ${syncMin % 60}m ago`;
      const atg     = ATG_MODELS[(baseAtg + i) % ATG_MODELS.length];
      const fCode   = fuel === 'Diesel' ? 'D' : fuel === 'Gasoline' ? 'G' : 'K';
      const stnNum  = stn.id.slice(-3);
      const tankNum = String(i + 1);

      return {
        id:            `TK-${stnNum}-${fCode}${tankNum}`,
        fuelType:      fuel,
        capacity:      cap,
        current:       cur,
        fillPct,
        diameterMm:    diam,
        heightMm:      Math.round(diam * (cur / cap)),
        maxHeightMm:   diam,
        tempC,
        waterBottomMm: waterMm,
        sensor: {
          id:             `SGS-${stnNum}-0${tankNum}`,
          model:          atg.model,
          manufacturer:   atg.mfr,
          status:         sStatus as 'online' | 'warning' | 'offline',
          syncMinsAgo:    syncMin,
          lastSyncStr:    syncStr,
          lastSyncFull:   (() => {
            const d = new Date('2026-02-10T08:00:00');
            d.setMinutes(d.getMinutes() - syncMin);
            return d.toISOString().replace('T', ' ').slice(0, 16);
          })(),
          firmware:        `v${4 + Math.floor(next() * 3)}.${Math.floor(next() * 10)}.${String(Math.floor(next() * 20)).padStart(2, '0')}`,
          signalStrength:  sStatus === 'offline' ? 0 : sStatus === 'warning' ? 30 + Math.floor(next() * 30) : 70 + Math.floor(next() * 30),
          probeSerial:     `PRB-${stnNum}-${fCode}-${String(Math.floor(next() * 9000) + 1000).padStart(4, '0')}`,
          networkAddr:     `192.168.${10 + si}.${10 + i}`,
        },
      };
    });

    return { stationId: stn.id, tanks, hasKerosene: hasK };
  });
}
// ─────────────────────────────────────────────────────────────────────────────

const FuelIntegrityApp = () => {
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);
  const [currentView, setCurrentView] = useState('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanType, setScanType] = useState<'loading' | 'delivery' | 'consignment'>('delivery');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [deliveryRegistration, setDeliveryRegistration] = useState<any>(null);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showInspectionReport, setShowInspectionReport] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [licensePlateInput, setLicensePlateInput] = useState('');
  const [licensePlateLoading, setLicensePlateLoading] = useState(false);
  const [transitLoadRegistration, setTransitLoadRegistration] = useState<any>(null);
  const [transitLoadConfirmed, setTransitLoadConfirmed] = useState(false);
  const [licensePlateError, setLicensePlateError] = useState<string | null>(null);
  const [scanDeliveryConfirm, setScanDeliveryConfirm] = useState<any>(null);
  const [appSettings, setAppSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('epra_appSettings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      appTitle: 'Fuel Integrity',
      appSubtitle: 'Management System',
      footerText: 'Fuel Integrity',
      subFooterText: 'Management System',
    };
  });
  const [profilePermissions, setProfilePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem('epra_profilePermissions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      admin: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true, tracking: true },
      operator: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true, tracking: true },
      station_operator: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true, tracking: true },
      inspector: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true, tracking: true },
    };
  });
  // ── LANGUAGE ──
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('epra_lang') as Lang) || 'en');
  useEffect(() => { localStorage.setItem('epra_lang', lang); }, [lang]);
  const t = (key: string, vars?: Record<string, string | number>): string => {
    let s = translations[lang]?.[key] ?? translations.en[key] ?? key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, String(v)); });
    return s;
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<string>('qr-reader-' + Math.random().toString(36).substr(2, 9));

  const [depots] = useState([
    { id: 'DEP-001', name: 'Kipevu Oil Storage Facility', location: 'Mombasa, Coast', company: 'Kenya Pipeline Company', capacity: 450000, current: 385000, contact: 'John Mwangi', phone: '+254 722 123456', email: 'j.mwangi@kpc.co.ke', website: 'www.kpc.co.ke', coordinates: '-4.0435, 39.6682' },
    { id: 'DEP-002', name: 'Nairobi West Depot', location: 'Nairobi, Nairobi County', company: 'Total Energies Kenya', capacity: 320000, current: 275000, contact: 'Sarah Kimani', phone: '+254 733 234567', email: 's.kimani@totalenergies.co.ke', website: 'www.totalenergies.co.ke', coordinates: '-1.3207, 36.8074' },
    { id: 'DEP-003', name: 'Eldoret Depot', location: 'Eldoret, Uasin Gishu County', company: 'Vivo Energy Kenya (Shell)', capacity: 180000, current: 152000, contact: 'David Kiplagat', phone: '+254 744 345678', email: 'd.kiplagat@shell.co.ke', website: 'www.shell.co.ke', coordinates: '0.5143, 35.2698' },
    { id: 'DEP-004', name: 'Kisumu Depot', location: 'Kisumu, Kisumu County', company: 'Rubis Energy Kenya', capacity: 150000, current: 128000, contact: 'Grace Otieno', phone: '+254 755 456789', email: 'g.otieno@rubis.co.ke', website: 'www.rubisenergy.co.ke', coordinates: '-0.0917, 34.7680' }
  ]);

  const [gasStations] = useState([
    { id: 'STN-001', name: 'Total Westlands', location: 'Westlands, Nairobi', company: 'Total Energies Kenya', capacity: 45000, current: 38000, contact: 'Peter Kariuki', phone: '+254 720 111222', email: 'westlands@totalenergies.co.ke', depot: 'DEP-002', coordinates: '-1.2641, 36.8047', inspection: { lastDate: '03/02/2026', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-002', name: 'Shell Uhuru Highway', location: 'CBD, Nairobi', company: 'Vivo Energy Kenya (Shell)', capacity: 50000, current: 42000, contact: 'Mary Wanjiru', phone: '+254 721 222333', email: 'uhuru@shell.co.ke', depot: 'DEP-002', coordinates: '-1.2864, 36.8172', inspection: { lastDate: '05/02/2026', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-003', name: 'Rubis Kilimani', location: 'Kilimani, Nairobi', company: 'Rubis Energy Kenya', capacity: 40000, current: 35000, contact: 'James Odhiambo', phone: '+254 722 333444', email: 'kilimani@rubis.co.ke', depot: 'DEP-002', coordinates: '-1.2901, 36.7828' },
    { id: 'STN-004', name: 'Engen Karen', location: 'Karen, Nairobi', company: 'Engen Kenya', capacity: 38000, current: 32000, contact: 'Anne Muthoni', phone: '+254 723 444555', email: 'karen@engen.co.ke', depot: 'DEP-002', coordinates: '-1.3197, 36.7076', inspection: { lastDate: '07/02/2026', result: 'FAIL', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-005', name: 'Total Nyali', location: 'Nyali, Mombasa', company: 'Total Energies Kenya', capacity: 42000, current: 36000, contact: 'Ali Hassan', phone: '+254 724 555666', email: 'nyali@totalenergies.co.ke', depot: 'DEP-001', coordinates: '-4.0435, 39.7196', inspection: { lastDate: '10/02/2026', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-006', name: 'Shell Moi Avenue', location: 'CBD, Mombasa', company: 'Vivo Energy Kenya (Shell)', capacity: 48000, current: 40000, contact: 'Fatuma Mohamed', phone: '+254 725 666777', email: 'moiave@shell.co.ke', depot: 'DEP-001', coordinates: '-4.0435, 39.6682', inspection: { lastDate: '12/02/2026', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-007', name: 'Rubis Oginga Odinga', location: 'Kisumu Central', company: 'Rubis Energy Kenya', capacity: 35000, current: 30000, contact: 'Michael Omondi', phone: '+254 726 777888', email: 'kisumu@rubis.co.ke', depot: 'DEP-004', coordinates: '-0.0917, 34.7680' },
    { id: 'STN-008', name: 'Total Milimani', location: 'Milimani, Kisumu', company: 'Total Energies Kenya', capacity: 38000, current: 33000, contact: 'Lucy Achieng', phone: '+254 727 888999', email: 'milimani@totalenergies.co.ke', depot: 'DEP-004', coordinates: '-0.1022, 34.7617', inspection: { lastDate: '29/11/2022', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-009', name: 'Shell Uganda Road', location: 'Eldoret Town', company: 'Vivo Energy Kenya (Shell)', capacity: 40000, current: 35000, contact: 'Daniel Kiptoo', phone: '+254 728 999000', email: 'eldoret@shell.co.ke', depot: 'DEP-003', coordinates: '0.5143, 35.2698', inspection: { lastDate: '02/02/2026', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-010', name: 'Engen Rupa Mall', location: 'Eldoret', company: 'Engen Kenya', capacity: 36000, current: 31000, contact: 'Ruth Chebet', phone: '+254 729 000111', email: 'rupa@engen.co.ke', depot: 'DEP-003', coordinates: '0.5201, 35.2817', inspection: { lastDate: '08/02/2026', result: 'FAIL', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-011', name: 'Total Kenyatta Avenue', location: 'Nakuru Town', company: 'Total Energies Kenya', capacity: 37000, current: 32000, contact: 'Simon Kamau', phone: '+254 730 111222', email: 'nakuru@totalenergies.co.ke', depot: 'DEP-002', coordinates: '-0.3031, 36.0800' },
    { id: 'STN-012', name: 'Rubis Lanet', location: 'Lanet, Nakuru', company: 'Rubis Energy Kenya', capacity: 34000, current: 29000, contact: 'Elizabeth Wambui', phone: '+254 731 222333', email: 'lanet@rubis.co.ke', depot: 'DEP-002', coordinates: '-0.2827, 36.0983', inspection: { lastDate: '12/12/2022', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-013', name: 'Shell Thika Road', location: 'Thika', company: 'Vivo Energy Kenya (Shell)', capacity: 39000, current: 34000, contact: 'Patrick Njenga', phone: '+254 732 333444', email: 'thika@shell.co.ke', depot: 'DEP-002', coordinates: '-1.0332, 37.0692', inspection: { lastDate: '08/01/2023', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } },
    { id: 'STN-014', name: 'Total Blue Post', location: 'Thika Town', company: 'Total Energies Kenya', capacity: 35000, current: 30000, contact: 'Jane Njeri', phone: '+254 733 444555', email: 'bluepost@totalenergies.co.ke', depot: 'DEP-002', coordinates: '-1.0369, 37.0903' },
    { id: 'STN-015', name: 'Engen Meru', location: 'Meru Town', company: 'Engen Kenya', capacity: 33000, current: 28000, contact: 'Francis Mwiti', phone: '+254 734 555666', email: 'meru@engen.co.ke', depot: 'DEP-002', coordinates: '0.0469, 37.6497', inspection: { lastDate: '20/12/2022', result: 'PASS', footage: 'https://www.youtube.com/watch?v=43q_b26iWPE' } }
  ]);

  const [lpgInventories] = useState(() => generateLpgInventories(gasStations));
  const [selectedCylinder, setSelectedCylinder] = useState<any>(null);
  const [lpgSizeFilter, setLpgSizeFilter] = useState<number | null>(null);
  const [cylinderModalTab, setCylinderModalTab] = useState<'events' | 'inspections'>('events');
  const [stationTanks] = useState(() => generateStationTanks(gasStations));
  const [selectedStationLayout, setSelectedStationLayout] = useState<{ station: any; tankData: any } | null>(null);
  const [cylinderListModal, setCylinderListModal] = useState<{ inv: any; stationName: string } | null>(null);

  const [transactions, setTransactions] = useState(generateSCTTransactions);

  const [stockData] = useState([
    { location: 'Kipevu Oil Storage Facility', opening: 450000, current: 385000, capacity: 450000, variance: 0.08, receipts: 120000, withdrawals: 185000, losses: 150, company: 'Kenya Pipeline Company', diesel: 185000, gasoline: 135000, kerosene: 65000 },
    { location: 'Nairobi West Depot', opening: 320000, current: 275000, capacity: 320000, variance: 0.11, receipts: 95000, withdrawals: 140000, losses: 120, company: 'Total Energies Kenya', diesel: 130000, gasoline: 100000, kerosene: 45000 },
    { location: 'Eldoret Depot', opening: 180000, current: 152000, capacity: 180000, variance: 0.09, receipts: 42000, withdrawals: 70000, losses: 80, company: 'Vivo Energy Kenya (Shell)', diesel: 72000, gasoline: 55000, kerosene: 25000 },
    { location: 'Kisumu Depot', opening: 150000, current: 128000, capacity: 150000, variance: 0.12, receipts: 38000, withdrawals: 60000, losses: 70, company: 'Rubis Energy Kenya', diesel: 60000, gasoline: 46000, kerosene: 22000 },
    { location: 'Total Westlands', opening: 45000, current: 38000, capacity: 45000, variance: 0.15, receipts: 15000, withdrawals: 22000, losses: 30, company: 'Total Energies Kenya', diesel: 18000, gasoline: 14000, kerosene: 6000 },
    { location: 'Shell Uhuru Highway', opening: 50000, current: 42000, capacity: 50000, variance: 0.13, receipts: 18000, withdrawals: 26000, losses: 25, company: 'Vivo Energy Kenya (Shell)', diesel: 20000, gasoline: 15000, kerosene: 7000 },
    { location: 'Rubis Kilimani', opening: 40000, current: 35000, capacity: 40000, variance: 0.18, receipts: 12000, withdrawals: 17000, losses: 20, company: 'Rubis Energy Kenya', diesel: 16000, gasoline: 13000, kerosene: 6000 },
    { location: 'Total Nyali', opening: 42000, current: 36000, capacity: 42000, variance: 0.10, receipts: 14000, withdrawals: 20000, losses: 15, company: 'Total Energies Kenya', diesel: 17000, gasoline: 13000, kerosene: 6000 }
  ]);

  const [incidents] = useState([
    { id: 'INC-001', location: 'Rubis Kilimani', type: 'Variance Breach', severity: 'high', timestamp: '2026-02-09 10:30', status: 'open', assignedTo: 'James Odhiambo' },
    { id: 'INC-002', location: 'Total Kenyatta Avenue', type: 'Variance Breach', severity: 'high', timestamp: '2026-02-09 11:15', status: 'open', assignedTo: 'Simon Kamau' },
    { id: 'INC-003', location: 'Shell Moi Avenue', type: 'Delayed Transaction', severity: 'medium', timestamp: '2026-02-09 09:45', status: 'investigating', assignedTo: 'Fatuma Mohamed' },
    { id: 'INC-004', location: 'Total Westlands', type: 'Volume Discrepancy', severity: 'medium', timestamp: '2026-02-08 16:20', status: 'resolved', assignedTo: 'Peter Kariuki' },
    { id: 'INC-005', location: 'Nairobi West Depot', type: 'Sensor Offline', severity: 'low', timestamp: '2026-02-08 14:10', status: 'resolved', assignedTo: 'Sarah Kimani' }
  ]);

  // Historical stock data – 7-day snapshots for each monitored location
  const historicalStockData = (() => {
    const days = [
      { date: '2026-02-04', factor: 0.0 },
      { date: '2026-02-05', factor: 0.15 },
      { date: '2026-02-06', factor: 0.32 },
      { date: '2026-02-07', factor: 0.45 },
      { date: '2026-02-08', factor: 0.61 },
      { date: '2026-02-09', factor: 0.78 },
      { date: '2026-02-10', factor: 1.0 },
    ];
    return stockData.flatMap(stock =>
      days.map(({ date, factor }) => ({
        date,
        location: stock.location,
        stock: Math.round(stock.opening + (stock.current - stock.opening) * factor),
        capacity: stock.capacity,
        company: stock.company,
      }))
    );
  })();

  const stopCamera = useCallback(() => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current?.clear();
        html5QrCodeRef.current = null;
      }).catch(() => {
        html5QrCodeRef.current = null;
      });
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setScannerActive(false);
    setScannerError(null);
  }, []);

  const startCameraScanner = useCallback((type: 'loading' | 'delivery' | 'consignment') => {
    setScanType(type);
    setScannerActive(true);
    setScannerError(null);
    setScannedData(null);
    setDeliveryRegistration(null);
    setDeliveryConfirmed(false);
  }, []);

  const generateConsignment = useCallback((plate: string) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);
    const txnNum = String(transactions.length + 1).padStart(3, '0');
    const depotIndex = Math.floor(Math.random() * depots.length);
    const stationIndex = Math.floor(Math.random() * gasStations.length);
    const depot = depots[depotIndex];
    const station = gasStations[stationIndex];
    const fuelTypes = ['Diesel', 'Gasoline'];
    const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
    const volume = (Math.floor(Math.random() * 6) + 3) * 1000;
    const drivers = ['James Mwangi', 'Peter Ochieng', 'Mary Wanjiku', 'John Kamau', 'Alice Njeri'];
    const transporters = ['KenTrans Logistics Ltd', 'Coast Fuel Carriers', 'Rift Valley Transporters', 'SafeHaul Kenya Ltd', 'Lake Basin Logistics'];
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const transporter = transporters[Math.floor(Math.random() * transporters.length)];
    const expectedDelivery = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    return {
      id: `TXN-${txnNum}`,
      from: depot.name,
      to: station.name,
      vehicle: plate,
      status: 'in-transit' as const,
      volume,
      type: fuelType,
      date: dateStr,
      time: timeStr,
      driver,
      driverLicense: `DL-${now.getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
      transporter,
      loadingBay: `Bay ${Math.floor(Math.random() * 4) + 1}`,
      compartment: volume > 5000 ? 'C1, C2, C3' : volume > 3000 ? 'C1, C2' : 'C1',
      sealNumberLoading: `SL-${dateStr.replace(/-/g, '')}-${txnNum}`,
      sealNumberDelivery: `SD-${dateStr.replace(/-/g, '')}-${txnNum}`,
      markerType: 'EPRA Molecular Marker',
      markerConcentration: `${(14.5 + Math.random()).toFixed(1)} ppm`,
      markerBatchNo: `MBN-${now.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      temperature: `${(20 + Math.random() * 12).toFixed(1)}°C`,
      density: fuelType === 'Diesel' ? `${(834 + Math.random() * 3).toFixed(1)} kg/m³` : `${(747 + Math.random() * 3).toFixed(1)} kg/m³`,
      loadingTicket: `LT-${now.getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      expectedDelivery: `${expectedDelivery.toISOString().slice(0, 10)} ${expectedDelivery.toTimeString().slice(0, 5)}`,
      gpsLoading: depot.coordinates,
      approvedBy: depot.contact,
    };
  }, [transactions, depots, gasStations]);

  const handleQRCodeScanned = useCallback((decodedText: string) => {
    stopCamera();
    try {
      const data = JSON.parse(decodedText);
      if (scanType === 'consignment') {
        // Consignment scan: match by transactionId or vehicle, or generate
        const matchedTxn = transactions.find(t =>
          t.id === data.transactionId || t.id === data.txnId ||
          (data.vehicle && t.vehicle.replace(/\s+/g, '').toUpperCase() === data.vehicle.replace(/\s+/g, '').toUpperCase())
        );
        const txn = matchedTxn || generateConsignment(data.vehicle || data.transactionId || 'UNKNOWN');
        if (txn.status === 'in-transit') {
          setScanDeliveryConfirm({ transaction: txn, scannedAt: new Date().toISOString() });
        } else {
          setTransitLoadRegistration({ transaction: txn, lookedUpAt: new Date().toISOString() });
        }
      } else if (scanType === 'delivery') {
        // Match scanned QR to an existing loading transaction
        const matchedTxn = transactions.find(t =>
          t.id === data.transactionId || t.id === data.txnId
        );
        if (matchedTxn) {
          setDeliveryRegistration({
            transaction: matchedTxn,
            scannedAt: new Date().toISOString(),
            qrData: data,
          });
        } else {
          setScannedData(decodedText);
          setScannerError('No matching loading transaction found for this QR code.');
        }
      } else {
        setScannedData(decodedText);
      }
    } catch {
      // If not valid JSON, still show the raw data
      setScannedData(decodedText);
      if (scanType === 'delivery') {
        setScannerError('Invalid QR code format. Please scan a valid loading transaction QR code.');
      }
    }
  }, [scanType, transactions, stopCamera, generateConsignment]);

  // Persist appSettings to localStorage
  useEffect(() => {
    try { localStorage.setItem('epra_appSettings', JSON.stringify(appSettings)); } catch {}
  }, [appSettings]);

  // Persist profilePermissions to localStorage
  useEffect(() => {
    try { localStorage.setItem('epra_profilePermissions', JSON.stringify(profilePermissions)); } catch {}
  }, [profilePermissions]);

  // Initialize camera scanner when scannerActive becomes true
  useEffect(() => {
    if (!scannerActive) return;

    const containerId = scannerContainerRef.current;
    // Small delay to ensure the DOM element is rendered
    const timeout = setTimeout(() => {
      const containerEl = document.getElementById(containerId);
      if (!containerEl) return;

      const html5QrCode = new Html5Qrcode(containerId);
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleQRCodeScanned(decodedText);
        },
        () => {} // ignore scan failures (no QR in frame)
      ).catch((err: any) => {
        console.error('Camera start error:', err);
        setScannerError('Could not access camera. Please ensure camera permissions are granted.');
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, [scannerActive, handleQRCodeScanned]);

  const handleConfirmDelivery = () => {
    setDeliveryConfirmed(true);
  };

  const handleConfirmDeliveryFromDetail = (txnId: string) => {
    setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, status: 'completed' } : t));
    setSelectedTransaction(null);
  };

  const handleLicensePlateLookup = () => {
    const plate = licensePlateInput.trim().toUpperCase();
    if (!plate) return;
    setLicensePlateError(null);
    setLicensePlateLoading(true);
    // Simulate network lookup delay
    setTimeout(() => {
      const matchedTxn = transactions.find(t =>
        t.vehicle.replace(/\s+/g, '').toUpperCase() === plate.replace(/\s+/g, '').toUpperCase()
      );
      setLicensePlateLoading(false);
      const txn = matchedTxn || generateConsignment(plate);
      setTransitLoadRegistration({ transaction: txn, lookedUpAt: new Date().toISOString() });
    }, 1500);
  };

  const handleConfirmTransitLoad = () => {
    if (transitLoadRegistration) {
      const txn = { ...transitLoadRegistration.transaction, status: 'in-transit' };
      setTransactions(prev => {
        const exists = prev.some(t => t.id === txn.id);
        if (exists) {
          return prev.map(t => t.id === txn.id ? { ...t, status: 'in-transit' } : t);
        }
        return [txn, ...prev];
      });
    }
    setTransitLoadConfirmed(true);
  };

  const handleCloseTransitLoad = () => {
    setTransitLoadRegistration(null);
    setTransitLoadConfirmed(false);
    setLicensePlateInput('');
  };

  const handleLogin = (role: string) => {
    setCurrentUser({ role, name: role === 'admin' ? 'Admin User' : role === 'operator' ? 'Depot Operator' : role === 'station_operator' ? 'Station Operator' : 'Inspector' });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setMenuOpen(false);
  };

  // ── LOGIN ──
  const LoginView = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-600 to-yellow-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
            <Fuel className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('login.title1')}</h1>
        <h2 className="text-xl font-bold text-center text-green-700 mb-4">{t('login.title2')}</h2>
        {/* Language picker */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(Object.keys(langLabels) as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${lang === l ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}>
              <span>{langLabels[l].flag}</span>
              <span className="hidden sm:inline">{langLabels[l].label}</span>
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <button onClick={() => handleLogin('admin')} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">{t('login.admin')}</button>
          <button onClick={() => handleLogin('operator')} className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition">{t('login.depot')}</button>
          <button onClick={() => handleLogin('station_operator')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">{t('login.station')}</button>
          <button disabled className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed opacity-60">{t('login.inspector')}</button>
        </div>
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs text-gray-500">{appSettings.footerText}</p>
              <p className="text-xs text-gray-500 mt-1">{appSettings.subFooterText}</p>
            </div>
            <p className="text-xs text-gray-400">build #{process.env.REACT_APP_GIT_HASH || '0000000'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  const DashboardView = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t('dash.title')}</h2>
        <div className="text-right">
          <p className="text-xs text-gray-500">{t('dash.loggedAs')}</p>
          <p className="text-sm font-semibold text-green-700">{currentUser?.name}</p>
        </div>
      </div>

      {/* National Stock */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-base font-bold text-gray-700 mb-4">{t('dash.nationalStock')}</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-600">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">{t('dash.diesel')}</p>
            <p className="text-2xl font-black text-blue-700">{stockData.reduce((a, b) => a + b.diesel, 0).toLocaleString()}</p>
            <p className="text-xs text-blue-400 mt-0.5">L</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-600">
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1">{t('dash.gasoline')}</p>
            <p className="text-2xl font-black text-amber-700">{stockData.reduce((a, b) => a + b.gasoline, 0).toLocaleString()}</p>
            <p className="text-xs text-amber-400 mt-0.5">L</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-xl border-l-4 border-cyan-600">
            <p className="text-xs font-semibold text-cyan-500 uppercase tracking-wide mb-1">{t('dash.kerosene')}</p>
            <p className="text-2xl font-black text-cyan-700">{stockData.reduce((a, b) => a + b.kerosene, 0).toLocaleString()}</p>
            <p className="text-xs text-cyan-400 mt-0.5">L</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: t('dash.activeTx'),        value: transactions.filter(tx => tx.status === 'in-transit').length, Icon: Truck,        bg: 'bg-green-50',   border: 'border-green-500',   text: 'text-green-600',   iconBg: 'bg-green-100'  },
          { label: t('dash.completedToday'),  value: transactions.filter(tx => tx.status === 'completed').length,  Icon: CheckCircle,  bg: 'bg-yellow-50',  border: 'border-yellow-500',  text: 'text-yellow-600',  iconBg: 'bg-yellow-100' },
          { label: t('dash.activeIncidents'), value: incidents.filter(i => i.status === 'open').length,             Icon: AlertCircle,  bg: 'bg-red-50',     border: 'border-red-500',     text: 'text-red-600',     iconBg: 'bg-red-100'    },
          { label: t('dash.fuelDepots'),      value: depots.length,                                                 Icon: Building2,    bg: 'bg-indigo-50',  border: 'border-indigo-500',  text: 'text-indigo-600',  iconBg: 'bg-indigo-100' },
          { label: t('dash.fuelStations'),    value: gasStations.length,                                            Icon: Store,        bg: 'bg-teal-50',    border: 'border-teal-500',    text: 'text-teal-600',    iconBg: 'bg-teal-100'   },
          { label: t('dash.monthlyInsp'),     value: gasStations.filter(s => { if (!s.inspection) return false; const parts = s.inspection.lastDate.split('/'); const now = new Date(); return parseInt(parts[1]) === now.getMonth() + 1 && parseInt(parts[2]) === now.getFullYear(); }).length, Icon: Crosshair, bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-600', iconBg: 'bg-orange-100' },
          { label: t('dash.compliance'),      value: (() => { const inspected = gasStations.filter(s => s.inspection); const passed = inspected.filter(s => s.inspection?.result === 'PASS'); return (inspected.length > 0 ? Math.round((passed.length / inspected.length) * 100) : 0) + '%'; })(), Icon: Shield, bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-600', iconBg: 'bg-purple-100' },
        ].map(({ label, value, Icon, bg, border, text, iconBg }) => (
          <div key={label} className={`${bg} p-5 rounded-xl border-l-4 ${border} shadow-sm`}>
            <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mb-3`}>
              <Icon className={`w-7 h-7 ${text}`} />
            </div>
            <p className={`text-4xl font-black ${text} leading-none mb-2`}>{value}</p>
            <p className="text-sm font-semibold text-gray-600 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── SCT LOADING DETAIL MODAL ──
  const SCTLoadingDetailModal = () => {
    const [detailTab, setDetailTab] = useState<'details' | 'transport'>('details');
    if (!selectedTransaction) return null;
    const txn = selectedTransaction;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTransaction(null)}>
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-green-700 to-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{t('cons.detail')}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-green-100 text-sm">{txn.id}</p>
                  {(txn as any).truckId && (
                    <button
                      onClick={() => { setSelectedTransaction(null); setCurrentView('tracking'); }}
                      className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition"
                      title="View on live tracking map"
                    >
                      <Navigation className="w-3 h-3" />{(txn as any).truckId} · Live Map
                    </button>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="text-white hover:text-green-200"><X className="w-6 h-6" /></button>
            </div>
            {txn.status === 'in-transit' && (
              <div className="mt-3 flex items-center gap-3 bg-white rounded-lg p-3">
                <div className="bg-white p-2 rounded-lg flex-shrink-0">
                  <QRCodeSVG
                    value={txn.id}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  <p className="font-semibold text-gray-800 text-sm mb-1">Consignment QR</p>
                  <p>Scan to receive the consignment</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 space-y-4">
            {/* Status Banner */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${txn.status === 'completed' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              {txn.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-yellow-600" />}
              <span className={`font-semibold text-sm ${txn.status === 'completed' ? 'text-green-800' : 'text-yellow-800'}`}>{txn.status === 'completed' ? t('cons.transferDone') : t('cons.inTransit')}</span>
            </div>

            {/* Confirm Delivery Button for in-transit consignments */}
            {txn.status === 'in-transit' && (
              <button
                onClick={() => handleConfirmDeliveryFromDetail(txn.id)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <ClipboardCheck className="w-5 h-5" />
                {t('cons.confirmDelivery')}
              </button>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setDetailTab('details')} className={`flex-1 py-2 rounded-md font-semibold transition text-sm ${detailTab === 'details' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>{t('cons.consignment')}</button>
              <button onClick={() => setDetailTab('transport')} className={`flex-1 py-2 rounded-md font-semibold transition text-sm ${detailTab === 'transport' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>{t('cons.transport')}</button>
            </div>

            {detailTab === 'details' && (
              <>
                {/* Transfer Route */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.route')}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">{t('cons.sourceDepot')}</p>
                      <p className="font-semibold text-sm text-gray-800">{txn.from}</p>
                    </div>
                    <div className="text-green-600 font-bold text-lg">&rarr;</div>
                    <div className="flex-1 text-center">
                      <Store className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">{t('cons.destination')}</p>
                      <p className="font-semibold text-sm text-gray-800">{txn.to}</p>
                    </div>
                  </div>
                </div>

                {/* Fuel & Loading Information */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.fuelLoading')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.productType')}</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                    <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.volumeLoaded')}</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.temperature')}</p><p className="font-semibold text-gray-800">{txn.temperature}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.density')}</p><p className="font-semibold text-gray-800">{txn.density}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.loadingBay')}</p><p className="font-semibold text-gray-800">{txn.loadingBay}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.compartments')}</p><p className="font-semibold text-gray-800">{txn.compartment}</p></div>
                  </div>
                </div>

                {/* Fuel Marking Details */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.fuelMarking')}</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.markerType')}</span><span className="font-semibold text-sm text-gray-800">{txn.markerType}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.batchNo')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.markerBatchNo}</span></div>
                  </div>
                </div>

              </>
            )}

            {detailTab === 'transport' && (
              <>
                {/* Transport Details */}
                <div>
                  <div className="space-y-3">
                    {(txn as any).truckId && (
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-sm text-gray-600">{t('cons.trackingUnit')}</span>
                        <button
                          onClick={() => { setSelectedTransaction(null); setCurrentView('tracking'); }}
                          className="font-semibold text-sm font-mono text-blue-700 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3" />{(txn as any).truckId}
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.vehicle')}</span><span className="font-semibold text-sm text-gray-800">{txn.vehicle}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.driver')}</span><span className="font-semibold text-sm text-gray-800">{txn.driver}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.driverLicense')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.driverLicense}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.transporter')}</span><span className="font-semibold text-sm text-gray-800">{txn.transporter}</span></div>
                  </div>
                </div>

                {/* Seal Numbers */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.seals')}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.loadingSeal')}</p><p className="font-semibold text-sm text-gray-800 font-mono">{txn.sealNumberLoading}</p></div>
                  </div>
                </div>

                <div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.loadingDatetime')}</span><span className="font-semibold text-sm text-gray-800">{txn.date} {txn.time}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.expectedDelivery')}</span><span className="font-semibold text-sm text-gray-800">{txn.expectedDelivery}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.loadingTicket')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.loadingTicket}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.gps')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.gpsLoading}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.approvedBy')}</span><span className="font-semibold text-sm text-gray-800">{txn.approvedBy}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── DELIVERY REGISTRATION MODAL ──
  const DeliveryRegistrationModal = () => {
    if (!deliveryRegistration) return null;
    const txn = deliveryRegistration.transaction;
    const scanTime = new Date(deliveryRegistration.scannedAt);

    if (deliveryConfirmed) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => { setDeliveryRegistration(null); setDeliveryConfirmed(false); }}>
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-lg text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-3" />
              <h3 className="font-bold text-xl">{t('del.registered')}</h3>
              <p className="text-green-100 mt-1">Transaction {txn.id} confirmed</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-500">Transaction ID</p><p className="font-semibold text-gray-800">{txn.id}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><p className="font-semibold text-green-700">Delivered</p></div>
                  <div><p className="text-xs text-gray-500">Volume</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                  <div><p className="text-xs text-gray-500">Product</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">{t('del.deliveredTo')}</p><p className="font-semibold text-gray-800">{txn.to}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">{t('del.confirmedAt')}</p><p className="font-semibold text-gray-800">{scanTime.toLocaleString()}</p></div>
                </div>
              </div>
              <button onClick={() => { setDeliveryRegistration(null); setDeliveryConfirmed(false); }} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">{t('del.done')}</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setDeliveryRegistration(null)}>
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{t('del.register')}</h3>
                <p className="text-yellow-100 text-sm">{txn.id} — {t('del.confirmReceipt')}</p>
              </div>
              <button onClick={() => setDeliveryRegistration(null)} className="text-white hover:text-yellow-200"><X className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Scanned notification */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <Camera className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-sm text-green-800">QR Code Scanned — Loading Transaction Matched</span>
            </div>

            {/* Transfer Route */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.route')}</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                  <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{t('cons.sourceDepot')}</p>
                  <p className="font-semibold text-sm text-gray-800">{txn.from}</p>
                </div>
                <div className="text-green-600 font-bold text-lg">→</div>
                <div className="flex-1 text-center">
                  <Store className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{t('cons.destination')}</p>
                  <p className="font-semibold text-sm text-gray-800">{txn.to}</p>
                </div>
              </div>
            </div>

            {/* Consignment Details */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('del.consDetails')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.productType')}</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.volumeLoaded')}</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('del.vehicle')}</p><p className="font-semibold text-gray-800">{txn.vehicle}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.driver')}</p><p className="font-semibold text-gray-800">{txn.driver}</p></div>
              </div>
            </div>

            {/* Seal & Marker Verification */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('del.sealMarker')}</h4>
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">{t('del.loadingSeal')}</p>
                  <p className="font-semibold text-sm text-gray-800 font-mono">{txn.sealNumberLoading}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('del.markerBatch')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.markerBatchNo}</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.loadingTicket')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.loadingTicket}</span></div>
                </div>
              </div>
            </div>

            {/* Scan Metadata */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('del.scanMeta')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between border-b pb-2"><span className="text-gray-600">{t('del.scannedAt')}</span><span className="font-semibold text-gray-800">{scanTime.toLocaleString()}</span></div>
                <div className="flex items-center justify-between border-b pb-2"><span className="text-gray-600">{t('cons.expectedDelivery')}</span><span className="font-semibold text-gray-800">{txn.expectedDelivery}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">{t('del.receivedBy')}</span><span className="font-semibold text-gray-800">{currentUser?.name}</span></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleConfirmDelivery} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <ClipboardCheck className="w-5 h-5" />{t('cons.confirmDelivery')}
              </button>
              <button onClick={() => setDeliveryRegistration(null)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── TRANSIT LOAD REGISTRATION MODAL (License Plate) ──
  const TransitLoadRegistrationModal = () => {
    const [transitDetailTab, setTransitDetailTab] = useState<'details' | 'transport'>('details');
    if (!transitLoadRegistration) return null;
    const txn = transitLoadRegistration.transaction;
    const lookupTime = new Date(transitLoadRegistration.lookedUpAt);

    if (transitLoadConfirmed) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={handleCloseTransitLoad}>
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-lg text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-3" />
              <h3 className="font-bold text-xl">In Transit</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-500">Transaction ID</p><p className="font-semibold text-gray-800">{txn.id}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><p className="font-semibold text-green-700">In Transit</p></div>
                  <div><p className="text-xs text-gray-500">Volume</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                  <div><p className="text-xs text-gray-500">Product</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                  <div><p className="text-xs text-gray-500">Vehicle</p><p className="font-semibold text-gray-800">{txn.vehicle}</p></div>
                  <div><p className="text-xs text-gray-500">Driver</p><p className="font-semibold text-gray-800">{txn.driver}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Route</p><p className="font-semibold text-gray-800">{txn.from} → {txn.to}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Confirmed At</p><p className="font-semibold text-gray-800">{lookupTime.toLocaleString()}</p></div>
                </div>
              </div>
              <button onClick={handleCloseTransitLoad} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">Done</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={handleCloseTransitLoad}>
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-green-700 to-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{t('cons.detail')}</h3>
                <p className="text-green-100 text-sm">{txn.id}</p>
              </div>
              <button onClick={handleCloseTransitLoad} className="text-white hover:text-green-200"><X className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Match notification */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-sm text-green-800">Vehicle {txn.vehicle} — Consignment Found</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleConfirmTransitLoad} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <ClipboardCheck className="w-5 h-5" />Confirm Departure
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setTransitDetailTab('details')} className={`flex-1 py-2 rounded-md font-semibold transition text-sm ${transitDetailTab === 'details' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>{t('cons.consignment')}</button>
              <button onClick={() => setTransitDetailTab('transport')} className={`flex-1 py-2 rounded-md font-semibold transition text-sm ${transitDetailTab === 'transport' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>{t('cons.transport')}</button>
            </div>

            {transitDetailTab === 'details' && (
              <>
                {/* Transfer Route */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.route')}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">{t('cons.sourceDepot')}</p>
                      <p className="font-semibold text-sm text-gray-800">{txn.from}</p>
                    </div>
                    <div className="text-green-600 font-bold text-lg">&rarr;</div>
                    <div className="flex-1 text-center">
                      <Store className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">{t('cons.destination')}</p>
                      <p className="font-semibold text-sm text-gray-800">{txn.to}</p>
                    </div>
                  </div>
                </div>

                {/* Fuel & Loading Information */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.fuelLoading')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.productType')}</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                    <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.volumeLoaded')}</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.temperature')}</p><p className="font-semibold text-gray-800">{txn.temperature}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.density')}</p><p className="font-semibold text-gray-800">{txn.density}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.loadingBay')}</p><p className="font-semibold text-gray-800">{txn.loadingBay}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.compartments')}</p><p className="font-semibold text-gray-800">{txn.compartment}</p></div>
                  </div>
                </div>

                {/* Fuel Marking Details */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.fuelMarking')}</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.markerType')}</span><span className="font-semibold text-sm text-gray-800">{txn.markerType}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.batchNo')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.markerBatchNo}</span></div>
                  </div>
                </div>
              </>
            )}

            {transitDetailTab === 'transport' && (
              <>
                {/* Transport Details */}
                <div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.vehicle')}</span><span className="font-semibold text-sm text-gray-800">{txn.vehicle}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.driver')}</span><span className="font-semibold text-sm text-gray-800">{txn.driver}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.driverLicense')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.driverLicense}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.transporter')}</span><span className="font-semibold text-sm text-gray-800">{txn.transporter}</span></div>
                  </div>
                </div>

                {/* Seal Numbers */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t('cons.seals')}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg"><p className="text-xs text-gray-500">{t('cons.loadingSeal')}</p><p className="font-semibold text-sm text-gray-800 font-mono">{txn.sealNumberLoading}</p></div>
                  </div>
                </div>

                <div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.loadingDatetime')}</span><span className="font-semibold text-sm text-gray-800">{txn.date} {txn.time}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.expectedDelivery')}</span><span className="font-semibold text-sm text-gray-800">{txn.expectedDelivery}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.loadingTicket')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.loadingTicket}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">{t('cons.gps')}</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.gpsLoading}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">{t('cons.approvedBy')}</span><span className="font-semibold text-sm text-gray-800">{txn.approvedBy}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── SCAN DELIVERY CONFIRM MODAL ──
  const ScanDeliveryConfirmModal = () => {
    if (!scanDeliveryConfirm) return null;
    const txn = scanDeliveryConfirm.transaction;
    const scanTime = new Date(scanDeliveryConfirm.scannedAt);

    const handleConfirm = () => {
      setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: 'completed' } : t));
      setScanDeliveryConfirm(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setScanDeliveryConfirm(null)}>
        <div className="bg-white rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{t('cons.confirmDelivery')}</h3>
                <p className="text-yellow-100 text-sm">{txn.id}</p>
              </div>
              <button onClick={() => setScanDeliveryConfirm(null)} className="text-white hover:text-yellow-200"><X className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <Truck className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-sm text-yellow-800">Consignment In Transit — Confirm Delivery?</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">From</span><span className="font-semibold text-gray-800">{txn.from}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">To</span><span className="font-semibold text-gray-800">{txn.to}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Vehicle</span><span className="font-semibold text-gray-800">{txn.vehicle}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Volume</span><span className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L {txn.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('del.scannedAt')}</span><span className="font-semibold text-gray-800">{scanTime.toLocaleString()}</span></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <ClipboardCheck className="w-5 h-5" />{t('cons.confirmDelivery')}
              </button>
              <button onClick={() => setScanDeliveryConfirm(null)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── SCT ──
  // ── CONSIGNMENT LIST (searchable, full 50-truck roster) ──────────────────
  const ConsignmentList = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const visible = transactions.filter(t => {
      const q = search.toLowerCase();
      const matchQ = !q ||
        t.vehicle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q) ||
        (t as any).truckId?.toLowerCase().includes(q);
      const matchS = statusFilter === 'all' || t.status === statusFilter;
      return matchQ && matchS;
    });
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">Consignments</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">{transactions.length}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('sct.searchPlaceholder')}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 w-44"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-green-500"
            >
              <option value="all">{t('sct.allStatus')}</option>
              <option value="in-transit">{t('sct.inTransit')}</option>
              <option value="completed">{t('sct.completed')}</option>
            </select>
          </div>
        </div>
        {visible.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">{t('sct.noMatch')}</div>
        )}
        {visible.map(txn => (
          <div
            key={txn.id}
            className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => setSelectedTransaction(txn)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-800 text-sm">{txn.id}</span>
                {(txn as any).truckId && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">{(txn as any).truckId}</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${txn.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {txn.status}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${txn.type === 'Diesel' ? 'bg-blue-50 text-blue-700' : txn.type === 'Gasoline' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}`}>
                  {txn.type}
                </span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setSelectedTransaction(txn); }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{txn.from} → {txn.to}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{txn.vehicle}</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{txn.volume.toLocaleString()} L</span>
                <span className="text-gray-400">{txn.driver}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const SCTView = () => (
    <div className="p-4 space-y-4">
      <SCTLoadingDetailModal />
      <DeliveryRegistrationModal />
      <TransitLoadRegistrationModal />
      <ScanDeliveryConfirmModal />
      <h2 className="text-2xl font-bold text-gray-800">{t('sct.title')}</h2>
      {/* Cargo Tracking shortcut */}
      <button
        onClick={() => setCurrentView('tracking')}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl p-4 shadow hover:from-green-800 hover:to-green-700 transition"
      >
        <Navigation className="w-6 h-6 flex-shrink-0" />
        <div className="text-left">
          <div className="font-bold text-sm">{t('sct.cargoTitle')}</div>
          <div className="text-xs text-green-100">{t('sct.cargoSub')}</div>
        </div>
        <span className="ml-auto text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />{t('sct.live')}
        </span>
      </button>

      {/* License Plate Consignment Lookup */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Truck className="w-5 h-5 text-green-600" />{t('sct.loadConsignment')}</h3>
        <p className="text-sm text-gray-500 mb-3">{t('sct.enterPlate')}</p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={licensePlateInput}
              onChange={e => setLicensePlateInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLicensePlateLookup(); }}
              placeholder="e.g. KCA 123A"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
              disabled={licensePlateLoading}
              autoFocus
            />
            <button
              onClick={handleLicensePlateLookup}
              disabled={licensePlateLoading || !licensePlateInput.trim()}
              className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
            >
              <Scan className="w-5 h-5" />
              {t('sct.search')}
            </button>
          </div>
          <button
            onClick={() => startCameraScanner('consignment')}
            disabled={licensePlateLoading}
            className="w-full bg-yellow-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            {t('sct.scanQR')}
          </button>
        </div>
        {licensePlateLoading && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-blue-800">{t('sct.loading')}</span>
          </div>
        )}
        {licensePlateError && (
          <div className="mt-3 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{licensePlateError}</p>
              <button onClick={() => setLicensePlateError(null)} className="mt-1 text-xs text-red-600 hover:text-red-800 underline">{t('sct.dismiss')}</button>
            </div>
          </div>
        )}
      </div>
      {scannerError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 mb-1">{t('sct.scanError')}</p>
              <p className="text-sm text-red-700">{scannerError}</p>
              <button onClick={() => setScannerError(null)} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">{t('sct.dismiss')}</button>
            </div>
          </div>
        </div>
      )}
      {scannedData && !scannerError && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-2">{t('sct.qrSuccess')}</p>
              <div className="bg-white p-3 rounded text-xs overflow-auto mb-3"><pre className="text-gray-700">{scannedData}</pre></div>
              <div className="flex gap-2">
                <button onClick={() => {
                  try {
                    const data = JSON.parse(scannedData);
                    const txnId = data.transactionId || data.txnId || data.id;
                    if (txnId) {
                      setTransactions(prev => prev.map(tx => tx.id === txnId ? { ...tx, status: 'completed' } : tx));
                    }
                  } catch {
                    // Try matching scannedData as a raw transaction ID
                    setTransactions(prev => prev.map(tx => tx.id === scannedData.trim() ? { ...tx, status: 'completed' } : tx));
                  }
                  setScannedData(null);
                }} className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">{t('sct.confirm')}</button>
                <button onClick={() => setScannedData(null)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">{t('sct.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConsignmentList />
    </div>
  );

  // ── INCIDENTS ──
  const IncidentsView = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{t('inc.title')}</h2>
      <div className="bg-white rounded-lg shadow">
        {incidents.map(inc => (
          <div key={inc.id} className="p-4 border-b last:border-b-0">
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-6 h-6 flex-shrink-0 ${inc.severity === 'high' ? 'text-red-600' : inc.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800">{inc.id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${inc.severity === 'high' ? 'bg-red-100 text-red-800' : inc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{inc.severity}</span>
                </div>
                <p className="text-sm text-gray-600">{inc.type}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{inc.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${inc.status === 'open' ? 'bg-red-50 text-red-700' : inc.status === 'investigating' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>{inc.status}</span>
                  {inc.status !== 'resolved' && <button className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">{t('inc.investigate')}</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── CYLINDER LIST MODAL ──
  const CylinderListModal = () => {
    const [listSizeFilter, setListSizeFilter] = useState<number | null>(null);
    const [listSearch, setListSearch] = useState('');
    if (!cylinderListModal) return null;
    const { inv, stationName } = cylinderListModal;
    const shown = inv.cylinders.filter((c: any) => {
      const matchSz = !listSizeFilter || c.sizeKg === listSizeFilter;
      const q = listSearch.toLowerCase();
      const matchQ = !q || c.rfid.toLowerCase().includes(q) || c.serial.toLowerCase().includes(q)
        || c.brand.toLowerCase().includes(q) || c.kebsCertNo.toLowerCase().includes(q);
      return matchSz && matchQ;
    });
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setCylinderListModal(null)}>
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-4 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold text-lg">{t('lpg.cylinders')}</span>
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded text-sm">{inv.totalCylinders} {t('lpg.total')}</span>
                </div>
                <p className="text-orange-100 text-sm mt-0.5">{stationName}</p>
              </div>
              <button onClick={() => setCylinderListModal(null)} className="text-white hover:text-orange-200"><X className="w-6 h-6" /></button>
            </div>
          </div>
          {/* Controls */}
          <div className="p-3 border-b flex-shrink-0 space-y-2">
            <div className="flex gap-2">
              <button onClick={() => setListSizeFilter(null)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${!listSizeFilter ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t('lpg.all')} ({inv.totalCylinders})</button>
              {LPG_SIZES.map(sz => (
                <button key={sz.kg} onClick={() => setListSizeFilter(listSizeFilter === sz.kg ? null : sz.kg)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${listSizeFilter === sz.kg ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {sz.label} ({inv.summary[sz.kg]?.total ?? 0})
                </button>
              ))}
            </div>
            <input type="text" value={listSearch} onChange={e => setListSearch(e.target.value)}
              placeholder={t('lpg.searchPlaceholder')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <p className="text-xs text-gray-500">{shown.length} cylinder{shown.length !== 1 ? 's' : ''}</p>
          </div>
          {/* List */}
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {shown.map((cyl: any) => (
              <div key={cyl.rfid} className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">{cyl.rfid}</span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-semibold">{cyl.sizeLabel}</span>
                    </div>
                    <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">{cyl.serial}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${cyl.status === 'full' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cyl.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {[
                    [t('lpg.brand'),     cyl.brand],
                    [t('lpg.capacity'),  `${cyl.sizeKg} kg`],
                    [t('lpg.lastRefill'), cyl.dateOfLastRefill],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="flex gap-1 min-w-0">
                      <span className="text-gray-400 flex-shrink-0">{lbl}:</span>
                      <span className="font-semibold text-gray-800 truncate">{val}</span>
                    </div>
                  ))}
                  <div className="col-span-2 flex gap-1 min-w-0">
                    <span className="text-gray-400 flex-shrink-0">{t('lpg.kebsCert')}:</span>
                    <span className="font-semibold text-gray-800 font-mono truncate">{cyl.kebsCertNo}</span>
                  </div>
                  {cyl.status === 'full' && (
                    <div className="col-span-2 flex items-start gap-1.5 bg-green-50 rounded-lg p-2 border border-green-100 mt-1">
                      <Shield className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-xs text-green-700 font-semibold block">{t('lpg.refillStamp')}</span>
                        <span className="font-mono text-xs text-green-800 break-all">{cyl.refillStampSerial}</span>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => { setCylinderListModal(null); setCylinderModalTab('events'); setSelectedCylinder(cyl); }}
                  className="mt-2 text-xs text-orange-600 hover:underline font-semibold">
                  {t('lpg.viewDetails')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── STATION TANK LAYOUT MODAL ──
  const StationLayoutModal = () => {
    if (!selectedStationLayout) return null;
    const { station, tankData } = selectedStationLayout;
    const tanks = tankData.tanks;

    const FUEL_COLOR: Record<string, { bg: string; fill: string; stroke: string; text: string; label: string }> = {
      Diesel:   { bg: '#fef3c7', fill: '#b45309', stroke: '#d97706', text: '#78350f', label: 'Diesel'   },
      Gasoline: { bg: '#dbeafe', fill: '#1d4ed8', stroke: '#3b82f6', text: '#1e3a8a', label: 'Gasoline' },
      Kerosene: { bg: '#ede9fe', fill: '#6d28d9', stroke: '#8b5cf6', text: '#4c1d95', label: 'Kerosene' },
    };

    // SVG geometry
    const SVG_W   = 580;
    const GROUND  = 128;
    const CANOPY_Y = 22;  const CANOPY_H = 28;
    const TANK_TOP = GROUND + 28;
    const TANK_H   = 128;
    const SVG_H    = TANK_TOP + TANK_H + 36;
    const PAD      = 16;
    const GAP      = 14;
    const N        = tanks.length;
    const TANK_W   = Math.floor((SVG_W - 2 * PAD - (N - 1) * GAP) / N);
    const tx = (i: number) => PAD + i * (TANK_W + GAP);
    const mx = (i: number) => tx(i) + TANK_W / 2;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStationLayout(null)}>
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 uppercase tracking-wide">{t('tank.title')}</p>
                <h3 className="font-bold text-lg">{station.name}</h3>
                <p className="text-slate-300 text-sm">{station.location} · {station.company}</p>
              </div>
              <button onClick={() => setSelectedStationLayout(null)} className="text-white hover:text-slate-300"><X className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* SVG Cross-Section */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />{t('tank.schematic')}
              </p>
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ display: 'block', height: 260 }}>
                  {/* Above-ground sky */}
                  <rect x="0" y="0" width={SVG_W} height={GROUND} fill="#f0f9ff" />

                  {/* Canopy */}
                  <rect x="24" y={CANOPY_Y} width={SVG_W - 48} height={CANOPY_H} rx="4" fill="#1e293b" />
                  <text x={SVG_W / 2} y={CANOPY_Y + 17} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace">FORECOURT CANOPY</text>

                  {/* Dispensers (2 per tank) */}
                  {tanks.map((_: any, i: number) => {
                    const cx = mx(i);
                    return [
                      <rect key={`da-${i}`} x={cx - 26} y="55" width="22" height="38" rx="3" fill="#334155" />,
                      <rect key={`db-${i}`} x={cx + 4}  y="55" width="22" height="38" rx="3" fill="#334155" />,
                      <rect key={`dga-${i}`} x={cx - 20} y="64" width="10" height="6" rx="1" fill="#fbbf24" />,
                      <rect key={`dgb-${i}`} x={cx + 10} y="64" width="10" height="6" rx="1" fill="#fbbf24" />,
                      <text key={`dla-${i}`} x={cx - 15} y="82" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">DISP</text>,
                      <text key={`dlb-${i}`} x={cx + 15} y="82" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">DISP</text>,
                    ];
                  })}

                  {/* Ground line */}
                  <rect x="0" y={GROUND - 2} width={SVG_W} height="4" fill="#374151" />
                  <text x="6" y={GROUND - 6} fill="#6b7280" fontSize="7" fontFamily="monospace">GROUND LEVEL</text>

                  {/* Underground soil background */}
                  <rect x="0" y={GROUND + 2} width={SVG_W} height={SVG_H - GROUND - 2} fill="#fefce8" />

                  {/* Tanks */}
                  {tanks.map((tank: any, i: number) => {
                    const x  = tx(i);
                    const cx = mx(i);
                    const c  = FUEL_COLOR[tank.fuelType];
                    const fillH  = Math.round(TANK_H * tank.fillPct / 100);
                    const fillY  = TANK_TOP + TANK_H - fillH;
                    const sColor = tank.sensor.status === 'online' ? '#22c55e' : tank.sensor.status === 'warning' ? '#f59e0b' : '#ef4444';

                    return (
                      <g key={tank.id}>
                        {/* Fill pipe from ground */}
                        <line x1={cx} y1={GROUND + 2} x2={cx} y2={TANK_TOP} stroke="#9ca3af" strokeWidth="2" strokeDasharray="4,3" />
                        {/* Manhole cover */}
                        <ellipse cx={cx} cy={GROUND + 2} rx="9" ry="4" fill="#6b7280" />
                        <text x={cx} y={GROUND + 14} textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="monospace">FP-{i + 1}</text>

                        {/* Tank shell */}
                        <rect x={x} y={TANK_TOP} width={TANK_W} height={TANK_H} rx="10" fill={c.bg} stroke={c.stroke} strokeWidth="2" />
                        {/* Liquid fill */}
                        <clipPath id={`clip-${tank.id}`}>
                          <rect x={x} y={TANK_TOP} width={TANK_W} height={TANK_H} rx="10" />
                        </clipPath>
                        <rect x={x} y={fillY} width={TANK_W} height={fillH} fill={c.fill} fillOpacity="0.65" clipPath={`url(#clip-${tank.id})`} />
                        {/* Liquid surface line */}
                        {fillH > 6 && <line x1={x + 2} y1={fillY} x2={x + TANK_W - 2} y2={fillY} stroke={c.stroke} strokeWidth="1" strokeDasharray="3,2" />}
                        {/* Fill% */}
                        <text x={cx} y={fillY - 5} textAnchor="middle" fill={c.text} fontSize="9" fontWeight="bold">{tank.fillPct}%</text>
                        {/* Fuel type */}
                        <text x={cx} y={TANK_TOP + 16} textAnchor="middle" fill={c.text} fontSize="9" fontWeight="bold" fontFamily="monospace">{tank.fuelType.toUpperCase()}</text>
                        {/* Tank ID */}
                        <text x={cx} y={TANK_TOP + 27} textAnchor="middle" fill="#9ca3af" fontSize="7" fontFamily="monospace">{tank.id}</text>
                        {/* Volumes */}
                        <text x={cx} y={TANK_TOP + TANK_H - 20} textAnchor="middle" fill={c.text} fontSize="8" fontWeight="bold">{tank.current.toLocaleString()} L</text>
                        <text x={cx} y={TANK_TOP + TANK_H - 9}  textAnchor="middle" fill="#9ca3af" fontSize="7">cap: {tank.capacity.toLocaleString()} L</text>
                        {/* Sensor dot */}
                        <circle cx={x + TANK_W - 10} cy={TANK_TOP + 10} r="5" fill={sColor} />
                        <circle cx={x + TANK_W - 10} cy={TANK_TOP + 10} r="8" fill={sColor} fillOpacity="0.2" />
                        {/* Sensor wire */}
                        <line x1={x + TANK_W - 10} y1={TANK_TOP + 18} x2={x + TANK_W - 10} y2={TANK_TOP + TANK_H} stroke={sColor} strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.5" />
                      </g>
                    );
                  })}

                  {/* Legend */}
                  {[[`#22c55e`, t('wsm.online')],[`#f59e0b`, t('wsm.warning')],[`#ef4444`, t('wsm.offline')]].map(([col,lbl], li) => (
                    <g key={lbl}>
                      <circle cx={8 + li * 62} cy={SVG_H - 10} r="5" fill={col} />
                      <text x={16 + li * 62} y={SVG_H - 6} fill="#6b7280" fontSize="8" fontFamily="monospace">{lbl}</text>
                    </g>
                  ))}
                  <text x={SVG_W - 6} y={SVG_H - 6} textAnchor="end" fill="#9ca3af" fontSize="7" fontFamily="monospace">● ATG PROBE</text>
                </svg>
              </div>
            </div>

            {/* Sensor status cards */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />Tank Gauging Sensors
              </p>
              <div className="space-y-3">
                {tanks.map((tank: any) => {
                  const s  = tank.sensor;
                  const c  = FUEL_COLOR[tank.fuelType];
                  const st = s.status;
                  const statusCls = st === 'online'  ? 'bg-green-100 text-green-800 border-green-200'
                                  : st === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : 'bg-red-100 text-red-800 border-red-200';
                  const dotCls   = st === 'online'  ? 'bg-green-500' : st === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
                  return (
                    <div key={tank.id} className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotCls}`} />
                          <span className="font-bold text-sm" style={{ color: c.text }}>{tank.fuelType}</span>
                          <span className="text-xs text-gray-400 font-mono">{tank.id}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusCls}`}>{st.toUpperCase()}</span>
                      </div>
                      {/* Sensor readings row */}
                      <div className="flex gap-2 mb-3 text-xs">
                        {[
                          { label: 'Level', value: `${tank.heightMm} / ${tank.maxHeightMm} mm` },
                          { label: 'Temp',  value: `${tank.tempC} °C` },
                          { label: 'Water', value: `${tank.waterBottomMm} mm` },
                          { label: 'Signal',value: `${s.signalStrength}%` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex-1 bg-white rounded-lg p-2 text-center border border-gray-100">
                            <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                            <p className="font-bold text-gray-800">{value}</p>
                          </div>
                        ))}
                      </div>
                      {/* Sensor metadata */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-white rounded-lg p-2 border border-gray-100">
                        {[
                          ['Sensor ID',     s.id],
                          ['Model',         s.model],
                          ['Manufacturer',  s.manufacturer],
                          ['Probe Serial',  s.probeSerial],
                          ['Firmware',      s.firmware],
                          ['Network Addr',  s.networkAddr],
                          ['Last Sync',     s.lastSyncFull],
                          ['Sync Delay',    s.lastSyncStr],
                        ].map(([lbl, val]) => (
                          <div key={lbl} className="flex gap-1">
                            <span className="text-gray-400 flex-shrink-0">{lbl}:</span>
                            <span className="font-semibold text-gray-800 font-mono truncate">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── LPG CYLINDER MODAL ──
  const LpgCylinderModal = () => {
    if (!selectedCylinder) return null;
    const cyl = selectedCylinder;
    const stampStyle: Record<string, string> = {
      fill:     'bg-orange-100 text-orange-800',
      dispatch: 'bg-blue-100 text-blue-800',
      receive:  'bg-green-100 text-green-800',
      inspect:  'bg-purple-100 text-purple-800',
      consumer: 'bg-teal-100 text-teal-800',
    };
    const stampLabel: Record<string, string> = {
      fill:     'Brand Owner Filling Plant',
      dispatch: 'Local Distributor Delivery',
      receive:  'Gas Station Receipt',
      inspect:  'EPRA Inspection',
      consumer: 'Consumer Verification',
    };
    const recentEvents     = cyl.stampChain.filter((ev: any) => ['fill', 'dispatch', 'receive'].includes(ev.type));
    const inspectionEvents = cyl.stampChain.filter((ev: any) => ['inspect', 'consumer'].includes(ev.type));
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCylinder(null)}>
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold text-lg">{t('lpg.cylinder')}</span>
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded text-sm font-mono">{cyl.sizeLabel}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3 text-orange-200" />
                  <span className="text-orange-100 text-xs font-mono">{cyl.rfid}</span>
                </div>
              </div>
              <button onClick={() => setSelectedCylinder(null)} className="text-white hover:text-orange-200"><X className="w-6 h-6" /></button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-bold">{cyl.brand}</span>
              <span className="text-orange-200 text-xs">·</span>
              <span className="text-xs text-orange-100 font-mono">{cyl.serial}</span>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* Status row – no seal integrity sub-status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${cyl.status === 'full' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                {cyl.status.toUpperCase()}
              </span>
            </div>

            {/* KEBS / EPRA Registration */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{t('lpg.kebsReg')}</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                {([
                  [t('lpg.brandOwner'),              cyl.brand],
                  [t('lpg.serialNo'),      cyl.serial],
                  [t('lpg.sizeKg'),             `${cyl.sizeKg} kg`],
                  [t('lpg.tareWeight'),          `${cyl.tareWeight} kg`],
                  [t('lpg.maxGross'),          `${cyl.maxGrossWeight} kg`],
                  [t('lpg.waterCap'),       `${cyl.waterCapacity} L`],
                  [t('lpg.workingPressure'),          `${cyl.workingPressure} bar`],
                  [t('lpg.testPressure'),             `${cyl.testPressure} bar`],
                  [t('lpg.gasType'),                  'LPG (Butane / Propane Mix)'],
                  [t('lpg.country'),    cyl.countryOfManufacture],
                  [t('lpg.mfgDate'),       cyl.manufactureDate],
                  [t('lpg.nextReqal'),      cyl.nextTestDate],
                  [t('lpg.lastRefillDate'),    cyl.dateOfLastRefill],
                  [t('lpg.kebsCertNo'), cyl.kebsCertNo],
                ] as [string, string][]).map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">{lbl}</span>
                    <span className="font-semibold text-gray-800 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refill stamp serial – only for full cylinders */}
            {cyl.status === 'full' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1 flex items-center gap-1"><Shield className="w-3.5 h-3.5" />{t('lpg.secureStamp')}</p>
                <p className="font-mono text-sm text-green-800 break-all">{cyl.refillStampSerial}</p>
              </div>
            )}

            {/* RFID Tag & Valve */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{t('lpg.rfidTag')}</p>
              <div className="bg-blue-50 rounded-lg p-3 space-y-1.5 text-sm">
                {([
                  [t('lpg.rfidId'),      cyl.rfid],
                  [t('lpg.valveType'),       cyl.valveType],
                  [t('lpg.valveSerial'), cyl.valveSerial],
                  [t('lpg.fillingPlant'),    cyl.fillingPlant],
                  [t('lpg.activeSeal'), cyl.currentSealCode],
                ] as [string, string][]).map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">{lbl}</span>
                    <span className="font-semibold text-gray-800 text-right font-mono text-xs break-all">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply Chain Events – tabbed */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1"><Shield className="w-3.5 h-3.5" />{t('lpg.supplyChain')}</p>
              {/* Tab bar */}
              <div className="flex border-b border-gray-200 mb-3">
                <button
                  onClick={() => setCylinderModalTab('events')}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition ${cylinderModalTab === 'events' ? 'border-orange-500 text-orange-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {t('lpg.recentEvents')}
                </button>
                <button
                  onClick={() => setCylinderModalTab('inspections')}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition ${cylinderModalTab === 'inspections' ? 'border-purple-500 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {t('lpg.inspections')} {inspectionEvents.length > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${cylinderModalTab === 'inspections' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{inspectionEvents.length}</span>}
                </button>
              </div>
              {/* Recent Events tab */}
              {cylinderModalTab === 'events' && (
                <div className="space-y-0">
                  {recentEvents.map((ev: any, idx: number) => (
                    <div key={ev.seq} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-xs font-bold text-orange-600">{idx + 1}</div>
                        {idx < recentEvents.length - 1 && <div className="w-0.5 flex-1 bg-orange-100 my-1" style={{ minHeight: '1.5rem' }} />}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stampStyle[ev.type] || 'bg-gray-100 text-gray-600'}`}>{stampLabel[ev.type] || ev.type}</span>
                        <p className="text-xs font-semibold text-gray-700 mt-1">{ev.location}</p>
                        <p className="text-xs text-gray-500">{ev.date} at {ev.time} · {ev.operatorId}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{ev.details}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5 break-all">{ev.stampCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Inspections tab */}
              {cylinderModalTab === 'inspections' && (
                <div>
                  {inspectionEvents.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-xs">{t('lpg.noInspection')}</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {inspectionEvents.map((ev: any, idx: number) => (
                        <div key={ev.seq} className="flex gap-3">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${ev.type === 'consumer' ? 'bg-teal-50 border border-teal-200 text-teal-600' : 'bg-purple-50 border border-purple-200 text-purple-600'}`}>{idx + 1}</div>
                            {idx < inspectionEvents.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: '1.5rem' }} />}
                          </div>
                          <div className="pb-4 flex-1 min-w-0">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stampStyle[ev.type] || 'bg-gray-100 text-gray-600'}`}>{stampLabel[ev.type] || ev.type}</span>
                            <p className="text-xs font-semibold text-gray-700 mt-1">{ev.location}</p>
                            <p className="text-xs text-gray-500">{ev.date} at {ev.time} · {ev.operatorId}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{ev.details}</p>
                            <p className="text-xs font-mono text-gray-400 mt-0.5 break-all">{ev.stampCode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── DIRECTORY ──
  const DirectoryView = () => {
    const [viewType, setViewType] = useState('depots');

    const generateInspectionPDF = () => {
      if (!selectedLocation?.inspection) return;
      const loc = selectedLocation;
      const insp = loc.inspection;
      const testId = `${loc.id}-${insp.lastDate.replace(/\//g, '')}`;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header bar
      doc.setFillColor(22, 101, 52);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('EPRA - Fuel Integrity Management System', pageWidth / 2, 14, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Fixed Location Test Report', pageWidth / 2, 22, { align: 'center' });

      // Test ID
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Test ID: ${testId}`, 14, 40);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 40, { align: 'right' });

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 44, pageWidth - 14, 44);

      // Station Information Section
      let y = 52;
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Station Information', 14, y);
      y += 8;

      const addRow = (label: string, value: string, yPos: number) => {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(label, 14, yPos);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 80, yPos);
        return yPos + 7;
      };

      y = addRow('Station Name:', loc.name, y);
      y = addRow('Station ID:', loc.id, y);
      y = addRow('Operator:', loc.company, y);
      y = addRow('Location:', loc.location, y);
      y = addRow('Coordinates:', loc.coordinates, y);

      // Divider
      y += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;

      // Inspection Details Section
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Inspection Details', 14, y);
      y += 8;

      y = addRow('Inspection Date:', insp.lastDate, y);
      y = addRow('Inspector:', 'EPRA Field Inspector', y);
      y = addRow('Inspection Type:', 'Fixed Location Test', y);

      // Divider
      y += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;

      // Test Results Section
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Results', 14, y);
      y += 8;

      // Results table header
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Parameter', 16, y);
      doc.text('Standard', 90, y);
      doc.text('Measured', 130, y);
      doc.text('Status', 170, y);
      y += 8;

      const tests = [
        { param: 'Fuel Marker Presence', standard: 'Detected', measured: insp.result === 'PASS' ? 'Detected' : 'Not Detected', pass: insp.result === 'PASS' },
        { param: 'Density (kg/m\u00b3)', standard: '820-860', measured: insp.result === 'PASS' ? '835.6' : '812.3', pass: insp.result === 'PASS' },
        { param: 'Water Content (%)', standard: '< 0.05', measured: insp.result === 'PASS' ? '0.02' : '0.08', pass: insp.result === 'PASS' },
        { param: 'Sulphur Content (ppm)', standard: '< 50', measured: insp.result === 'PASS' ? '32' : '67', pass: insp.result === 'PASS' },
        { param: 'Visual Clarity', standard: 'Clear', measured: insp.result === 'PASS' ? 'Clear' : 'Hazy', pass: insp.result === 'PASS' },
      ];

      doc.setFont('helvetica', 'normal');
      tests.forEach(test => {
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.text(test.param, 16, y);
        doc.text(test.standard, 90, y);
        doc.text(test.measured, 130, y);
        doc.setTextColor(test.pass ? 22 : 200, test.pass ? 101 : 30, test.pass ? 52 : 30);
        doc.setFont('helvetica', 'bold');
        doc.text(test.pass ? 'PASS' : 'FAIL', 170, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
      });

      // Overall Result
      y += 5;
      const resultColor = insp.result === 'PASS' ? [22, 101, 52] : [200, 30, 30];
      doc.setFillColor(resultColor[0], resultColor[1], resultColor[2]);
      doc.roundedRect(14, y - 4, pageWidth - 28, 16, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`OVERALL RESULT: ${insp.result}`, pageWidth / 2, y + 6, { align: 'center' });
      y += 20;

      // Compliance note
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const compNote = insp.result === 'PASS'
        ? 'All fuel quality parameters meet EPRA regulatory standards. Station is compliant.'
        : 'Non-compliance detected. Corrective action required within 14 days. Re-inspection will be scheduled.';
      doc.text(compNote, 14, y);

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('Energy & Petroleum Regulatory Authority (EPRA) - Kenya', 14, footerY);
      doc.text('Confidential Document', pageWidth - 14, footerY, { align: 'right' });

      doc.save(`Inspection_Report_${testId}.pdf`);
    };

    const handlePrintReport = () => {
      if (!selectedLocation?.inspection) return;
      const loc = selectedLocation;
      const insp = loc.inspection;
      const testId = `${loc.id}-${insp.lastDate.replace(/\//g, '')}`;
      const resultColor = insp.result === 'PASS' ? '#166534' : '#dc2626';
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html><head><title>Inspection Report - ${testId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { background: #166534; color: white; padding: 20px; text-align: center; margin: -40px -40px 20px; }
          .header h1 { font-size: 18px; margin: 0; }
          .header p { font-size: 12px; margin: 4px 0 0; opacity: 0.9; }
          .section { margin: 16px 0; }
          .section h2 { color: #166534; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .row { display: flex; padding: 4px 0; font-size: 12px; }
          .row .label { width: 140px; color: #666; }
          .row .value { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; }
          th { background: #f0f0f0; padding: 6px 8px; text-align: left; border: 1px solid #ddd; }
          td { padding: 6px 8px; border: 1px solid #ddd; }
          .result-banner { background: ${resultColor}; color: white; text-align: center; padding: 12px; font-size: 16px; font-weight: bold; border-radius: 4px; margin: 16px 0; }
          @media print { body { margin: 20px; } .header { margin: -20px -20px 20px; } }
        </style></head><body>
        <div class="header"><h1>EPRA - Fuel Integrity Management System</h1><p>Fixed Location Test Report</p></div>
        <p style="font-size:11px;color:#666;">Test ID: ${testId} | Generated: ${new Date().toLocaleDateString()}</p>
        <div class="section"><h2>Station Information</h2>
          <div class="row"><span class="label">Station Name:</span><span class="value">${loc.name}</span></div>
          <div class="row"><span class="label">Station ID:</span><span class="value">${loc.id}</span></div>
          <div class="row"><span class="label">Operator:</span><span class="value">${loc.company}</span></div>
          <div class="row"><span class="label">Location:</span><span class="value">${loc.location}</span></div>
        </div>
        <div class="section"><h2>Inspection Details</h2>
          <div class="row"><span class="label">Inspection Date:</span><span class="value">${insp.lastDate}</span></div>
          <div class="row"><span class="label">Inspection Type:</span><span class="value">Fixed Location Test</span></div>
        </div>
        <div class="section"><h2>Test Results</h2>
        <table><tr><th>Test Parameter</th><th>Standard</th><th>Measured</th><th>Status</th></tr>
        <tr><td>Fuel Marker Presence</td><td>Detected</td><td>${insp.result === 'PASS' ? 'Detected' : 'Not Detected'}</td><td style="color:${resultColor};font-weight:bold">${insp.result}</td></tr>
        <tr><td>Density (kg/m\u00b3)</td><td>820-860</td><td>${insp.result === 'PASS' ? '835.6' : '812.3'}</td><td style="color:${resultColor};font-weight:bold">${insp.result}</td></tr>
        <tr><td>Water Content (%)</td><td>&lt; 0.05</td><td>${insp.result === 'PASS' ? '0.02' : '0.08'}</td><td style="color:${resultColor};font-weight:bold">${insp.result}</td></tr>
        <tr><td>Sulphur Content (ppm)</td><td>&lt; 50</td><td>${insp.result === 'PASS' ? '32' : '67'}</td><td style="color:${resultColor};font-weight:bold">${insp.result}</td></tr>
        <tr><td>Visual Clarity</td><td>Clear</td><td>${insp.result === 'PASS' ? 'Clear' : 'Hazy'}</td><td style="color:${resultColor};font-weight:bold">${insp.result}</td></tr>
        </table></div>
        <div class="result-banner">OVERALL RESULT: ${insp.result}</div>
        <p style="font-size:10px;color:#666;margin-top:20px;">${insp.result === 'PASS' ? 'All fuel quality parameters meet EPRA regulatory standards.' : 'Non-compliance detected. Corrective action required within 14 days.'}</p>
        <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;">
        <p style="font-size:9px;color:#999;">Energy & Petroleum Regulatory Authority (EPRA) - Kenya | Confidential Document</p>
        </body></html>`);
      printWindow.document.close();
      printWindow.print();
    };

    const InspectionReportModal = () => {
      if (!showInspectionReport || !selectedLocation?.inspection) return null;
      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setShowInspectionReport(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">{t('insp.title')}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintReport} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition" title="Print Report"><Printer className="w-4 h-4" />{t('insp.print')}</button>
                <button onClick={generateInspectionPDF} className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition" title="Download PDF"><Download className="w-4 h-4" />{t('insp.download')}</button>
                <button onClick={() => setShowInspectionReport(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-white p-6 rounded border text-left space-y-3">
                <div className="border-b pb-3">
                  <h4 className="font-bold text-lg mb-2">{t('insp.title')}</h4>
                  <p className="text-sm text-gray-600">Test ID: {selectedLocation.id}-{selectedLocation.inspection.lastDate.replace(/\//g, '')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-600">{t('insp.stationName')}</p><p className="font-semibold">{selectedLocation.name}</p></div>
                  <div><p className="text-xs text-gray-600">{t('insp.operator')}</p><p className="font-semibold">{selectedLocation.company}</p></div>
                  <div><p className="text-xs text-gray-600">{t('insp.inspDate')}</p><p className="font-semibold">{selectedLocation.inspection.lastDate}</p></div>
                  <div><p className="text-xs text-gray-600">{t('wsm.result')}</p><p className={`font-bold ${selectedLocation.inspection.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{selectedLocation.inspection.result}</p></div>
                </div>
                {/* Detailed Test Results Table */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('insp.testResults')}</h4>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">{t('insp.parameter')}</th>
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">{t('insp.standard')}</th>
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">{t('insp.measured')}</th>
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">{t('insp.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { param: 'Fuel Marker Presence', standard: 'Detected', measured: selectedLocation.inspection.result === 'PASS' ? 'Detected' : 'Not Detected' },
                        { param: 'Density (kg/m\u00b3)', standard: '820-860', measured: selectedLocation.inspection.result === 'PASS' ? '835.6' : '812.3' },
                        { param: 'Water Content (%)', standard: '< 0.05', measured: selectedLocation.inspection.result === 'PASS' ? '0.02' : '0.08' },
                        { param: 'Sulphur Content (ppm)', standard: '< 50', measured: selectedLocation.inspection.result === 'PASS' ? '32' : '67' },
                        { param: 'Visual Clarity', standard: 'Clear', measured: selectedLocation.inspection.result === 'PASS' ? 'Clear' : 'Hazy' },
                      ].map(test => (
                        <tr key={test.param}>
                          <td className="p-2 border border-gray-200">{test.param}</td>
                          <td className="p-2 border border-gray-200">{test.standard}</td>
                          <td className="p-2 border border-gray-200">{test.measured}</td>
                          <td className={`p-2 border border-gray-200 font-bold ${selectedLocation.inspection.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{selectedLocation.inspection.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={`${selectedLocation.inspection.result === 'PASS' ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'} border-l-4 p-4 mt-4`}>
                  <p className={`font-semibold ${selectedLocation.inspection.result === 'PASS' ? 'text-green-800' : 'text-red-800'}`}>{t('insp.compliance')} {selectedLocation.inspection.result}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedLocation.inspection.result === 'PASS' ? t('insp.passMsg') : t('insp.failMsg')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="p-4 space-y-4">
        <InspectionReportModal />
        {selectedLocation ? (
          <div className="space-y-4">
            <button onClick={() => setSelectedLocation(null)} className="flex items-center gap-2 text-blue-600 font-semibold"><X className="w-5 h-5" />{currentView === 'wsm' ? t('wsm.backToWSM') : t('wsm.backToDir')}</button>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex items-start gap-3 mb-4">
                  {selectedLocation.id.startsWith('DEP') ? <Building2 className="w-8 h-8" /> : <Store className="w-8 h-8" />}
                  <div className="flex-1"><h2 className="text-2xl font-bold">{selectedLocation.name}</h2><p className="text-blue-100 text-sm mt-1">{selectedLocation.company}</p></div>
                </div>
                <div className="flex items-center gap-2 text-blue-100 text-sm"><MapPin className="w-4 h-4" /><span>{selectedLocation.location}</span></div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">{t('wsm.currentStock')}</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedLocation.current.toLocaleString()} L</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">{t('wsm.capacity')}</p>
                      <p className="text-2xl font-bold text-green-600">{selectedLocation.capacity.toLocaleString()} L</p>
                    </div>
                  </div>
                  {/* Fuel type breakdown */}
                  {(() => {
                    if (!selectedLocation.id.startsWith('DEP')) {
                      const td = stationTanks.find(t => t.stationId === selectedLocation.id);
                      if (!td) return null;
                      return (
                        <div className="flex gap-2 flex-wrap px-1">
                          {td.tanks.map((tk: any) => (
                            <span key={tk.id} className="text-xs bg-blue-100 px-2 py-0.5 rounded-full text-blue-800">
                              <span className="text-blue-500">{tk.fuelType}:</span> <span className="font-semibold">{tk.current.toLocaleString()} L</span>
                            </span>
                          ))}
                        </div>
                      );
                    }
                    const sd = stockData.find(s => s.location === selectedLocation.name);
                    return sd ? (
                      <div className="flex gap-2 flex-wrap px-1">
                        <span className="text-xs bg-yellow-100 px-2 py-0.5 rounded-full text-yellow-800"><span className="text-yellow-600">Diesel:</span> <span className="font-semibold">{sd.diesel.toLocaleString()} L</span></span>
                        <span className="text-xs bg-orange-100 px-2 py-0.5 rounded-full text-orange-800"><span className="text-orange-600">Gasoline:</span> <span className="font-semibold">{sd.gasoline.toLocaleString()} L</span></span>
                        <span className="text-xs bg-cyan-100 px-2 py-0.5 rounded-full text-cyan-800"><span className="text-cyan-600">Kerosene:</span> <span className="font-semibold">{sd.kerosene.toLocaleString()} L</span></span>
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${(selectedLocation.current / selectedLocation.capacity) * 100}%` }} /></div>
                {/* Tank Layout button – stations only */}
                {!selectedLocation.id.startsWith('DEP') && (() => {
                  const td = stationTanks.find(t => t.stationId === selectedLocation.id);
                  if (!td) return null;
                  const anyWarn = td.tanks.some((tk: any) => tk.sensor.status !== 'online');
                  return (
                    <button
                      onClick={() => setSelectedStationLayout({ station: selectedLocation, tankData: td })}
                      className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl p-3.5 transition"
                    >
                      <Activity className="w-5 h-5 flex-shrink-0 text-slate-300" />
                      <div className="text-left flex-1">
                        <p className="font-bold text-sm">{t('wsm.tankLayout')}</p>
                        <p className="text-xs text-slate-400">{`${td.tanks.length} ${t('wsm.undergroundTanks')}`}</p>
                      </div>
                      {anyWarn && <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-semibold flex-shrink-0">{t('wsm.alert')}</span>}
                      <span className="text-slate-400 text-sm">›</span>
                    </button>
                  );
                })()}
                {/* ── LPG CYLINDERS SECTION ── */}
                {!selectedLocation.id.startsWith('DEP') && (() => {
                  const inv = lpgInventories.find(i => i.stationId === selectedLocation.id);
                  if (!inv) return null;
                  return (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><Flame className="w-5 h-5 text-orange-500" />{t('wsm.lpgStock')}</h3>
                      {/* Summary by size */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {LPG_SIZES.map(sz => {
                          const s = inv.summary[sz.kg];
                          return (
                            <div key={sz.kg} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-gray-800 text-sm">{sz.label}</span>
                                <span className="text-lg font-black text-orange-600">{s.total}</span>
                              </div>
                              <div className="flex gap-2 text-xs mb-1.5">
                                <span className="text-green-700 font-semibold">{s.full} {t('wsm.full')}</span>
                                <span className="text-gray-400">·</span>
                                <span className="text-gray-500">{s.empty} {t('wsm.empty')}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${s.total > 0 ? (s.full / s.total) * 100 : 0}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCylinderListModal({ inv, stationName: selectedLocation.name })}
                        className="w-full flex items-center justify-between bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl px-4 py-3 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-orange-500" />
                          <span className="font-semibold text-orange-800 text-sm">{t('wsm.viewAllCylinders', { n: inv.totalCylinders })}</span>
                        </div>
                        <span className="text-orange-500 text-lg">›</span>
                      </button>
                    </div>
                  );
                })()}
                {!selectedLocation.id.startsWith('DEP') && selectedLocation.inspection && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-green-600" />{t('wsm.inspection')}</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded"><p className="text-xs text-gray-600">{t('wsm.lastInspDate')}</p><p className="font-semibold text-gray-800">{selectedLocation.inspection.lastDate}</p></div>
                        <div className={`p-3 rounded border-l-4 ${selectedLocation.inspection.result === 'PASS' ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'}`}><p className="text-xs text-gray-600 mb-1">{t('wsm.result')}</p><p className={`font-bold text-lg ${selectedLocation.inspection.result === 'PASS' ? 'text-green-700' : 'text-red-700'}`}>{selectedLocation.inspection.result}</p></div>
                      </div>
                      <button onClick={() => setShowInspectionReport(true)} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"><FileText className="w-5 h-5" />{t('wsm.viewInspResults')}</button>
                      <a href={selectedLocation.inspection.footage} target="_blank" rel="noopener noreferrer" className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 block text-center">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        {t('wsm.watchFootage')}
                      </a>
                    </div>
                  </div>
                )}
                {!selectedLocation.id.startsWith('DEP') && !selectedLocation.inspection && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" />{t('wsm.inspection')}</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-gray-500 text-sm">{t('wsm.noInspection')}</p></div>
                  </div>
                )}
                {/* ── CONTACT INFORMATION ── */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5 text-green-600" />{t('wsm.contactInfo')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3"><Users className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">{t('wsm.contactPerson')}</p><p className="font-semibold text-gray-800">{selectedLocation.contact}</p></div></div>
                    <div className="flex items-start gap-3"><span className="w-5 h-5 text-gray-400 mt-1 text-center">📱</span><div><p className="text-sm text-gray-600">{t('wsm.phone')}</p><a href={`tel:${selectedLocation.phone}`} className="font-semibold text-blue-600">{selectedLocation.phone}</a></div></div>
                    <div className="flex items-start gap-3"><span className="w-5 h-5 text-gray-400 mt-1 text-center">✉️</span><div><p className="text-sm text-gray-600">{t('wsm.email')}</p><a href={`mailto:${selectedLocation.email}`} className="font-semibold text-blue-600 text-sm break-all">{selectedLocation.email}</a></div></div>
                    {selectedLocation.website && <div className="flex items-start gap-3"><span className="w-5 h-5 text-gray-400 mt-1 text-center">🌐</span><div><p className="text-sm text-gray-600">{t('wsm.website')}</p><p className="font-semibold text-blue-600">{selectedLocation.website}</p></div></div>}
                    <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">{t('wsm.coordinates')}</p><p className="font-semibold text-gray-800 font-mono text-sm">{selectedLocation.coordinates}</p></div></div>
                  </div>
                </div>
                {/* ── LOCATION MAP ── */}
                {selectedLocation.coordinates && (() => {
                  const [lat, lng] = selectedLocation.coordinates.split(',').map((c: string) => c.trim());
                  return (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3"><MapPin className="w-5 h-5 text-green-600" />{t('wsm.locationMap')}</h3>
                      <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: 300 }}>
                        <iframe
                          title={`Map of ${selectedLocation.name}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng)-0.01},${Number(lat)-0.01},${Number(lng)+0.01},${Number(lat)+0.01}&layer=mapnik&marker=${lat},${lng}`}
                        />
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        {t('wsm.viewLargerMap')}
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800">{currentView === 'wsm' ? t('wsm.title') : t('dir.title')}</h2>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewType('depots')} className={`flex-1 py-2 rounded-md font-semibold transition ${viewType === 'depots' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>{`${t('wsm.depots')} (${depots.length})`}</button>
              <button onClick={() => setViewType('stations')} className={`flex-1 py-2 rounded-md font-semibold transition ${viewType === 'stations' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>{`${t('wsm.stations')} (${gasStations.length})`}</button>
            </div>
            <div className="space-y-3">
              {viewType === 'depots' ? depots.map(d => (
                <div key={d.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer" onClick={() => setSelectedLocation(d)}>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{d.name}</h3>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedLocation(d); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition flex-shrink-0" title="View Details"><Eye className="w-5 h-5" /></button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{d.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><MapPin className="w-3 h-3" /><span>{d.location}</span></div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">{t('wsm.stock')} </span><span className="font-semibold">{d.current.toLocaleString()} L</span></div>
                        <div><span className="text-gray-600">{t('wsm.capacity')}: </span><span className="font-semibold">{d.capacity.toLocaleString()} L</span></div>
                      </div>
                      {(() => { const sd = stockData.find(s => s.location === d.name); return sd ? (
                        <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                          <div className="bg-yellow-50 rounded px-2 py-1 text-center"><span className="text-gray-500 block">Diesel</span><span className="font-semibold text-gray-800">{sd.diesel.toLocaleString()} L</span></div>
                          <div className="bg-orange-50 rounded px-2 py-1 text-center"><span className="text-gray-500 block">Gasoline</span><span className="font-semibold text-gray-800">{sd.gasoline.toLocaleString()} L</span></div>
                          <div className="bg-purple-50 rounded px-2 py-1 text-center"><span className="text-gray-500 block">Kerosene</span><span className="font-semibold text-gray-800">{sd.kerosene.toLocaleString()} L</span></div>
                        </div>
                      ) : null; })()}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(d.current / d.capacity) * 100}%` }} /></div>
                    </div>
                  </div>
                </div>
              )) : gasStations.map(s => (
                <div key={s.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer" onClick={() => setSelectedLocation(s)}>
                  <div className="flex items-start gap-3">
                    <Store className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{s.name}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {s.inspection ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.inspection.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{s.inspection.result}</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">No Inspection</span>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setSelectedLocation(s); }} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition" title="View Details"><Eye className="w-5 h-5" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{s.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><MapPin className="w-3 h-3" /><span>{s.location}</span></div>
                      {s.inspection && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><FileText className="w-3 h-3" /><span>{t('wsm.lastInsp')} {s.inspection.lastDate}</span><span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${s.inspection.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.inspection.result}</span></div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">{t('wsm.stock')} </span><span className="font-semibold">{s.current.toLocaleString()} L</span></div>
                        <div><span className="text-gray-600">{t('wsm.capacity')}: </span><span className="font-semibold">{s.capacity.toLocaleString()} L</span></div>
                      </div>
                      {(() => {
                        const td = stationTanks.find(t => t.stationId === s.id);
                        if (!td) return null;
                        const fuelBg: Record<string, string> = { Diesel: 'bg-yellow-50', Gasoline: 'bg-blue-50', Kerosene: 'bg-purple-50' };
                        const hasOffline = td.tanks.some((tk: any) => tk.sensor.status === 'offline');
                        const hasWarn    = !hasOffline && td.tanks.some((tk: any) => tk.sensor.status === 'warning');
                        return (
                          <div>
                            <div className={`grid gap-1 mt-2 text-xs`} style={{ gridTemplateColumns: `repeat(${td.tanks.length}, 1fr)` }}>
                              {td.tanks.map((tk: any) => (
                                <div key={tk.id} className={`${fuelBg[tk.fuelType] || 'bg-gray-50'} rounded px-1 py-1 text-center`}>
                                  <span className="text-gray-500 block truncate">{tk.fuelType}</span>
                                  <span className="font-semibold text-gray-800">{tk.current.toLocaleString()} L</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${hasOffline ? 'bg-red-100 text-red-700' : hasWarn ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {t('wsm.atg')} {hasOffline ? `⚠ ${t('wsm.offline')}` : hasWarn ? `⚠ ${t('wsm.warning')}` : `✓ ${t('wsm.online')}`}
                              </span>
                              <span className="text-xs text-gray-400">{td.tanks.length} {t('wsm.tanks')}</span>
                            </div>
                          </div>
                        );
                      })()}
                      {(() => { const inv = lpgInventories.find(i => i.stationId === s.id); return inv ? (
                        <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 bg-orange-50 rounded border border-orange-100">
                          <Flame className="w-3 h-3 text-orange-500 flex-shrink-0" />
                          <span className="text-xs text-orange-700 font-semibold">LPG: {inv.totalCylinders} cylinders</span>
                          <span className="text-gray-300 text-xs">·</span>
                          {LPG_SIZES.map(sz => (
                            <span key={sz.kg} className="text-xs text-gray-500">{sz.label}: <span className="font-semibold text-gray-700">{inv.summary[sz.kg]?.total ?? 0}</span></span>
                          ))}
                        </div>
                      ) : null; })()}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(s.current / s.capacity) * 100}%` }} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ── FUEL TRADING & LOGISTICS PLATFORM ──
  const TradingView = () => {
    const [activeTab, setActiveTab] = useState<'overview'|'participants'|'cargo'|'laycan'|'quality'|'clearance'|'offload'>('overview');
    const [participantFilter, setParticipantFilter] = useState<string>('all');
    const [expandedTest, setExpandedTest] = useState<string|null>(null);

    const participantTypes = [
      { key: 'all', label: 'All' },
      { key: 'importer', label: 'Importers' },
      { key: 'omc', label: 'OMCs' },
      { key: 'marking', label: 'Marking Cos.' },
      { key: 'depot', label: 'Depots' },
      { key: 'transporter', label: 'Transporters' },
      { key: 'laboratory', label: 'Labs' },
      { key: 'shipping', label: 'Shipping' },
    ];

    const typeIcon: Record<string,any> = {
      importer: Ship, omc: Fuel, marking: Shield, depot: Warehouse,
      transporter: Truck, laboratory: FlaskConical, shipping: Anchor,
    };

    const typeBadge: Record<string,string> = {
      importer: 'bg-blue-100 text-blue-800', omc: 'bg-green-100 text-green-800',
      marking: 'bg-purple-100 text-purple-800', depot: 'bg-orange-100 text-orange-800',
      transporter: 'bg-yellow-100 text-yellow-800', laboratory: 'bg-teal-100 text-teal-800',
      shipping: 'bg-indigo-100 text-indigo-800',
    };

    const cargoStatusBadge: Record<string,string> = {
      declared: 'bg-blue-100 text-blue-800', 'in-transit': 'bg-yellow-100 text-yellow-800',
      sampling: 'bg-purple-100 text-purple-800', cleared: 'bg-green-100 text-green-800',
      discharged: 'bg-gray-100 text-gray-700', rejected: 'bg-red-100 text-red-800',
    };

    const laycanStatusBadge: Record<string,string> = {
      completed: 'bg-gray-100 text-gray-700', active: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800', requested: 'bg-yellow-100 text-yellow-800',
    };

    const tabs = [
      { key: 'overview',     label: 'Overview',     Icon: Layers      },
      { key: 'participants', label: 'Participants',  Icon: Users       },
      { key: 'cargo',        label: 'Cargo',         Icon: Container   },
      { key: 'laycan',       label: 'Laycan',        Icon: Calendar    },
      { key: 'quality',      label: 'Quality',       Icon: FlaskConical},
      { key: 'clearance',    label: 'Clearance',     Icon: BadgeCheck  },
      { key: 'offload',      label: 'Offload',       Icon: Warehouse   },
    ] as const;

    const filteredParticipants = participantFilter === 'all'
      ? FTL_PARTICIPANTS
      : FTL_PARTICIPANTS.filter(p => p.type === participantFilter);

    return (
      <div className="pb-4">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">Fuel Trading & Logistics</h2>
              <p className="text-blue-200 text-xs">Regulatory Platform — Port of Mombasa Supply Chain</p>
            </div>
          </div>
          {/* Pipeline status pills */}
          <div className="flex gap-2 flex-wrap mt-3">
            {[
              { label: `${FTL_CARGO.filter(c=>c.status==='in-transit').length} In Transit`,   color: 'bg-yellow-400 text-yellow-900' },
              { label: `${FTL_CARGO.filter(c=>c.status==='sampling').length} Sampling`,        color: 'bg-purple-400 text-purple-900' },
              { label: `${FTL_CLEARANCES.filter(c=>c.status==='authorized').length} Cleared`,  color: 'bg-green-400 text-green-900' },
              { label: `${FTL_OFFLOADS.filter(c=>c.status==='in-progress').length} Offloading`,color: 'bg-orange-400 text-orange-900' },
            ].map(({label,color})=>(
              <span key={label} className={`${color} text-xs font-bold px-2.5 py-1 rounded-full`}>{label}</span>
            ))}
          </div>
        </div>

        {/* Module Tabs (scrollable horizontal) */}
        <div className="overflow-x-auto bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex min-w-max">
            {tabs.map(({key, label, Icon}) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${activeTab === key ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Supply Chain Pipeline */}
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Mombasa Port Supply Chain Pipeline</h3>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {[
                    { label: 'Cargo Declaration', Icon: Container, count: FTL_CARGO.length, color: 'bg-blue-600', sub: 'Vessel + BL' },
                    { label: 'Laycan / Berthing', Icon: Anchor,    count: FTL_LAYCAN.filter(l=>l.status==='active'||l.status==='confirmed').length, color: 'bg-indigo-600', sub: 'KPA scheduling' },
                    { label: 'Quality Sampling',  Icon: FlaskConical, count: FTL_LAB_TESTS.length, color: 'bg-purple-600', sub: 'KEBS / Intertek' },
                    { label: 'Clearance Auth.',   Icon: BadgeCheck, count: FTL_CLEARANCES.filter(c=>c.status==='authorized').length, color: 'bg-green-600', sub: 'KEBS · EPRA · KRA' },
                    { label: 'Depot Offload',     Icon: Warehouse,  count: FTL_OFFLOADS.length, color: 'bg-orange-600', sub: 'Volume reconciliation' },
                    { label: 'Distribution',      Icon: Truck,      count: 0, color: 'bg-teal-600', sub: 'OMC → Stations' },
                  ].map(({label, Icon, count, color, sub}, i, arr) => (
                    <div key={label} className="flex items-center gap-1 flex-shrink-0">
                      <div className={`${color} text-white rounded-xl px-3 py-3 text-center min-w-[90px]`}>
                        <Icon className="w-5 h-5 mx-auto mb-1 opacity-90" />
                        <p className="text-lg font-black leading-none">{count || '–'}</p>
                        <p className="text-[10px] font-bold leading-tight mt-0.5 opacity-90">{label}</p>
                        <p className="text-[9px] opacity-70 mt-0.5">{sub}</p>
                      </div>
                      {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Licensed Entities', value: FTL_PARTICIPANTS.filter(p=>p.status==='active').length, Icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Active Vessels',     value: FTL_CARGO.filter(c=>c.status!=='discharged').length, Icon: Ship, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'High-Risk Cargo',    value: FTL_CARGO.filter(c=>c.riskLevel==='High').length, Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Pending Clearance',  value: FTL_CLEARANCES.filter(c=>c.status==='awaiting-quality').length, Icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                ].map(({label,value,Icon,color,bg})=>(
                  <div key={label} className={`${bg} p-4 rounded-xl border-l-4 border-opacity-50 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${color} mb-2`} />
                    <p className={`text-3xl font-black ${color}`}>{value}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Cargo Activity */}
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Recent Cargo Activity</h3>
                <div className="space-y-2">
                  {FTL_CARGO.map(c => (
                    <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                      <Ship className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{c.vessel}</p>
                        <p className="text-xs text-gray-500">{c.product} · {c.volume.toLocaleString()} L · ETA {c.eta}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${cargoStatusBadge[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PARTICIPANTS ── */}
          {activeTab === 'participants' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Licensed Market Participants</h3>
                <span className="text-xs text-gray-500">{filteredParticipants.length} of {FTL_PARTICIPANTS.length}</span>
              </div>
              {/* Type filter */}
              <div className="overflow-x-auto pb-1">
                <div className="flex gap-1.5 min-w-max">
                  {participantTypes.map(({key, label}) => (
                    <button key={key} onClick={() => setParticipantFilter(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex-shrink-0 ${participantFilter === key ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Participant list */}
              {filteredParticipants.map(p => {
                const Icon = typeIcon[p.type] || Users;
                return (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-sm text-gray-800">{p.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge[p.type] || 'bg-gray-100 text-gray-600'}`}>{p.type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.status.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2"><Globe2 className="w-3 h-3 inline mr-1" />{p.country}</p>
                        <div className="flex gap-2 flex-wrap">
                          {p.epraLic && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-mono">EPRA: {p.epraLic}</span>}
                          {p.kebsLic && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">KEBS: {p.kebsLic}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">Licence expires: {p.expires}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── CARGO DECLARATIONS ── */}
          {activeTab === 'cargo' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700">Cargo Declarations</h3>
              {FTL_CARGO.map(c => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Ship className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-bold text-sm text-gray-800">{c.vessel}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cargoStatusBadge[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">IMO {c.imo} · {c.flag}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${c.riskLevel === 'High' ? 'bg-red-100 text-red-700' : c.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} flex-shrink-0`}>
                      Risk: {c.riskScore}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {([
                      ['Product',    c.product],
                      ['Volume',     `${c.volume.toLocaleString()} L`],
                      ['Origin',     c.origin],
                      ['Refinery',   c.refinery],
                      ['ETA Mombasa', c.eta],
                      ['Bill of Lading', c.bill],
                      ['Importer',   c.importer],
                    ] as [string, string][]).map(([lbl, val]) => (
                      <div key={lbl} className="flex gap-1">
                        <span className="text-gray-400 flex-shrink-0">{lbl}:</span>
                        <span className="font-semibold text-gray-800 truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── LAYCAN SCHEDULE ── */}
          {activeTab === 'laycan' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-gray-700">Berth Allocation & Laycan Schedule</h3>
              </div>
              {/* Berth summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Port of Mombasa — Berth Utilisation</p>
                <div className="space-y-1.5">
                  {['Berth 1 – KPC Kipevu', 'Berth 2 – KPC Kipevu', 'Berth 3 – Essar Jetty', 'Berth 4 – KPC Jetty 2'].map(berth => {
                    const vessel = FTL_LAYCAN.find(l => l.berth === berth && (l.status === 'active' || l.status === 'confirmed'));
                    return (
                      <div key={berth} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${vessel ? (vessel.status === 'active' ? 'bg-green-100' : 'bg-blue-100') : 'bg-white'}`}>
                        <Anchor className={`w-3.5 h-3.5 flex-shrink-0 ${vessel ? (vessel.status === 'active' ? 'text-green-700' : 'text-blue-700') : 'text-gray-400'}`} />
                        <span className="font-semibold text-gray-700 flex-1 truncate">{berth}</span>
                        {vessel
                          ? <span className={`font-bold ${vessel.status === 'active' ? 'text-green-700' : 'text-blue-700'}`}>{vessel.vessel} · {vessel.status.toUpperCase()}</span>
                          : <span className="text-gray-400">Available</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Laycan list */}
              {FTL_LAYCAN.map(l => (
                <div key={l.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-full min-h-[40px] rounded-full flex-shrink-0 ${l.status === 'active' ? 'bg-green-500' : l.status === 'completed' ? 'bg-gray-400' : l.status === 'confirmed' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-gray-800">{l.vessel}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${laycanStatusBadge[l.status] || 'bg-gray-100 text-gray-700'}`}>{l.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{l.berth}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold flex-shrink-0">{l.product}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs ml-5">
                    {([
                      ['Window Start', l.start],
                      ['Window End',   l.end],
                      ['Volume',       `${l.volume.toLocaleString()} L`],
                      ['Shipping Agent', l.agent],
                    ] as [string, string][]).map(([lbl, val]) => (
                      <div key={lbl} className="flex gap-1 col-span-1">
                        <span className="text-gray-400 flex-shrink-0">{lbl}:</span>
                        <span className="font-semibold text-gray-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── QUALITY INSPECTION ── */}
          {activeTab === 'quality' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-bold text-gray-700">Fuel Quality Inspection & Laboratory Results</h3>
              </div>
              {FTL_LAB_TESTS.map(test => (
                <div key={test.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${test.result === 'PASS' ? 'bg-green-100' : test.result === 'FAIL' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        <FlaskConical className={`w-5 h-5 ${test.result === 'PASS' ? 'text-green-700' : test.result === 'FAIL' ? 'text-red-700' : 'text-yellow-700'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-sm text-gray-800">{test.vessel}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${test.result === 'PASS' ? 'bg-green-100 text-green-800' : test.result === 'FAIL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{test.result}</span>
                        </div>
                        <p className="text-xs text-gray-600">{test.product} · {test.lab}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Sampled: {test.sampledAt}{test.completedAt ? ` · Completed: ${test.completedAt}` : ' · In progress…'}</p>
                      </div>
                    </div>
                    <button onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                      className="w-full flex items-center justify-between mt-3 pt-3 border-t text-xs text-blue-600 font-semibold hover:text-blue-800">
                      <span>View Test Parameters ({test.tests.length})</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedTest === test.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {expandedTest === test.id && (
                    <div className="border-t bg-gray-50 p-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500">
                            <th className="text-left py-1 font-semibold">Parameter</th>
                            <th className="text-left py-1 font-semibold">Standard</th>
                            <th className="text-left py-1 font-semibold">Measured</th>
                            <th className="text-center py-1 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {test.tests.map(row => (
                            <tr key={row.param} className="border-t border-gray-200">
                              <td className="py-1.5 text-gray-700">{row.param}</td>
                              <td className="py-1.5 text-gray-500">{row.std}</td>
                              <td className="py-1.5 font-mono text-gray-800">{row.measured}</td>
                              <td className="py-1.5 text-center">
                                {row.pass === null ? <span className="text-gray-400">—</span>
                                  : row.pass ? <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                                  : <X className="w-4 h-4 text-red-600 mx-auto" />}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── CLEARANCE AUTHORIZATION ── */}
          {activeTab === 'clearance' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-green-700" />
                <h3 className="text-sm font-bold text-gray-700">Discharge Clearance Workflow</h3>
              </div>
              <p className="text-xs text-gray-500">Multi-agency digital clearance: KEBS quality confirmation → EPRA regulatory approval → KRA customs → Discharge authorization.</p>
              {FTL_CLEARANCES.map(clr => {
                const steps = [
                  { label: 'KEBS Quality', at: clr.kebsAt, Icon: FlaskConical },
                  { label: 'EPRA Approval', at: clr.epraAt, Icon: Shield },
                  { label: 'KRA Customs', at: clr.kraAt, Icon: Scale },
                  { label: 'Discharge Auth.', at: clr.authAt, Icon: Award },
                ];
                const statusColor = clr.status === 'authorized' ? 'border-green-500 bg-green-50' : clr.status === 'rejected' ? 'border-red-500 bg-red-50' : 'border-yellow-400 bg-yellow-50';
                const statusBadge = clr.status === 'authorized' ? 'bg-green-100 text-green-800' : clr.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
                return (
                  <div key={clr.id} className={`rounded-xl shadow-sm p-4 border-l-4 ${statusColor}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Ship className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-gray-800">{clr.vessel}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge}`}>{clr.status.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-500">{clr.product} · {clr.volume.toLocaleString()} L → {clr.depot}</p>
                      </div>
                    </div>
                    {/* Steps */}
                    <div className="space-y-2">
                      {steps.map((step, idx) => {
                        const done = !!step.at;
                        const active = !done && (idx === 0 || !!steps[idx-1].at);
                        return (
                          <div key={step.label} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-gray-200'}`}>
                              {done ? <CheckCircle className="w-4 h-4 text-white" /> : <step.Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-gray-400'}`} />}
                            </div>
                            <div className="flex-1">
                              <p className={`text-xs font-semibold ${done ? 'text-green-800' : active ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</p>
                              {done && <p className="text-xs text-gray-400">{step.at}</p>}
                              {active && <p className="text-xs text-blue-400 animate-pulse">Awaiting…</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── DEPOT OFFLOAD ── */}
          {activeTab === 'offload' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-orange-700" />
                <h3 className="text-sm font-bold text-gray-700">Depot Offload Management</h3>
              </div>
              {FTL_OFFLOADS.map(off => {
                const variance = off.volumeLoaded > 0 ? ((off.volumeLoaded - off.volumeReceived) / off.volumeLoaded * 100) : 0;
                const statusColor = off.status === 'completed' ? 'bg-gray-50 border-gray-300' : off.status === 'in-progress' ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-300';
                const statusBadge = off.status === 'completed' ? 'bg-gray-100 text-gray-700' : off.status === 'in-progress' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-700';
                return (
                  <div key={off.id} className={`rounded-xl shadow-sm p-4 border-l-4 ${statusColor}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Warehouse className="w-5 h-5 text-orange-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-gray-800">{off.vessel}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge}`}>{off.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">{off.product} → {off.depot}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                      <div className="flex gap-1"><span className="text-gray-400">Tank:</span><span className="font-semibold text-gray-800">{off.tank}</span></div>
                      <div className="flex gap-1"><span className="text-gray-400">Clearance:</span><span className="font-mono text-gray-700">{off.clearance}</span></div>
                      {off.startedAt && <div className="flex gap-1"><span className="text-gray-400">Started:</span><span className="font-semibold text-gray-800">{off.startedAt}</span></div>}
                      {off.completedAt && <div className="flex gap-1"><span className="text-gray-400">Completed:</span><span className="font-semibold text-gray-800">{off.completedAt}</span></div>}
                    </div>
                    {off.status === 'completed' && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Volume Reconciliation</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-[10px] text-gray-500">Vessel Loaded</p>
                            <p className="text-base font-black text-blue-700">{off.volumeLoaded.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-400">L</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-[10px] text-gray-500">Depot Received</p>
                            <p className="text-base font-black text-green-700">{off.volumeReceived.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-400">L</p>
                          </div>
                          <div className={`rounded-lg p-2 ${variance > 1 ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <p className="text-[10px] text-gray-500">Variance</p>
                            <p className={`text-base font-black ${variance > 1 ? 'text-red-700' : 'text-gray-700'}`}>{variance.toFixed(2)}%</p>
                            <p className="text-[9px] text-gray-400">{(off.volumeLoaded - off.volumeReceived).toLocaleString()} L</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {off.status === 'in-progress' && (
                      <div className="flex items-center gap-2 text-xs text-green-700 font-semibold mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Discharge in progress — flow meter monitoring active
                      </div>
                    )}
                    {off.status === 'pending' && (
                      <p className="text-xs text-yellow-700 font-semibold mt-1">⏳ Awaiting clearance authorization</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    );
  };

  // ── REPORTS ──
  const ReportsView = () => {
    const [activeReport, setActiveReport] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState('2026-02-10');
    const [reportLocation, setReportLocation] = useState('all');
    const [timePeriod, setTimePeriod] = useState('daily');

    // Custody flows derived from transactions
    const custodyFlows = (() => {
      const flows: Record<string, { location: string; incoming: number; outgoing: number; inCount: number; outCount: number; details: any[] }> = {};
      transactions.forEach(txn => {
        if (!flows[txn.from]) flows[txn.from] = { location: txn.from, incoming: 0, outgoing: 0, inCount: 0, outCount: 0, details: [] };
        if (!flows[txn.to]) flows[txn.to] = { location: txn.to, incoming: 0, outgoing: 0, inCount: 0, outCount: 0, details: [] };
        flows[txn.from].outgoing += txn.volume;
        flows[txn.from].outCount++;
        flows[txn.from].details.push({ ...txn, direction: 'outgoing' });
        flows[txn.to].incoming += txn.volume;
        flows[txn.to].inCount++;
        flows[txn.to].details.push({ ...txn, direction: 'incoming' });
      });
      return Object.values(flows).sort((a, b) => (b.incoming + b.outgoing) - (a.incoming + a.outgoing));
    })();

    // Stock balance calculations
    const stockBalances = stockData.map(stock => {
      const calculatedClosing = stock.opening + stock.receipts - stock.withdrawals - stock.losses;
      return { ...stock, calculatedClosing, discrepancy: stock.current - calculatedClosing };
    });

    // Historical data for the selected date
    const historicalForDate = historicalStockData.filter(h => h.date === selectedDate);

    // Chart data – group by date for line chart
    const chartLocations = reportLocation === 'all'
      ? Array.from(new Set(historicalStockData.map(h => h.location))).slice(0, 4)
      : [reportLocation];
    const chartData = Array.from(new Set(historicalStockData.map(h => h.date))).map(date => {
      const entry: any = { date: date.slice(5) };
      chartLocations.forEach(loc => {
        const record = historicalStockData.find(h => h.date === date && h.location === loc);
        if (record) entry[loc] = record.stock;
      });
      return entry;
    });

    // Volume chart data
    const volumeChartData = stockData.map(s => ({
      name: s.location.length > 15 ? s.location.slice(0, 15) + '...' : s.location,
      fullName: s.location,
      current: s.current,
      capacity: s.capacity,
      receipts: s.receipts,
      withdrawals: s.withdrawals,
    }));

    const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];

    // Volume multiplier for time period
    const volumeMultiplier = timePeriod === 'daily' ? 1 : (timePeriod === 'weekly' ? 7 : 30) / 7;
    const totalReceipts = Math.round(stockData.reduce((a, b) => a + b.receipts * volumeMultiplier, 0));
    const totalWithdrawals = Math.round(stockData.reduce((a, b) => a + b.withdrawals * volumeMultiplier, 0));
    const totalNet = totalReceipts - totalWithdrawals;

    // ── RISK & DISCREPANCY ANALYTICS ──
    const locationZoneMap: Record<string, string> = {};
    depots.forEach(d => { locationZoneMap[d.name] = d.location.split(',')[0].trim(); });
    gasStations.forEach(s => { locationZoneMap[s.name] = s.location.split(',')[0].trim(); });

    const riskProfiles = stockData.map(stock => {
      const bal = stockBalances.find(b => b.location === stock.location);
      const discrepancy = bal ? bal.discrepancy : 0;
      const calculatedClosing = bal ? bal.calculatedClosing : 0;
      const locationIncidents = incidents.filter(inc => inc.location === stock.location);
      const openInc = locationIncidents.filter(inc => inc.status !== 'resolved');
      const highInc = locationIncidents.filter(inc => inc.severity === 'high');
      const varianceScore = Math.min(Math.round(stock.variance / 0.25 * 100), 100);
      const discrepancyScore = Math.min(Math.round(Math.abs(discrepancy) / 500 * 100), 100);
      const lossScore = Math.min(Math.round(stock.losses / 200 * 100), 100);
      const incidentScore = Math.min(openInc.length * 30 + highInc.length * 20, 100);
      const riskScore = Math.round(varianceScore * 0.3 + discrepancyScore * 0.25 + lossScore * 0.25 + incidentScore * 0.2);
      const riskLevel = riskScore >= 75 ? 'Critical' : riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';
      return { ...stock, discrepancy, calculatedClosing, riskScore, riskLevel, varianceScore, discrepancyScore, lossScore, incidentScore, incidentCount: locationIncidents.length, openIncidents: openInc.length, highSeverityIncidents: highInc.length, zone: locationZoneMap[stock.location] || 'Other' };
    }).sort((a, b) => b.riskScore - a.riskScore);

    const zoneRisks = (() => {
      const zones: Record<string, { zone: string; locations: typeof riskProfiles; avgScore: number; totalLosses: number; locationCount: number }> = {};
      riskProfiles.forEach(rp => {
        const zone = rp.zone;
        if (!zones[zone]) zones[zone] = { zone, locations: [], avgScore: 0, totalLosses: 0, locationCount: 0 };
        zones[zone].locations.push(rp);
        zones[zone].totalLosses += rp.losses;
        zones[zone].locationCount++;
      });
      Object.values(zones).forEach(z => { z.avgScore = Math.round(z.locations.reduce((a, b) => a + b.riskScore, 0) / z.locations.length); });
      return Object.values(zones).sort((a, b) => b.avgScore - a.avgScore);
    })();

    const operatorRisks = (() => {
      const ops: Record<string, { operator: string; locations: typeof riskProfiles; avgScore: number; totalLosses: number; locationCount: number }> = {};
      riskProfiles.forEach(rp => {
        if (!ops[rp.company]) ops[rp.company] = { operator: rp.company, locations: [], avgScore: 0, totalLosses: 0, locationCount: 0 };
        ops[rp.company].locations.push(rp);
        ops[rp.company].totalLosses += rp.losses;
        ops[rp.company].locationCount++;
      });
      Object.values(ops).forEach(o => { o.avgScore = Math.round(o.locations.reduce((a, b) => a + b.riskScore, 0) / o.locations.length); });
      return Object.values(ops).sort((a, b) => b.avgScore - a.avgScore);
    })();

    const enforcementPlan = riskProfiles.map(rp => {
      const actions: string[] = [];
      if (rp.varianceScore >= 50) actions.push('Stock reconciliation audit');
      if (rp.discrepancyScore >= 50) actions.push('Physical stock verification');
      if (rp.lossScore >= 50) actions.push('Leakage investigation');
      if (rp.incidentScore >= 50) actions.push('Incident follow-up');
      if (rp.riskLevel === 'Critical') actions.push('Immediate site inspection');
      if (rp.riskLevel === 'High') actions.push('Priority monitoring');
      if (actions.length === 0) actions.push('Routine monitoring');
      const priority = rp.riskLevel === 'Critical' ? 1 : rp.riskLevel === 'High' ? 2 : rp.riskLevel === 'Medium' ? 3 : 4;
      return { ...rp, priority, actions };
    }).sort((a, b) => a.priority - b.priority || b.riskScore - a.riskScore);

    const riskChartData = riskProfiles.map(rp => ({ name: rp.location.length > 15 ? rp.location.slice(0, 15) + '...' : rp.location, score: rp.riskScore }));
    const zoneChartData = zoneRisks.map(z => ({ name: z.zone, score: z.avgScore, locations: z.locationCount }));
    const operatorChartData = operatorRisks.map(o => ({ name: o.operator.length > 15 ? o.operator.slice(0, 15) + '...' : o.operator, score: o.avgScore, locations: o.locationCount }));

    // ── Report list ──
    if (!activeReport) return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">{t('rep.title')}</h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'current-stock', icon: Fuel, color: 'text-blue-600', title: t('rep.currentStock'), desc: t('rep.currentStockSub') },
            { id: 'historical', icon: TrendingUp, color: 'text-green-600', title: t('rep.historicalStock'), desc: t('rep.historicalSub') },
            { id: 'custody-flow', icon: Truck, color: 'text-orange-600', title: t('rep.custodyFlow'), desc: 'Incoming & outgoing fuel flows at each custody change' },
            { id: 'balance', icon: Activity, color: 'text-purple-600', title: t('rep.stockBalance'), desc: 'Automated balance calculation across the supply chain' },
            { id: 'volume', icon: BarChart3, color: 'text-red-600', title: t('rep.volumeLevels'), desc: 'Fuel volumes by location and time period' },
            { id: 'discrepancy', icon: AlertTriangle, color: 'text-amber-600', title: t('rep.discrepancy'), desc: 'Highlighting discrepancies, leakages, or theft' },
            { id: 'risk-profile', icon: Shield, color: 'text-indigo-600', title: t('rep.riskProfiling'), desc: 'Risk profiling for each monitored location' },
            { id: 'high-risk', icon: Target, color: 'text-rose-600', title: t('rep.highRiskZones'), desc: 'Identification of high-risk zones and operators' },
            { id: 'enforcement', icon: Crosshair, color: 'text-teal-600', title: t('rep.enforcement'), desc: 'Targeted enforcement planning based on risk indicators' },
          ].map(report => (
            <button key={report.id} onClick={() => setActiveReport(report.id)} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-left">
              <div className="flex items-center gap-3">
                <report.icon className={`w-8 h-8 ${report.color}`} />
                <div><p className="font-semibold text-gray-800">{report.title}</p><p className="text-sm text-gray-600">{report.desc}</p></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <div className="p-4 space-y-4">
        <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-blue-600 font-semibold"><X className="w-5 h-5" />{t('rep.back')}</button>

        {/* ── CURRENT STOCK LEVELS ── */}
        {activeReport === 'current-stock' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{t('rep.currentStock')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('rep.currentStockSub')}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.totalStock')}</p><p className="text-lg font-bold text-blue-600">{stockData.reduce((a, b) => a + b.current, 0).toLocaleString()} L</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.totalCapacity')}</p><p className="text-lg font-bold text-green-600">{stockData.reduce((a, b) => a + b.capacity, 0).toLocaleString()} L</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.avgUtil')}</p><p className="text-lg font-bold text-yellow-600">{(stockData.reduce((a, b) => a + (b.current / b.capacity), 0) / stockData.length * 100).toFixed(1)}%</p></div>
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.locationsMonitored')}</p><p className="text-lg font-bold text-red-600">{stockData.length}</p></div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('rep.stockVsCapacity')}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={volumeChartData} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} L`} />
                  <Legend />
                  <Bar dataKey="current" fill="#2563eb" name="Current Stock" />
                  <Bar dataKey="capacity" fill="#d1d5db" name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {stockData.map((stock, i) => {
              const utilization = (stock.current / stock.capacity) * 100;
              return (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {stock.location.includes('Depot') || stock.location.includes('Facility') ? <Building2 className="w-5 h-5 text-blue-600" /> : <Store className="w-5 h-5 text-green-600" />}
                      <div><p className="font-semibold text-gray-800 text-sm">{stock.location}</p><p className="text-xs text-gray-500">{stock.company}</p></div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${utilization > 80 ? 'bg-green-100 text-green-800' : utilization > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{utilization.toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-2">
                    <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Current</p><p className="font-bold text-sm text-blue-600">{stock.current.toLocaleString()} L</p></div>
                    <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Capacity</p><p className="font-bold text-sm text-gray-700">{stock.capacity.toLocaleString()} L</p></div>
                    <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Variance</p><p className={`font-bold text-sm ${stock.variance >= 0.15 ? 'text-red-600' : 'text-green-600'}`}>{stock.variance}%</p></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${utilization > 80 ? 'bg-green-500' : utilization > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${utilization}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── HISTORICAL STOCK LEVELS ── */}
        {activeReport === 'historical' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{t('rep.historicalStock')}</h3>
              <p className="text-sm text-gray-500 mb-4">View stock levels at any given date</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t('rep.selectDate')}</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min="2026-02-04" max="2026-02-10" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Location</label>
                  <select value={reportLocation} onChange={e => setReportLocation(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="all">All Locations</option>
                    {stockData.map(s => <option key={s.location} value={s.location}>{s.location}</option>)}
                  </select>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Stock Level Trends (7-Day)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} L`} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {chartLocations.map((loc, i) => (
                    <Line key={loc} type="monotone" dataKey={loc} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} name={loc.length > 20 ? loc.slice(0, 20) + '...' : loc} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Stock Levels on {selectedDate}</h4>
              {historicalForDate
                .filter(h => reportLocation === 'all' || h.location === reportLocation)
                .map((h, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    {h.location.includes('Depot') || h.location.includes('Facility') ? <Building2 className="w-4 h-4 text-blue-600" /> : <Store className="w-4 h-4 text-green-600" />}
                    <div><p className="font-semibold text-sm text-gray-800">{h.location}</p><p className="text-xs text-gray-500">{h.company}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-blue-600">{h.stock.toLocaleString()} L</p>
                    <p className="text-xs text-gray-500">{((h.stock / h.capacity) * 100).toFixed(1)}% full</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CUSTODY FLOW REPORT ── */}
        {activeReport === 'custody-flow' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{t('rep.custodyFlow')}</h3>
              <p className="text-sm text-gray-500 mb-4">Incoming and outgoing fuel flows at each custody change</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Dispatched</p><p className="text-lg font-bold text-green-600">{custodyFlows.reduce((a, b) => a + b.outgoing, 0).toLocaleString()} L</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Received</p><p className="text-lg font-bold text-blue-600">{custodyFlows.reduce((a, b) => a + b.incoming, 0).toLocaleString()} L</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Transfers</p><p className="text-lg font-bold text-yellow-600">{transactions.length}</p></div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={custodyFlows.slice(0, 6).map(f => ({ name: f.location.length > 12 ? f.location.slice(0, 12) + '...' : f.location, Incoming: f.incoming, Outgoing: f.outgoing }))} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} L`} />
                  <Legend />
                  <Bar dataKey="Incoming" fill="#2563eb" />
                  <Bar dataKey="Outgoing" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {custodyFlows.map((flow, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-3">
                  {flow.location.includes('Depot') || flow.location.includes('Facility') ? <Building2 className="w-5 h-5 text-blue-600" /> : <Store className="w-5 h-5 text-green-600" />}
                  <h4 className="font-semibold text-gray-800">{flow.location}</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <ArrowDownCircle className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Incoming</p>
                    <p className="font-bold text-sm text-blue-600">{flow.incoming.toLocaleString()} L</p>
                    <p className="text-xs text-gray-400">{flow.inCount} transfer{flow.inCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <ArrowUpCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Outgoing</p>
                    <p className="font-bold text-sm text-green-600">{flow.outgoing.toLocaleString()} L</p>
                    <p className="text-xs text-gray-400">{flow.outCount} transfer{flow.outCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className={`p-2 rounded text-center ${(flow.incoming - flow.outgoing) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Activity className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Net Flow</p>
                    <p className={`font-bold text-sm ${(flow.incoming - flow.outgoing) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(flow.incoming - flow.outgoing) >= 0 ? '+' : ''}{(flow.incoming - flow.outgoing).toLocaleString()} L</p>
                  </div>
                </div>
                <div className="border-t pt-2">
                  {flow.details.map((txn: any, j: number) => (
                    <div key={j} className="flex items-center justify-between py-2 text-sm border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${txn.direction === 'incoming' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <div><p className="text-gray-700">{txn.id} - {txn.type}</p><p className="text-xs text-gray-500">{txn.date} {txn.time}</p></div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${txn.direction === 'incoming' ? 'text-blue-600' : 'text-green-600'}`}>{txn.direction === 'incoming' ? '+' : '-'}{txn.volume.toLocaleString()} L</p>
                        <p className="text-xs text-gray-500">{txn.direction === 'incoming' ? `From: ${txn.from}` : `To: ${txn.to}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STOCK BALANCE CALCULATOR ── */}
        {activeReport === 'balance' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Stock Balance Calculator</h3>
              <p className="text-sm text-gray-500 mb-4">Automated calculation of stock balances across the supply chain</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Opening Stock</p><p className="text-lg font-bold text-blue-600">{stockBalances.reduce((a, b) => a + b.opening, 0).toLocaleString()} L</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Receipts</p><p className="text-lg font-bold text-green-600">+{stockBalances.reduce((a, b) => a + b.receipts, 0).toLocaleString()} L</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Withdrawals</p><p className="text-lg font-bold text-yellow-600">-{stockBalances.reduce((a, b) => a + b.withdrawals, 0).toLocaleString()} L</p></div>
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Losses</p><p className="text-lg font-bold text-red-600">-{stockBalances.reduce((a, b) => a + b.losses, 0).toLocaleString()} L</p></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Balance Formula</p>
                <p className="font-mono text-sm font-semibold text-gray-700">Closing = Opening + Receipts - Withdrawals - Losses</p>
              </div>
            </div>
            {stockBalances.map((bal, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {bal.location.includes('Depot') || bal.location.includes('Facility') ? <Building2 className="w-5 h-5 text-blue-600" /> : <Store className="w-5 h-5 text-green-600" />}
                    <div><p className="font-semibold text-gray-800 text-sm">{bal.location}</p><p className="text-xs text-gray-500">{bal.company}</p></div>
                  </div>
                  {Math.abs(bal.discrepancy) > 0 ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${Math.abs(bal.discrepancy) <= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{bal.discrepancy > 0 ? '+' : ''}{bal.discrepancy.toLocaleString()} L</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Balanced</span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm py-1 border-b"><span className="text-gray-600">Opening Stock</span><span className="font-semibold">{bal.opening.toLocaleString()} L</span></div>
                  <div className="flex justify-between text-sm py-1 border-b"><span className="text-green-600">+ Receipts</span><span className="font-semibold text-green-600">+{bal.receipts.toLocaleString()} L</span></div>
                  <div className="flex justify-between text-sm py-1 border-b"><span className="text-yellow-600">- Withdrawals</span><span className="font-semibold text-yellow-600">-{bal.withdrawals.toLocaleString()} L</span></div>
                  <div className="flex justify-between text-sm py-1 border-b"><span className="text-red-600">- Losses</span><span className="font-semibold text-red-600">-{bal.losses.toLocaleString()} L</span></div>
                  <div className="flex justify-between text-sm py-1 border-b bg-blue-50 px-2 rounded"><span className="font-semibold text-blue-800">= Calculated Closing</span><span className="font-bold text-blue-600">{bal.calculatedClosing.toLocaleString()} L</span></div>
                  <div className="flex justify-between text-sm py-1"><span className="text-gray-600">Actual Current Stock</span><span className="font-semibold">{bal.current.toLocaleString()} L</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VOLUME LEVELS REPORT ── */}
        {activeReport === 'volume' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Volume Levels Report</h3>
              <p className="text-sm text-gray-500 mb-4">Fuel volumes by location and time period</p>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-4">
                {['daily', 'weekly', 'monthly'].map(p => (
                  <button key={p} onClick={() => setTimePeriod(p)} className={`flex-1 py-2 rounded-md font-semibold text-sm transition capitalize ${timePeriod === p ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>{p}</button>
                ))}
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Receipts vs Withdrawals by Location</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={volumeChartData} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} L`} />
                  <Legend />
                  <Bar dataKey="receipts" fill="#16a34a" name="Receipts" />
                  <Bar dataKey="withdrawals" fill="#dc2626" name="Withdrawals" />
                </BarChart>
              </ResponsiveContainer>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Volume Trends Over Time</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} L`} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {chartLocations.map((loc, i) => (
                    <Line key={loc} type="monotone" dataKey={loc} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} name={loc.length > 20 ? loc.slice(0, 20) + '...' : loc} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Volume Details ({timePeriod})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 font-semibold text-gray-700">Location</th>
                      <th className="text-right p-2 font-semibold text-gray-700">Receipts</th>
                      <th className="text-right p-2 font-semibold text-gray-700">Withdrawals</th>
                      <th className="text-right p-2 font-semibold text-gray-700">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((stock, i) => {
                      const r = Math.round(stock.receipts * volumeMultiplier);
                      const w = Math.round(stock.withdrawals * volumeMultiplier);
                      const n = r - w;
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-2"><p className="font-medium text-gray-800">{stock.location}</p><p className="text-xs text-gray-500">{stock.company}</p></td>
                          <td className="p-2 text-right text-green-600 font-semibold">{r.toLocaleString()} L</td>
                          <td className="p-2 text-right text-red-600 font-semibold">{w.toLocaleString()} L</td>
                          <td className={`p-2 text-right font-bold ${n >= 0 ? 'text-green-600' : 'text-red-600'}`}>{n >= 0 ? '+' : ''}{n.toLocaleString()} L</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td className="p-2">Total</td>
                      <td className="p-2 text-right text-green-600">{totalReceipts.toLocaleString()} L</td>
                      <td className="p-2 text-right text-red-600">{totalWithdrawals.toLocaleString()} L</td>
                      <td className={`p-2 text-right ${totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalNet >= 0 ? '+' : ''}{totalNet.toLocaleString()} L</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── DISCREPANCY & LEAKAGE REPORT ── */}
        {activeReport === 'discrepancy' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Discrepancy & Leakage Report</h3>
              <p className="text-sm text-gray-500 mb-4">Highlighting discrepancies, leakages, or theft across monitored locations</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Losses</p><p className="text-lg font-bold text-red-600">{stockData.reduce((a, b) => a + b.losses, 0).toLocaleString()} L</p></div>
                <div className="bg-amber-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Discrepancy</p><p className="text-lg font-bold text-amber-600">{Math.abs(stockBalances.reduce((a, b) => a + b.discrepancy, 0)).toLocaleString()} L</p></div>
                <div className="bg-orange-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Flagged Locations</p><p className="text-lg font-bold text-orange-600">{stockBalances.filter(b => Math.abs(b.discrepancy) > 50 || b.losses > 100).length}</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Avg Loss Rate</p><p className="text-lg font-bold text-blue-600">{(stockData.reduce((a, b) => a + b.losses, 0) / stockData.reduce((a, b) => a + b.current, 0) * 100).toFixed(3)}%</p></div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Losses & Discrepancies by Location</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stockData.map(s => ({ name: s.location.length > 15 ? s.location.slice(0, 15) + '...' : s.location, Losses: s.losses, Discrepancy: Math.abs(stockBalances.find(b => b.location === s.location)?.discrepancy || 0) }))} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} L`} />
                  <Legend />
                  <Bar dataKey="Losses" fill="#dc2626" />
                  <Bar dataKey="Discrepancy" fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {[...stockBalances].sort((a, b) => (Math.abs(b.discrepancy) + b.losses) - (Math.abs(a.discrepancy) + a.losses)).map((bal, i) => {
              const flags: string[] = [];
              if (bal.losses > 100) flags.push('Potential Leakage');
              if (Math.abs(bal.discrepancy) > 50) flags.push('Unexplained Loss');
              if (bal.variance >= 0.15) flags.push('High Variance');
              const severity = flags.length >= 2 ? 'high' : flags.length === 1 ? 'medium' : 'low';
              return (
                <div key={i} className={`bg-white rounded-lg shadow p-4 ${severity === 'high' ? 'border-l-4 border-red-500' : severity === 'medium' ? 'border-l-4 border-yellow-500' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {bal.location.includes('Depot') || bal.location.includes('Facility') ? <Building2 className="w-5 h-5 text-blue-600" /> : <Store className="w-5 h-5 text-green-600" />}
                      <div><p className="font-semibold text-gray-800 text-sm">{bal.location}</p><p className="text-xs text-gray-500">{bal.company}</p></div>
                    </div>
                    {severity !== 'low' && <AlertTriangle className={`w-5 h-5 ${severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Reported Losses</p><p className={`font-bold text-sm ${bal.losses > 100 ? 'text-red-600' : 'text-gray-700'}`}>{bal.losses.toLocaleString()} L</p></div>
                    <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Discrepancy</p><p className={`font-bold text-sm ${Math.abs(bal.discrepancy) > 50 ? 'text-red-600' : Math.abs(bal.discrepancy) > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{bal.discrepancy > 0 ? '+' : ''}{bal.discrepancy.toLocaleString()} L</p></div>
                    <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Variance</p><p className={`font-bold text-sm ${bal.variance >= 0.15 ? 'text-red-600' : 'text-green-600'}`}>{(bal.variance * 100).toFixed(1)}%</p></div>
                  </div>
                  {flags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {flags.map((flag, j) => (
                        <span key={j} className={`px-2 py-1 rounded-full text-xs font-semibold ${flag === 'Potential Leakage' ? 'bg-red-100 text-red-800' : flag === 'Unexplained Loss' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'}`}>{flag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── RISK PROFILING REPORT ── */}
        {activeReport === 'risk-profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{t('rep.riskProfiling')}</h3>
              <p className="text-sm text-gray-500 mb-4">Composite risk assessment for each monitored location</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.criticalRisk')}</p><p className="text-lg font-bold text-red-600">{riskProfiles.filter(r => r.riskLevel === 'Critical').length} {t('rep.locations')}</p></div>
                <div className="bg-orange-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.highRisk')}</p><p className="text-lg font-bold text-orange-600">{riskProfiles.filter(r => r.riskLevel === 'High').length} {t('rep.locations')}</p></div>
                <div className="bg-indigo-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.avgRisk')}</p><p className="text-lg font-bold text-indigo-600">{Math.round(riskProfiles.reduce((a, b) => a + b.riskScore, 0) / riskProfiles.length)}/100</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Open Incidents</p><p className="text-lg font-bold text-yellow-600">{incidents.filter(inc => inc.status !== 'resolved').length}</p></div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Scores by Location</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={riskChartData} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" name="Risk Score" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {riskProfiles.map((rp, i) => (
              <div key={i} className={`bg-white rounded-lg shadow p-4 border-l-4 ${rp.riskLevel === 'Critical' ? 'border-red-500' : rp.riskLevel === 'High' ? 'border-orange-500' : rp.riskLevel === 'Medium' ? 'border-yellow-500' : 'border-green-500'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {rp.location.includes('Depot') || rp.location.includes('Facility') ? <Building2 className="w-5 h-5 text-blue-600" /> : <Store className="w-5 h-5 text-green-600" />}
                    <div><p className="font-semibold text-gray-800 text-sm">{rp.location}</p><p className="text-xs text-gray-500">{rp.company}</p></div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${rp.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' : rp.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' : rp.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{rp.riskLevel}</span>
                    <p className="text-lg font-bold text-gray-800 mt-1">{rp.riskScore}<span className="text-xs text-gray-500 font-normal">/100</span></p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Variance Risk</span><span className="font-semibold">{rp.varianceScore}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${rp.varianceScore}%` }} /></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Discrepancy Risk</span><span className="font-semibold">{rp.discrepancyScore}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${rp.discrepancyScore}%` }} /></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Loss Risk</span><span className="font-semibold">{rp.lossScore}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${rp.lossScore}%` }} /></div></div>
                  <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Incident Risk</span><span className="font-semibold">{rp.incidentScore}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${rp.incidentScore}%` }} /></div></div>
                </div>
                <div className="mt-3 pt-2 border-t grid grid-cols-3 gap-2 text-center text-xs">
                  <div><p className="text-gray-500">Incidents</p><p className="font-bold text-gray-800">{rp.incidentCount}</p></div>
                  <div><p className="text-gray-500">Open</p><p className="font-bold text-red-600">{rp.openIncidents}</p></div>
                  <div><p className="text-gray-500">Zone</p><p className="font-bold text-gray-800">{rp.zone}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HIGH-RISK ZONES & OPERATORS ── */}
        {activeReport === 'high-risk' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{t('rep.highRiskZones')}</h3>
              <p className="text-sm text-gray-500 mb-4">Identification of high-risk geographic zones and fuel operators</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Highest Risk Zone</p><p className="text-lg font-bold text-red-600">{zoneRisks[0]?.zone || 'N/A'}</p></div>
                <div className="bg-orange-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Highest Risk Operator</p><p className="text-lg font-bold text-orange-600 text-sm">{operatorRisks[0]?.operator.split(' ').slice(0, 2).join(' ') || 'N/A'}</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Zones Monitored</p><p className="text-lg font-bold text-blue-600">{zoneRisks.length}</p></div>
                <div className="bg-indigo-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Operators Monitored</p><p className="text-lg font-bold text-indigo-600">{operatorRisks.length}</p></div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Score by Zone</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={zoneChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" name="Avg Risk Score" fill="#e11d48" />
                </BarChart>
              </ResponsiveContainer>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Risk Score by Operator</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={operatorChartData} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" name="Avg Risk Score" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Zone Risk Details</h4>
              {zoneRisks.map((zone, i) => (
                <div key={i} className="py-3 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-5 h-5 ${zone.avgScore >= 50 ? 'text-red-500' : zone.avgScore >= 25 ? 'text-yellow-500' : 'text-green-500'}`} />
                      <div><p className="font-semibold text-gray-800">{zone.zone}</p><p className="text-xs text-gray-500">{zone.locationCount} location{zone.locationCount !== 1 ? 's' : ''} monitored</p></div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${zone.avgScore >= 75 ? 'bg-red-100 text-red-800' : zone.avgScore >= 50 ? 'bg-orange-100 text-orange-800' : zone.avgScore >= 25 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{zone.avgScore}/100</span>
                  </div>
                  <div className="ml-7 space-y-1">
                    {zone.locations.map((loc, j) => (
                      <div key={j} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{loc.location}</span>
                        <span className={`font-semibold ${loc.riskScore >= 50 ? 'text-red-600' : loc.riskScore >= 25 ? 'text-yellow-600' : 'text-green-600'}`}>{loc.riskScore}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Operator Risk Details</h4>
              {operatorRisks.map((op, i) => (
                <div key={i} className="py-3 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-5 h-5 ${op.avgScore >= 50 ? 'text-red-500' : op.avgScore >= 25 ? 'text-yellow-500' : 'text-green-500'}`} />
                      <div><p className="font-semibold text-gray-800">{op.operator}</p><p className="text-xs text-gray-500">{op.locationCount} location{op.locationCount !== 1 ? 's' : ''} | Total losses: {op.totalLosses.toLocaleString()} L</p></div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${op.avgScore >= 75 ? 'bg-red-100 text-red-800' : op.avgScore >= 50 ? 'bg-orange-100 text-orange-800' : op.avgScore >= 25 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{op.avgScore}/100</span>
                  </div>
                  <div className="ml-7 space-y-1">
                    {op.locations.map((loc, j) => (
                      <div key={j} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{loc.location}</span>
                        <span className={`font-semibold ${loc.riskScore >= 50 ? 'text-red-600' : loc.riskScore >= 25 ? 'text-yellow-600' : 'text-green-600'}`}>{loc.riskScore}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ENFORCEMENT PLANNING ── */}
        {activeReport === 'enforcement' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{t('rep.enforcement')}</h3>
              <p className="text-sm text-gray-500 mb-4">Targeted enforcement actions based on risk indicators</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.critPriority')}</p><p className="text-lg font-bold text-red-600">{enforcementPlan.filter(e => e.priority === 1).length} {t('rep.locations')}</p></div>
                <div className="bg-orange-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.highPriority')}</p><p className="text-lg font-bold text-orange-600">{enforcementPlan.filter(e => e.priority === 2).length} {t('rep.locations')}</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.medPriority')}</p><p className="text-lg font-bold text-yellow-600">{enforcementPlan.filter(e => e.priority === 3).length} {t('rep.locations')}</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-gray-600">{t('rep.routine')}</p><p className="text-lg font-bold text-green-600">{enforcementPlan.filter(e => e.priority === 4).length} {t('rep.locations')}</p></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">{t('rep.enforcementStrategy')}</p>
                <p className="font-mono text-sm font-semibold text-gray-700">Risk Score → Priority Level → Targeted Actions</p>
              </div>
            </div>
            {enforcementPlan.map((ep, i) => (
              <div key={i} className={`bg-white rounded-lg shadow p-4 border-l-4 ${ep.priority === 1 ? 'border-red-500' : ep.priority === 2 ? 'border-orange-500' : ep.priority === 3 ? 'border-yellow-500' : 'border-green-500'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${ep.priority === 1 ? 'bg-red-500' : ep.priority === 2 ? 'bg-orange-500' : ep.priority === 3 ? 'bg-yellow-500' : 'bg-green-500'}`}>P{ep.priority}</div>
                    <div><p className="font-semibold text-gray-800 text-sm">{ep.location}</p><p className="text-xs text-gray-500">{ep.company} · {ep.zone}</p></div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ep.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' : ep.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' : ep.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{ep.riskLevel}</span>
                    <p className="text-sm font-bold text-gray-700 mt-1">Score: {ep.riskScore}/100</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Variance</p><p className="font-bold text-xs">{(ep.variance * 100).toFixed(1)}%</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Losses</p><p className="font-bold text-xs">{ep.losses.toLocaleString()} L</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Discrepancy</p><p className="font-bold text-xs">{ep.discrepancy.toLocaleString()} L</p></div>
                  <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Incidents</p><p className="font-bold text-xs">{ep.openIncidents} open</p></div>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Recommended Actions:</p>
                  <div className="space-y-1">
                    {ep.actions.map((action, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Crosshair className="w-3 h-3 text-teal-600 flex-shrink-0" />
                        <span className="text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── PROFILES VIEW ──
  const ProfilesView = () => {
    const profiles = [
      { key: 'admin', label: t('pro.admin') },
      { key: 'operator', label: t('pro.depot') },
      { key: 'station_operator', label: t('pro.station') },
      { key: 'inspector', label: t('pro.inspector') },
    ];
    const pages = [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'sct', label: 'SCT' },
      { key: 'wsm', label: 'WSM' },
      { key: 'incidents', label: 'Alerts' },
      { key: 'reports', label: 'Reports' },
    ];

    const togglePermission = (profileKey: string, pageKey: string) => {
      setProfilePermissions(prev => ({
        ...prev,
        [profileKey]: {
          ...prev[profileKey],
          [pageKey]: !prev[profileKey][pageKey],
        },
      }));
    };

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setCurrentView('dashboard')} className="text-green-700">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{t('pro.title')}</h2>
        </div>
        {profiles.map(profile => (
          <div key={profile.key} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">{profile.label}</h3>
            </div>
            <div className="space-y-2">
              {pages.map(page => (
                <div key={page.key} className="flex items-center justify-between py-2 px-3 rounded bg-gray-50">
                  <span className="text-sm text-gray-700">{page.label}</span>
                  <button
                    onClick={() => togglePermission(profile.key, page.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${profilePermissions[profile.key][page.key] ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profilePermissions[profile.key][page.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── SETTINGS VIEW ──
  const SettingsView = () => {
    const [localSettings, setLocalSettings] = useState({ ...appSettings });

    const handleSave = () => {
      setAppSettings(localSettings);
      setCurrentView('dashboard');
    };

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setCurrentView('dashboard')} className="text-green-700">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{t('set.title')}</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('set.appTitle')}</label>
            <input
              type="text"
              value={localSettings.appTitle}
              onChange={e => setLocalSettings({ ...localSettings, appTitle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('set.appSubtitle')}</label>
            <input
              type="text"
              value={localSettings.appSubtitle}
              onChange={e => setLocalSettings({ ...localSettings, appSubtitle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('set.footerText')}</label>
            <input
              type="text"
              value={localSettings.footerText}
              onChange={e => setLocalSettings({ ...localSettings, footerText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('set.subFooter')}</label>
            <input
              type="text"
              value={localSettings.subFooterText}
              onChange={e => setLocalSettings({ ...localSettings, subFooterText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {t('set.save')}
          </button>
        </div>
      </div>
    );
  };

  // ── NAV COMPONENTS ──
  const NavBar = () => (
    <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center"><Fuel className="w-6 h-6 text-green-700" /></div>
          <div><h1 className="font-bold text-sm leading-tight">{appSettings.appTitle}</h1><p className="text-xs text-green-100">{appSettings.appSubtitle}</p></div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      </div>
    </div>
  );

  const BottomNav = () => {
    const userRole = currentUser?.role || '';
    const rolePerms = profilePermissions[userRole] || {};
    const allNavItems = [
      { view: 'dashboard', icon: Home,        label: t('nav.home')     },
      { view: 'sct',       icon: Truck,       label: t('nav.sct')      },
      { view: 'trading',   icon: Anchor,      label: 'Trading' },
      { view: 'wsm',       icon: Package,     label: t('nav.wsm')      },
      { view: 'incidents', icon: AlertCircle, label: t('nav.alerts')   },
      { view: 'reports',   icon: BarChart3,   label: t('nav.reports')  },
    ];
    const visibleItems = allNavItems.filter(item => rolePerms[item.view] !== false);
    return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex justify-around p-2">
        {visibleItems.map(({ view, icon: Icon, label }) => (
          <button key={view} onClick={() => setCurrentView(view)} className={`flex flex-col items-center p-2 flex-1 ${currentView === view ? 'text-green-600' : 'text-gray-600'}`}>
            <Icon className="w-6 h-6" /><span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
  };

  const SideMenu = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}>
      <div className={`fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
        <div className="p-4 bg-gradient-to-r from-green-700 to-green-600 text-white">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-lg">{t('nav.options')}</h2><p className="text-xs text-green-100">{currentUser?.name}</p></div><button onClick={() => setMenuOpen(false)}><X className="w-6 h-6" /></button></div>
        </div>
        <div className="p-4 space-y-2">
          <button onClick={() => { setCurrentView('tracking'); setMenuOpen(false); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3"><Navigation className="w-5 h-5 text-green-600" /><span>{t('nav.cargoTracking')}</span></button>
          <button onClick={() => { setCurrentView('trading'); setMenuOpen(false); }} className="w-full text-left p-3 rounded hover:bg-blue-50 flex items-center gap-3"><Anchor className="w-5 h-5 text-blue-600" /><span>Trading Platform</span></button>
          <button onClick={() => { setCurrentView('profiles'); setMenuOpen(false); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3"><Users className="w-5 h-5 text-green-600" /><span>{t('nav.profile')}</span></button>
          <button onClick={() => { setCurrentView('settings'); setMenuOpen(false); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3"><Settings className="w-5 h-5 text-green-600" /><span>{t('nav.settings')}</span></button>
          <button onClick={handleLogout} className="w-full text-left p-3 rounded hover:bg-red-50 flex items-center gap-3 text-red-600"><X className="w-5 h-5" /><span>{t('nav.logout')}</span></button>
        </div>
        {/* Language switcher */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">{t('nav.language')}</p>
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(langLabels) as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition ${lang === l ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}>
                <span>{langLabels[l].flag}</span>
                <span>{langLabels[l].label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">{appSettings.footerText}</p>
          <p className="text-xs text-gray-600 text-center">{appSettings.subFooterText}</p>
        </div>
      </div>
    </div>
  );

  // ── LOGIN GUARD ──
  if (!currentUser) return <LoginView />;

  // ── ACCESS HELPER ──
  const userRole = currentUser.role;
  const rolePerms = profilePermissions[userRole] || {};
  const hasAccess = (view: string) => rolePerms[view] !== false;

  // ── MAIN RENDER ──
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavBar />
      <SideMenu />

      {scannerActive && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{scanType === 'consignment' ? t('common.scanConsignment') : scanType === 'delivery' ? t('common.scanDelivery') : t('common.scanLoading')}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t('common.cameraDesc')}</p>
            </div>
            <button onClick={stopCamera} className="text-white bg-gray-700 rounded-full p-2 hover:bg-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <div id={scannerContainerRef.current} className="w-full h-full" />
            {scannerError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-6">
                <div className="bg-white rounded-lg p-6 text-center max-w-sm">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-800 font-semibold mb-2">{t('common.camera')}</p>
                  <p className="text-sm text-gray-600 mb-4">{scannerError}</p>
                  <button onClick={stopCamera} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700">{t('common.close')}</button>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-900 text-center">
            <p className="text-sm text-gray-400">{scanType === 'consignment' ? t('common.scanConsignment') : scanType === 'delivery' ? t('common.scanDelivery') : t('common.scanLoading')}</p>
          </div>
        </div>
      )}

      <CylinderListModal />
      <StationLayoutModal />
      <LpgCylinderModal />
      {currentView === 'dashboard' && hasAccess('dashboard') && <DashboardView />}
      {currentView === 'sct' && hasAccess('sct') && <SCTView />}
      {currentView === 'tracking' && hasAccess('tracking') && <CargoTrackingView />}
      {currentView === 'wsm' && hasAccess('wsm') && <DirectoryView />}
      {currentView === 'incidents' && hasAccess('incidents') && <IncidentsView />}
      {currentView === 'reports' && hasAccess('reports') && <ReportsView />}
      {currentView === 'trading' && <TradingView />}
      {currentView === 'directory' && <DirectoryView />}
      {currentView === 'settings' && <SettingsView />}
      {currentView === 'profiles' && <ProfilesView />}

      <BottomNav />
    </div>
  );
};

export default FuelIntegrityApp;