import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { Menu, X, Home, Package, Truck, AlertCircle, BarChart3, Settings, Scan, CheckCircle, MapPin, Clock, Fuel, Building2, Store, Users, FileText, Eye, TrendingUp, ArrowDownCircle, ArrowUpCircle, Activity, Shield, Target, AlertTriangle, Crosshair, Camera, ClipboardCheck, ChevronRight, Printer, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';

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
      admin: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true },
      operator: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true },
      station_operator: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true },
      inspector: { dashboard: true, sct: true, wsm: true, incidents: true, reports: true },
    };
  });
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

  const [transactions, setTransactions] = useState([
    { id: 'TXN-001', from: 'Nairobi West Depot', to: 'Total Westlands', vehicle: 'KCA 123A', status: 'in-transit', volume: 5000, type: 'Diesel', date: '2026-02-10', time: '08:30', driver: 'Joseph Kimani', driverLicense: 'DL-2023-045891', transporter: 'KenTrans Logistics Ltd', loadingBay: 'Bay 3', compartment: 'C1, C2', sealNumberLoading: 'SL-20260210-001', sealNumberDelivery: 'SD-20260210-001', markerType: 'EPRA Molecular Marker', markerConcentration: '15.2 ppm', markerBatchNo: 'MBN-2026-0087', temperature: '28.4°C', density: '835.6 kg/m³', loadingTicket: 'LT-2026-00341', expectedDelivery: '2026-02-10 12:30', gpsLoading: '-1.3207, 36.8074', approvedBy: 'Sarah Kimani' },
    { id: 'TXN-002', from: 'Kipevu Oil Storage Facility', to: 'Shell Moi Avenue', vehicle: 'KBZ 456B', status: 'completed', volume: 6000, type: 'Gasoline', date: '2026-02-10', time: '09:15', driver: 'Ahmed Ali', driverLicense: 'DL-2022-032567', transporter: 'Coast Fuel Carriers', loadingBay: 'Bay 1', compartment: 'C1, C2, C3', sealNumberLoading: 'SL-20260210-002', sealNumberDelivery: 'SD-20260210-002', markerType: 'EPRA Molecular Marker', markerConcentration: '14.8 ppm', markerBatchNo: 'MBN-2026-0088', temperature: '31.2°C', density: '748.3 kg/m³', loadingTicket: 'LT-2026-00342', expectedDelivery: '2026-02-10 13:15', gpsLoading: '-4.0435, 39.6682', approvedBy: 'John Mwangi' },
    { id: 'TXN-003', from: 'Eldoret Depot', to: 'Shell Uganda Road', vehicle: 'KCD 789C', status: 'completed', volume: 4500, type: 'Diesel', date: '2026-02-10', time: '10:00', driver: 'Samuel Korir', driverLicense: 'DL-2021-078234', transporter: 'Rift Valley Transporters', loadingBay: 'Bay 2', compartment: 'C1, C2', sealNumberLoading: 'SL-20260210-003', sealNumberDelivery: 'SD-20260210-003', markerType: 'EPRA Molecular Marker', markerConcentration: '15.0 ppm', markerBatchNo: 'MBN-2026-0089', temperature: '22.1°C', density: '836.1 kg/m³', loadingTicket: 'LT-2026-00343', expectedDelivery: '2026-02-10 14:00', gpsLoading: '0.5143, 35.2698', approvedBy: 'David Kiplagat' },
    { id: 'TXN-004', from: 'Nairobi West Depot', to: 'Rubis Kilimani', vehicle: 'KAA 234D', status: 'in-transit', volume: 4000, type: 'Gasoline', date: '2026-02-10', time: '11:20', driver: 'Paul Njoroge', driverLicense: 'DL-2023-056789', transporter: 'SafeHaul Kenya Ltd', loadingBay: 'Bay 1', compartment: 'C1', sealNumberLoading: 'SL-20260210-004', sealNumberDelivery: 'SD-20260210-004', markerType: 'EPRA Molecular Marker', markerConcentration: '14.9 ppm', markerBatchNo: 'MBN-2026-0090', temperature: '27.8°C', density: '749.1 kg/m³', loadingTicket: 'LT-2026-00344', expectedDelivery: '2026-02-10 13:20', gpsLoading: '-1.3207, 36.8074', approvedBy: 'Sarah Kimani' },
    { id: 'TXN-005', from: 'Kisumu Depot', to: 'Rubis Oginga Odinga', vehicle: 'KCB 567E', status: 'completed', volume: 3500, type: 'Diesel', date: '2026-02-10', time: '12:45', driver: 'Tom Ochieng', driverLicense: 'DL-2022-089012', transporter: 'Lake Basin Logistics', loadingBay: 'Bay 1', compartment: 'C1, C2', sealNumberLoading: 'SL-20260210-005', sealNumberDelivery: 'SD-20260210-005', markerType: 'EPRA Molecular Marker', markerConcentration: '15.1 ppm', markerBatchNo: 'MBN-2026-0091', temperature: '29.5°C', density: '835.9 kg/m³', loadingTicket: 'LT-2026-00345', expectedDelivery: '2026-02-10 15:45', gpsLoading: '-0.0917, 34.7680', approvedBy: 'Grace Otieno' },
    { id: 'TXN-006', from: 'Nairobi West Depot', to: 'Shell Uhuru Highway', vehicle: 'KBY 890F', status: 'completed', volume: 5500, type: 'Gasoline', date: '2026-02-09', time: '14:30', driver: 'John Mutua', driverLicense: 'DL-2021-034567', transporter: 'KenTrans Logistics Ltd', loadingBay: 'Bay 2', compartment: 'C1, C2, C3', sealNumberLoading: 'SL-20260209-006', sealNumberDelivery: 'SD-20260209-006', markerType: 'EPRA Molecular Marker', markerConcentration: '15.3 ppm', markerBatchNo: 'MBN-2026-0086', temperature: '26.9°C', density: '748.7 kg/m³', loadingTicket: 'LT-2026-00340', expectedDelivery: '2026-02-09 17:30', gpsLoading: '-1.3207, 36.8074', approvedBy: 'Sarah Kimani' },
    { id: 'TXN-007', from: 'Kipevu Oil Storage Facility', to: 'Total Nyali', vehicle: 'KBA 123G', status: 'completed', volume: 5200, type: 'Diesel', date: '2026-02-09', time: '15:15', driver: 'Hassan Omar', driverLicense: 'DL-2023-012345', transporter: 'Coast Fuel Carriers', loadingBay: 'Bay 2', compartment: 'C1, C2', sealNumberLoading: 'SL-20260209-007', sealNumberDelivery: 'SD-20260209-007', markerType: 'EPRA Molecular Marker', markerConcentration: '14.7 ppm', markerBatchNo: 'MBN-2026-0085', temperature: '32.0°C', density: '836.4 kg/m³', loadingTicket: 'LT-2026-00339', expectedDelivery: '2026-02-09 18:15', gpsLoading: '-4.0435, 39.6682', approvedBy: 'John Mwangi' },
    { id: 'TXN-008', from: 'Eldoret Depot', to: 'Engen Rupa Mall', vehicle: 'KCC 456H', status: 'completed', volume: 4000, type: 'Gasoline', date: '2026-02-09', time: '16:00', driver: 'David Cheruiyot', driverLicense: 'DL-2022-067890', transporter: 'Rift Valley Transporters', loadingBay: 'Bay 1', compartment: 'C1, C2', sealNumberLoading: 'SL-20260209-008', sealNumberDelivery: 'SD-20260209-008', markerType: 'EPRA Molecular Marker', markerConcentration: '15.0 ppm', markerBatchNo: 'MBN-2026-0084', temperature: '21.5°C', density: '749.5 kg/m³', loadingTicket: 'LT-2026-00338', expectedDelivery: '2026-02-09 19:00', gpsLoading: '0.5143, 35.2698', approvedBy: 'David Kiplagat' }
  ]);

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
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Fuel Integrity</h1>
        <h2 className="text-xl font-bold text-center text-green-700 mb-6">Management System</h2>
        <div className="space-y-4">
          <button onClick={() => handleLogin('admin')} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">Login as Administrator</button>
          <button onClick={() => handleLogin('operator')} className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition">Login as Depot Operator</button>
          <button onClick={() => handleLogin('station_operator')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Login as Station Operator</button>
          <button disabled className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed opacity-60">Login as Inspector</button>
        </div>
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-gray-500">{appSettings.footerText}</p>
          <p className="text-xs text-gray-500 mt-1">{appSettings.subFooterText}</p>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  const DashboardView = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="text-right">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-semibold text-green-700">{currentUser?.name}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3">National Stock Level</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
            <p className="text-xs text-gray-600">Diesel (L)</p><p className="text-lg font-bold text-blue-600">{stockData.reduce((a, b) => a + b.diesel, 0).toLocaleString()}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-600">
            <p className="text-xs text-gray-600">Gasoline (L)</p><p className="text-lg font-bold text-amber-600">{stockData.reduce((a, b) => a + b.gasoline, 0).toLocaleString()}</p>
          </div>
          <div className="bg-cyan-50 p-3 rounded-lg border-l-4 border-cyan-600">
            <p className="text-xs text-gray-600">Kerosene (L)</p><p className="text-lg font-bold text-cyan-600">{stockData.reduce((a, b) => a + b.kerosene, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Transactions</p><p className="text-2xl font-bold text-green-600">{transactions.filter(t => t.status === 'in-transit').length}</p></div><Truck className="w-8 h-8 text-green-600" /></div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Completed Today</p><p className="text-2xl font-bold text-yellow-600">{transactions.filter(t => t.status === 'completed').length}</p></div><CheckCircle className="w-8 h-8 text-yellow-600" /></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Incidents</p><p className="text-2xl font-bold text-red-600">{incidents.filter(i => i.status === 'open').length}</p></div><AlertCircle className="w-8 h-8 text-red-600" /></div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Fuel Depots</p><p className="text-2xl font-bold text-indigo-600">{depots.length}</p></div><Building2 className="w-8 h-8 text-indigo-600" /></div>
        </div>
        <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-600">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Fuel Stations</p><p className="text-2xl font-bold text-teal-600">{gasStations.length}</p></div><Store className="w-8 h-8 text-teal-600" /></div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Monthly Inspections</p><p className="text-2xl font-bold text-orange-600">{gasStations.filter(s => { if (!s.inspection) return false; const parts = s.inspection.lastDate.split('/'); const now = new Date(); return parseInt(parts[1]) === now.getMonth() + 1 && parseInt(parts[2]) === now.getFullYear(); }).length}</p></div><Crosshair className="w-8 h-8 text-orange-600" /></div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Market Compliance</p><p className="text-2xl font-bold text-purple-600">{(() => { const inspected = gasStations.filter(s => s.inspection); const passed = inspected.filter(s => s.inspection?.result === 'PASS'); return inspected.length > 0 ? Math.round((passed.length / inspected.length) * 100) : 0; })()}%</p></div><Shield className="w-8 h-8 text-purple-600" /></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Recent Transactions</h3>
        {transactions.slice(0, 3).map(txn => (
          <div key={txn.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div><p className="font-medium text-gray-800">{txn.id}</p><p className="text-sm text-gray-600">{txn.from} → {txn.to}</p></div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${txn.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{txn.status}</span>
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
                <h3 className="font-bold text-lg">Consignment Detail</h3>
                <p className="text-green-100 text-sm">{txn.id}</p>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="text-white hover:text-green-200"><X className="w-6 h-6" /></button>
            </div>
            <div className="mt-3 flex items-center gap-3 bg-white rounded-lg p-3">
              <div className="bg-white p-2 rounded-lg flex-shrink-0">
                <QRCodeSVG
                  value={JSON.stringify({
                    transactionId: txn.id,
                    from: txn.from,
                    to: txn.to,
                    volume: txn.volume,
                    type: txn.type,
                    vehicle: txn.vehicle,
                    sealNumber: txn.sealNumberLoading,
                    markerBatchNo: txn.markerBatchNo,
                    loadingTicket: txn.loadingTicket,
                    expectedDelivery: txn.expectedDelivery,
                  })}
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
          </div>
          <div className="p-4 space-y-4">
            {/* Status Banner */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${txn.status === 'completed' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              {txn.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-yellow-600" />}
              <span className={`font-semibold text-sm ${txn.status === 'completed' ? 'text-green-800' : 'text-yellow-800'}`}>{txn.status === 'completed' ? 'Transfer Completed' : 'In Transit'}</span>
            </div>

            {/* Confirm Delivery Button for in-transit consignments */}
            {txn.status === 'in-transit' && (
              <button
                onClick={() => handleConfirmDeliveryFromDetail(txn.id)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <ClipboardCheck className="w-5 h-5" />
                Confirm Delivery
              </button>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setDetailTab('details')} className={`flex-1 py-2 rounded-md font-semibold transition text-sm ${detailTab === 'details' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>Details</button>
              <button onClick={() => setDetailTab('transport')} className={`flex-1 py-2 rounded-md font-semibold transition text-sm ${detailTab === 'transport' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>Transport Details</button>
            </div>

            {detailTab === 'details' && (
              <>
                {/* Transfer Route */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Transfer Route</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Source Depot</p>
                      <p className="font-semibold text-sm text-gray-800">{txn.from}</p>
                    </div>
                    <div className="text-green-600 font-bold text-lg">&rarr;</div>
                    <div className="flex-1 text-center">
                      <Store className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Destination</p>
                      <p className="font-semibold text-sm text-gray-800">{txn.to}</p>
                    </div>
                  </div>
                </div>

                {/* Fuel & Loading Information */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Fuel & Loading Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Product Type</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                    <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Volume Loaded</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Temperature</p><p className="font-semibold text-gray-800">{txn.temperature}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Density</p><p className="font-semibold text-gray-800">{txn.density}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Loading Bay</p><p className="font-semibold text-gray-800">{txn.loadingBay}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Compartment(s)</p><p className="font-semibold text-gray-800">{txn.compartment}</p></div>
                  </div>
                </div>

                {/* Fuel Marking Details */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Fuel Marking Details</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Marker Type</span><span className="font-semibold text-sm text-gray-800">{txn.markerType}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Batch Number</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.markerBatchNo}</span></div>
                  </div>
                </div>

                {/* Seal Numbers */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Seal Numbers</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg"><p className="text-xs text-gray-500">Loading Seal</p><p className="font-semibold text-sm text-gray-800 font-mono">{txn.sealNumberLoading}</p></div>
                  </div>
                </div>
              </>
            )}

            {detailTab === 'transport' && (
              <>
                {/* Transport Details */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Vehicle & Driver</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Vehicle</span><span className="font-semibold text-sm text-gray-800">{txn.vehicle}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Driver</span><span className="font-semibold text-sm text-gray-800">{txn.driver}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Driver License</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.driverLicense}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Transporter</span><span className="font-semibold text-sm text-gray-800">{txn.transporter}</span></div>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Schedule</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Loading Datetime</span><span className="font-semibold text-sm text-gray-800">{txn.date} {txn.time}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Expected Delivery</span><span className="font-semibold text-sm text-gray-800">{txn.expectedDelivery}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Loading Ticket</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.loadingTicket}</span></div>
                    <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">GPS at Loading</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.gpsLoading}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Approved By</span><span className="font-semibold text-sm text-gray-800">{txn.approvedBy}</span></div>
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
              <h3 className="font-bold text-xl">Delivery Registered</h3>
              <p className="text-green-100 mt-1">Transaction {txn.id} confirmed</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-500">Transaction ID</p><p className="font-semibold text-gray-800">{txn.id}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><p className="font-semibold text-green-700">Delivered</p></div>
                  <div><p className="text-xs text-gray-500">Volume</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                  <div><p className="text-xs text-gray-500">Product</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Delivered To</p><p className="font-semibold text-gray-800">{txn.to}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Confirmed At</p><p className="font-semibold text-gray-800">{scanTime.toLocaleString()}</p></div>
                </div>
              </div>
              <button onClick={() => { setDeliveryRegistration(null); setDeliveryConfirmed(false); }} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">Done</button>
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
                <h3 className="font-bold text-lg">Register Delivery</h3>
                <p className="text-yellow-100 text-sm">{txn.id} — Confirm Receipt</p>
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
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Transfer Route</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                  <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Source Depot</p>
                  <p className="font-semibold text-sm text-gray-800">{txn.from}</p>
                </div>
                <div className="text-green-600 font-bold text-lg">→</div>
                <div className="flex-1 text-center">
                  <Store className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="font-semibold text-sm text-gray-800">{txn.to}</p>
                </div>
              </div>
            </div>

            {/* Consignment Details */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Consignment Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Product Type</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Volume Loaded</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Vehicle</p><p className="font-semibold text-gray-800">{txn.vehicle}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Driver</p><p className="font-semibold text-gray-800">{txn.driver}</p></div>
              </div>
            </div>

            {/* Seal & Marker Verification */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Seal & Marker Verification</h4>
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Loading Seal Number</p>
                  <p className="font-semibold text-sm text-gray-800 font-mono">{txn.sealNumberLoading}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Marker Batch</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.markerBatchNo}</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Loading Ticket</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.loadingTicket}</span></div>
                </div>
              </div>
            </div>

            {/* Scan Metadata */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Scan Metadata</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between border-b pb-2"><span className="text-gray-600">Scanned At</span><span className="font-semibold text-gray-800">{scanTime.toLocaleString()}</span></div>
                <div className="flex items-center justify-between border-b pb-2"><span className="text-gray-600">Expected Delivery</span><span className="font-semibold text-gray-800">{txn.expectedDelivery}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Received By</span><span className="font-semibold text-gray-800">{currentUser?.name}</span></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleConfirmDelivery} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <ClipboardCheck className="w-5 h-5" />Confirm Delivery
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
                <h3 className="font-bold text-lg">Consignment Detail</h3>
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

            {/* Transfer Route */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Transfer Route</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                  <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Source Depot</p>
                  <p className="font-semibold text-sm text-gray-800">{txn.from}</p>
                </div>
                <div className="text-green-600 font-bold text-lg">→</div>
                <div className="flex-1 text-center">
                  <Store className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="font-semibold text-sm text-gray-800">{txn.to}</p>
                </div>
              </div>
            </div>

            {/* Consignment Details */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Consignment Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Product Type</p><p className="font-semibold text-gray-800">{txn.type}</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Volume Loaded</p><p className="font-semibold text-gray-800">{txn.volume.toLocaleString()} L</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Temperature</p><p className="font-semibold text-gray-800">{txn.temperature}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Density</p><p className="font-semibold text-gray-800">{txn.density}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Loading Bay</p><p className="font-semibold text-gray-800">{txn.loadingBay}</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Compartment(s)</p><p className="font-semibold text-gray-800">{txn.compartment}</p></div>
              </div>
            </div>

            {/* Transport Details */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Transport Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Vehicle</span><span className="font-semibold text-sm text-gray-800">{txn.vehicle}</span></div>
                <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Driver</span><span className="font-semibold text-sm text-gray-800">{txn.driver}</span></div>
                <div className="flex items-center justify-between border-b pb-2"><span className="text-sm text-gray-600">Driver License</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.driverLicense}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Transporter</span><span className="font-semibold text-sm text-gray-800">{txn.transporter}</span></div>
              </div>
            </div>

            {/* Seal & Marker */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Seal & Marker Details</h4>
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Loading Seal</p>
                  <p className="font-semibold text-sm text-gray-800 font-mono">{txn.sealNumberLoading}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Marker Batch</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.markerBatchNo}</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Loading Ticket</span><span className="font-semibold text-sm text-gray-800 font-mono">{txn.loadingTicket}</span></div>
                </div>
              </div>
            </div>

            {/* Timing */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Schedule</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between border-b pb-2"><span className="text-gray-600">Loading Date</span><span className="font-semibold text-gray-800">{txn.date} {txn.time}</span></div>
                <div className="flex items-center justify-between border-b pb-2"><span className="text-gray-600">Expected Delivery</span><span className="font-semibold text-gray-800">{txn.expectedDelivery}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Approved By</span><span className="font-semibold text-gray-800">{txn.approvedBy}</span></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleConfirmTransitLoad} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <ClipboardCheck className="w-5 h-5" />Confirm Departure
              </button>
              <button onClick={handleCloseTransitLoad} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700">Cancel</button>
            </div>
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
                <h3 className="font-bold text-lg">Confirm Delivery</h3>
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
              <div className="flex justify-between"><span className="text-gray-600">Scanned At</span><span className="font-semibold text-gray-800">{scanTime.toLocaleString()}</span></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <ClipboardCheck className="w-5 h-5" />Confirm Delivery
              </button>
              <button onClick={() => setScanDeliveryConfirm(null)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── SCT ──
  const SCTView = () => (
    <div className="p-4 space-y-4">
      <SCTLoadingDetailModal />
      <DeliveryRegistrationModal />
      <TransitLoadRegistrationModal />
      <ScanDeliveryConfirmModal />
      <h2 className="text-2xl font-bold text-gray-800">Secure Custody Transfer</h2>

      {/* License Plate Consignment Lookup */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Truck className="w-5 h-5 text-green-600" />Load Consignment</h3>
        <p className="text-sm text-gray-500 mb-3">Enter the truck license plate number or scan the QR code to load a consignment.</p>
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
            className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Scan className="w-5 h-5" />
            Search
          </button>
          <button
            onClick={() => startCameraScanner('consignment')}
            disabled={licensePlateLoading}
            className="bg-yellow-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Scan QR
          </button>
        </div>
        {licensePlateLoading && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-blue-800">Loading Consignment ...</span>
          </div>
        )}
        {licensePlateError && (
          <div className="mt-3 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{licensePlateError}</p>
              <button onClick={() => setLicensePlateError(null)} className="mt-1 text-xs text-red-600 hover:text-red-800 underline">Dismiss</button>
            </div>
          </div>
        )}
      </div>
      {scannerError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 mb-1">Scan Error</p>
              <p className="text-sm text-red-700">{scannerError}</p>
              <button onClick={() => setScannerError(null)} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">Dismiss</button>
            </div>
          </div>
        </div>
      )}
      {scannedData && !scannerError && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-2">QR Code Scanned Successfully</p>
              <div className="bg-white p-3 rounded text-xs overflow-auto mb-3"><pre className="text-gray-700">{scannedData}</pre></div>
              <div className="flex gap-2">
                <button onClick={() => { setScannedData(null); alert('Transaction confirmed successfully!'); }} className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">Confirm</button>
                <button onClick={() => setScannedData(null)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Consignments</h3></div>
        {transactions.slice(0, 5).map(txn => (
          <div key={txn.id} className="p-4 border-b last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{txn.id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${txn.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{txn.status}</span>
              </div>
              <button onClick={() => setSelectedTransaction(txn)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition" title="View Details"><Eye className="w-5 h-5" /></button>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{txn.from} → {txn.to}</span></div>
              <div className="flex items-center gap-2"><Truck className="w-4 h-4" /><span>{txn.vehicle} | {txn.volume}L {txn.type}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── INCIDENTS ──
  const IncidentsView = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Incidents & Alerts</h2>
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
                  {inc.status !== 'resolved' && <button className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">Investigate</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
        { param: 'Marker Concentration', standard: '12-18 ppm', measured: insp.result === 'PASS' ? '15.2 ppm' : '8.1 ppm', pass: insp.result === 'PASS' },
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
        <tr><td>Marker Concentration</td><td>12-18 ppm</td><td>${insp.result === 'PASS' ? '15.2 ppm' : '8.1 ppm'}</td><td style="color:${resultColor};font-weight:bold">${insp.result}</td></tr>
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
              <h3 className="font-bold text-lg">Fixed Location Test Report</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintReport} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition" title="Print Report"><Printer className="w-4 h-4" />Print</button>
                <button onClick={generateInspectionPDF} className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition" title="Download PDF"><Download className="w-4 h-4" />PDF</button>
                <button onClick={() => setShowInspectionReport(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-white p-6 rounded border text-left space-y-3">
                <div className="border-b pb-3">
                  <h4 className="font-bold text-lg mb-2">Fixed Location Test Report</h4>
                  <p className="text-sm text-gray-600">Test ID: {selectedLocation.id}-{selectedLocation.inspection.lastDate.replace(/\//g, '')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-600">Station Name</p><p className="font-semibold">{selectedLocation.name}</p></div>
                  <div><p className="text-xs text-gray-600">Operator</p><p className="font-semibold">{selectedLocation.company}</p></div>
                  <div><p className="text-xs text-gray-600">Inspection Date</p><p className="font-semibold">{selectedLocation.inspection.lastDate}</p></div>
                  <div><p className="text-xs text-gray-600">Result</p><p className={`font-bold ${selectedLocation.inspection.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{selectedLocation.inspection.result}</p></div>
                </div>
                {/* Detailed Test Results Table */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Test Results</h4>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">Test Parameter</th>
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">Standard</th>
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">Measured</th>
                        <th className="text-left p-2 border border-gray-200 text-xs font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { param: 'Fuel Marker Presence', standard: 'Detected', measured: selectedLocation.inspection.result === 'PASS' ? 'Detected' : 'Not Detected' },
                        { param: 'Marker Concentration', standard: '12-18 ppm', measured: selectedLocation.inspection.result === 'PASS' ? '15.2 ppm' : '8.1 ppm' },
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
                  <p className={`font-semibold ${selectedLocation.inspection.result === 'PASS' ? 'text-green-800' : 'text-red-800'}`}>Compliance Status: {selectedLocation.inspection.result}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedLocation.inspection.result === 'PASS' ? 'All fuel quality tests meet regulatory standards' : 'Non-compliance detected — corrective action required'}</p>
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
            <button onClick={() => setSelectedLocation(null)} className="flex items-center gap-2 text-blue-600 font-semibold"><X className="w-5 h-5" />{currentView === 'wsm' ? 'Back to Wet Stock Management' : 'Back to Directory'}</button>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex items-start gap-3 mb-4">
                  {selectedLocation.id.startsWith('DEP') ? <Building2 className="w-8 h-8" /> : <Store className="w-8 h-8" />}
                  <div className="flex-1"><h2 className="text-2xl font-bold">{selectedLocation.name}</h2><p className="text-blue-100 text-sm mt-1">{selectedLocation.company}</p></div>
                </div>
                <div className="flex items-center gap-2 text-blue-100 text-sm"><MapPin className="w-4 h-4" /><span>{selectedLocation.location}</span></div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg"><p className="text-xs text-gray-600 mb-1">Current Stock</p><p className="text-2xl font-bold text-blue-600">{selectedLocation.current.toLocaleString()} L</p></div>
                  <div className="bg-green-50 p-4 rounded-lg"><p className="text-xs text-gray-600 mb-1">Capacity</p><p className="text-2xl font-bold text-green-600">{selectedLocation.capacity.toLocaleString()} L</p></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${(selectedLocation.current / selectedLocation.capacity) * 100}%` }} /></div>
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5 text-green-600" />Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3"><Users className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">Contact Person</p><p className="font-semibold text-gray-800">{selectedLocation.contact}</p></div></div>
                    <div className="flex items-start gap-3"><span className="w-5 h-5 text-gray-400 mt-1 text-center">📱</span><div><p className="text-sm text-gray-600">Phone</p><a href={`tel:${selectedLocation.phone}`} className="font-semibold text-blue-600">{selectedLocation.phone}</a></div></div>
                    <div className="flex items-start gap-3"><span className="w-5 h-5 text-gray-400 mt-1 text-center">✉️</span><div><p className="text-sm text-gray-600">Email</p><a href={`mailto:${selectedLocation.email}`} className="font-semibold text-blue-600 text-sm break-all">{selectedLocation.email}</a></div></div>
                    {selectedLocation.website && <div className="flex items-start gap-3"><span className="w-5 h-5 text-gray-400 mt-1 text-center">🌐</span><div><p className="text-sm text-gray-600">Website</p><p className="font-semibold text-blue-600">{selectedLocation.website}</p></div></div>}
                    <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">Coordinates</p><p className="font-semibold text-gray-800 font-mono text-sm">{selectedLocation.coordinates}</p></div></div>
                  </div>
                </div>
                {/* Map */}
                {selectedLocation.coordinates && (() => {
                  const [lat, lng] = selectedLocation.coordinates.split(',').map((c: string) => c.trim());
                  return (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3"><MapPin className="w-5 h-5 text-green-600" />Location Map</h3>
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
                        View larger map
                      </a>
                    </div>
                  );
                })()}
                {!selectedLocation.id.startsWith('DEP') && (
                  <div className="border-t pt-6"><h3 className="font-semibold text-gray-800 mb-2">Supply Depot</h3><div className="bg-gray-50 p-3 rounded"><p className="text-sm text-gray-600">{depots.find(d => d.id === selectedLocation.depot)?.name || 'N/A'}</p></div></div>
                )}
                {!selectedLocation.id.startsWith('DEP') && selectedLocation.inspection && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-green-600" />Inspection</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded"><p className="text-xs text-gray-600">Date of Last Inspection</p><p className="font-semibold text-gray-800">{selectedLocation.inspection.lastDate}</p></div>
                        <div className={`p-3 rounded border-l-4 ${selectedLocation.inspection.result === 'PASS' ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'}`}><p className="text-xs text-gray-600 mb-1">Result</p><p className={`font-bold text-lg ${selectedLocation.inspection.result === 'PASS' ? 'text-green-700' : 'text-red-700'}`}>{selectedLocation.inspection.result}</p></div>
                      </div>
                      <button onClick={() => setShowInspectionReport(true)} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"><FileText className="w-5 h-5" />View Inspection Results</button>
                      <a href={selectedLocation.inspection.footage} target="_blank" rel="noopener noreferrer" className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 block text-center">
                        <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        Watch Inspection Footage
                      </a>
                    </div>
                  </div>
                )}
                {!selectedLocation.id.startsWith('DEP') && !selectedLocation.inspection && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" />Inspection</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-gray-500 text-sm">No inspection records available for this station</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800">{currentView === 'wsm' ? 'Wet Stock Management' : 'Location Directory'}</h2>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewType('depots')} className={`flex-1 py-2 rounded-md font-semibold transition ${viewType === 'depots' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>Depots ({depots.length})</button>
              <button onClick={() => setViewType('stations')} className={`flex-1 py-2 rounded-md font-semibold transition ${viewType === 'stations' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}>Stations ({gasStations.length})</button>
            </div>
            <div className="space-y-3">
              {viewType === 'depots' ? depots.map(d => (
                <div key={d.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{d.name}</h3>
                        <button onClick={() => setSelectedLocation(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition flex-shrink-0" title="View Details"><ChevronRight className="w-5 h-5" /></button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{d.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><MapPin className="w-3 h-3" /><span>{d.location}</span></div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">Stock: </span><span className="font-semibold">{d.current.toLocaleString()} L</span></div>
                        <div><span className="text-gray-600">Capacity: </span><span className="font-semibold">{d.capacity.toLocaleString()} L</span></div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(d.current / d.capacity) * 100}%` }} /></div>
                    </div>
                  </div>
                </div>
              )) : gasStations.map(s => (
                <div key={s.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
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
                          <button onClick={() => setSelectedLocation(s)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition" title="View Details"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{s.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><MapPin className="w-3 h-3" /><span>{s.location}</span></div>
                      {s.inspection && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><FileText className="w-3 h-3" /><span>Last inspection: {s.inspection.lastDate}</span></div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">Stock: </span><span className="font-semibold">{s.current.toLocaleString()} L</span></div>
                        <div><span className="text-gray-600">Capacity: </span><span className="font-semibold">{s.capacity.toLocaleString()} L</span></div>
                      </div>
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
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'current-stock', icon: Fuel, color: 'text-blue-600', title: 'Current Stock Levels', desc: 'Live fuel stock at each monitored location' },
            { id: 'historical', icon: TrendingUp, color: 'text-green-600', title: 'Historical Stock Levels', desc: 'Stock levels at any given date with trends' },
            { id: 'custody-flow', icon: Truck, color: 'text-orange-600', title: 'Custody Flow Report', desc: 'Incoming & outgoing fuel flows at each custody change' },
            { id: 'balance', icon: Activity, color: 'text-purple-600', title: 'Stock Balance Calculator', desc: 'Automated balance calculation across the supply chain' },
            { id: 'volume', icon: BarChart3, color: 'text-red-600', title: 'Volume Levels Report', desc: 'Fuel volumes by location and time period' },
            { id: 'discrepancy', icon: AlertTriangle, color: 'text-amber-600', title: 'Discrepancy & Leakage Report', desc: 'Highlighting discrepancies, leakages, or theft' },
            { id: 'risk-profile', icon: Shield, color: 'text-indigo-600', title: 'Risk Profiling Report', desc: 'Risk profiling for each monitored location' },
            { id: 'high-risk', icon: Target, color: 'text-rose-600', title: 'High-Risk Zones & Operators', desc: 'Identification of high-risk zones and operators' },
            { id: 'enforcement', icon: Crosshair, color: 'text-teal-600', title: 'Enforcement Planning', desc: 'Targeted enforcement planning based on risk indicators' },
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
        <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-blue-600 font-semibold"><X className="w-5 h-5" />Back to Reports</button>

        {/* ── CURRENT STOCK LEVELS ── */}
        {activeReport === 'current-stock' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Current Stock Levels</h3>
              <p className="text-sm text-gray-500 mb-4">Live fuel stock at each monitored location</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Current Stock</p><p className="text-lg font-bold text-blue-600">{stockData.reduce((a, b) => a + b.current, 0).toLocaleString()} L</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Total Capacity</p><p className="text-lg font-bold text-green-600">{stockData.reduce((a, b) => a + b.capacity, 0).toLocaleString()} L</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Avg Utilization</p><p className="text-lg font-bold text-yellow-600">{(stockData.reduce((a, b) => a + (b.current / b.capacity), 0) / stockData.length * 100).toFixed(1)}%</p></div>
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Locations Monitored</p><p className="text-lg font-bold text-red-600">{stockData.length}</p></div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Stock vs Capacity</h4>
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">Historical Stock Levels</h3>
              <p className="text-sm text-gray-500 mb-4">View stock levels at any given date</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Select Date</label>
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">Custody Flow Report</h3>
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">Risk Profiling Report</h3>
              <p className="text-sm text-gray-500 mb-4">Composite risk assessment for each monitored location</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Critical Risk</p><p className="text-lg font-bold text-red-600">{riskProfiles.filter(r => r.riskLevel === 'Critical').length} locations</p></div>
                <div className="bg-orange-50 p-3 rounded-lg"><p className="text-xs text-gray-600">High Risk</p><p className="text-lg font-bold text-orange-600">{riskProfiles.filter(r => r.riskLevel === 'High').length} locations</p></div>
                <div className="bg-indigo-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Avg Risk Score</p><p className="text-lg font-bold text-indigo-600">{Math.round(riskProfiles.reduce((a, b) => a + b.riskScore, 0) / riskProfiles.length)}/100</p></div>
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">High-Risk Zones & Operators</h3>
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">Enforcement Planning</h3>
              <p className="text-sm text-gray-500 mb-4">Targeted enforcement actions based on risk indicators</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Critical Priority</p><p className="text-lg font-bold text-red-600">{enforcementPlan.filter(e => e.priority === 1).length} locations</p></div>
                <div className="bg-orange-50 p-3 rounded-lg"><p className="text-xs text-gray-600">High Priority</p><p className="text-lg font-bold text-orange-600">{enforcementPlan.filter(e => e.priority === 2).length} locations</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Medium Priority</p><p className="text-lg font-bold text-yellow-600">{enforcementPlan.filter(e => e.priority === 3).length} locations</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs text-gray-600">Routine</p><p className="text-lg font-bold text-green-600">{enforcementPlan.filter(e => e.priority === 4).length} locations</p></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Enforcement Strategy</p>
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
      { key: 'admin', label: 'Administrator' },
      { key: 'operator', label: 'Depto Operator' },
      { key: 'station_operator', label: 'Station Operator' },
      { key: 'inspector', label: 'Field Inspector' },
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
          <h2 className="text-lg font-bold text-gray-800">Profile Access Management</h2>
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
          <h2 className="text-lg font-bold text-gray-800">App Settings</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Title</label>
            <input
              type="text"
              value={localSettings.appTitle}
              onChange={e => setLocalSettings({ ...localSettings, appTitle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Subtitle</label>
            <input
              type="text"
              value={localSettings.appSubtitle}
              onChange={e => setLocalSettings({ ...localSettings, appSubtitle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <input
              type="text"
              value={localSettings.footerText}
              onChange={e => setLocalSettings({ ...localSettings, footerText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-footer Text</label>
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
            Save Settings
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
      { view: 'dashboard', icon: Home, label: 'Home' },
      { view: 'sct', icon: Truck, label: 'SCT' },
      { view: 'wsm', icon: Package, label: 'WSM' },
      { view: 'incidents', icon: AlertCircle, label: 'Alerts' },
      { view: 'reports', icon: BarChart3, label: 'Reports' },
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
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-lg">Main Menu</h2><p className="text-xs text-green-100">{currentUser?.name}</p></div><button onClick={() => setMenuOpen(false)}><X className="w-6 h-6" /></button></div>
        </div>
        <div className="p-4 space-y-2">
          <button onClick={() => { setCurrentView('profiles'); setMenuOpen(false); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3"><Users className="w-5 h-5 text-green-600" /><span>Profile</span></button>
          <button onClick={() => { setCurrentView('settings'); setMenuOpen(false); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3"><Settings className="w-5 h-5 text-green-600" /><span>Settings</span></button>
          <button onClick={handleLogout} className="w-full text-left p-3 rounded hover:bg-red-50 flex items-center gap-3 text-red-600"><X className="w-5 h-5" /><span>Logout</span></button>
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
              <h3 className="font-semibold">Scan {scanType === 'consignment' ? 'Consignment' : scanType === 'delivery' ? 'Delivery' : 'Loading'} QR Code</h3>
              <p className="text-xs text-gray-400 mt-0.5">Point camera at the consignment QR code</p>
            </div>
            <button onClick={stopCamera} className="text-white bg-gray-700 rounded-full p-2 hover:bg-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <div id={scannerContainerRef.current} className="w-full h-full" />
            {scannerError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-6">
                <div className="bg-white rounded-lg p-6 text-center max-w-sm">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-800 font-semibold mb-2">Camera Access Required</p>
                  <p className="text-sm text-gray-600 mb-4">{scannerError}</p>
                  <button onClick={stopCamera} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700">Close</button>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-900 text-center">
            <p className="text-sm text-gray-400">{scanType === 'consignment' ? 'Scan the QR code to load consignment' : scanType === 'delivery' ? 'Scan the loading transaction QR to register delivery' : 'Scan the QR code on the loading ticket'}</p>
          </div>
        </div>
      )}

      {currentView === 'dashboard' && hasAccess('dashboard') && <DashboardView />}
      {currentView === 'sct' && hasAccess('sct') && <SCTView />}
      {currentView === 'wsm' && hasAccess('wsm') && <DirectoryView />}
      {currentView === 'incidents' && hasAccess('incidents') && <IncidentsView />}
      {currentView === 'reports' && hasAccess('reports') && <ReportsView />}
      {currentView === 'directory' && <DirectoryView />}
      {currentView === 'settings' && <SettingsView />}
      {currentView === 'profiles' && <ProfilesView />}

      <BottomNav />
    </div>
  );
};

export default FuelIntegrityApp;