import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.incident.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stockData.deleteMany();
  await prisma.gasStation.deleteMany();
  await prisma.depot.deleteMany();
  await prisma.user.deleteMany();

  // Seed Depots
  const depots = [
    { id: 'DEP-001', name: 'Kipevu Oil Storage Facility', location: 'Mombasa, Coast', company: 'Kenya Pipeline Company', capacity: 450000, current: 385000, contact: 'John Mwangi', phone: '+254 722 123456', email: 'j.mwangi@kpc.co.ke', website: 'www.kpc.co.ke', coordinates: '-4.0435, 39.6682' },
    { id: 'DEP-002', name: 'Nairobi West Depot', location: 'Nairobi, Nairobi County', company: 'Total Energies Kenya', capacity: 320000, current: 275000, contact: 'Sarah Kimani', phone: '+254 733 234567', email: 's.kimani@totalenergies.co.ke', website: 'www.totalenergies.co.ke', coordinates: '-1.3207, 36.8074' },
    { id: 'DEP-003', name: 'Eldoret Depot', location: 'Eldoret, Uasin Gishu County', company: 'Vivo Energy Kenya (Shell)', capacity: 180000, current: 152000, contact: 'David Kiplagat', phone: '+254 744 345678', email: 'd.kiplagat@shell.co.ke', website: 'www.shell.co.ke', coordinates: '0.5143, 35.2698' },
    { id: 'DEP-004', name: 'Kisumu Depot', location: 'Kisumu, Kisumu County', company: 'Rubis Energy Kenya', capacity: 150000, current: 128000, contact: 'Grace Otieno', phone: '+254 755 456789', email: 'g.otieno@rubis.co.ke', website: 'www.rubisenergy.co.ke', coordinates: '-0.0917, 34.7680' },
  ];
  for (const depot of depots) {
    await prisma.depot.create({ data: depot });
  }
  console.log(`  Seeded ${depots.length} depots`);

  // Seed Gas Stations
  const gasStations = [
    { id: 'STN-001', name: 'Total Westlands', location: 'Westlands, Nairobi', company: 'Total Energies Kenya', capacity: 45000, current: 38000, contact: 'Peter Kariuki', phone: '+254 720 111222', email: 'westlands@totalenergies.co.ke', depotId: 'DEP-002', coordinates: '-1.2641, 36.8047', inspectionLastDate: '03/02/2026', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-002', name: 'Shell Uhuru Highway', location: 'CBD, Nairobi', company: 'Vivo Energy Kenya (Shell)', capacity: 50000, current: 42000, contact: 'Mary Wanjiru', phone: '+254 721 222333', email: 'uhuru@shell.co.ke', depotId: 'DEP-002', coordinates: '-1.2864, 36.8172', inspectionLastDate: '05/02/2026', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-003', name: 'Rubis Kilimani', location: 'Kilimani, Nairobi', company: 'Rubis Energy Kenya', capacity: 40000, current: 35000, contact: 'James Odhiambo', phone: '+254 722 333444', email: 'kilimani@rubis.co.ke', depotId: 'DEP-002', coordinates: '-1.2901, 36.7828' },
    { id: 'STN-004', name: 'Engen Karen', location: 'Karen, Nairobi', company: 'Engen Kenya', capacity: 38000, current: 32000, contact: 'Anne Muthoni', phone: '+254 723 444555', email: 'karen@engen.co.ke', depotId: 'DEP-002', coordinates: '-1.3197, 36.7076', inspectionLastDate: '07/02/2026', inspectionResult: 'FAIL', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-005', name: 'Total Nyali', location: 'Nyali, Mombasa', company: 'Total Energies Kenya', capacity: 42000, current: 36000, contact: 'Ali Hassan', phone: '+254 724 555666', email: 'nyali@totalenergies.co.ke', depotId: 'DEP-001', coordinates: '-4.0435, 39.7196', inspectionLastDate: '10/02/2026', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-006', name: 'Shell Moi Avenue', location: 'CBD, Mombasa', company: 'Vivo Energy Kenya (Shell)', capacity: 48000, current: 40000, contact: 'Fatuma Mohamed', phone: '+254 725 666777', email: 'moiave@shell.co.ke', depotId: 'DEP-001', coordinates: '-4.0435, 39.6682', inspectionLastDate: '12/02/2026', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-007', name: 'Rubis Oginga Odinga', location: 'Kisumu Central', company: 'Rubis Energy Kenya', capacity: 35000, current: 30000, contact: 'Michael Omondi', phone: '+254 726 777888', email: 'kisumu@rubis.co.ke', depotId: 'DEP-004', coordinates: '-0.0917, 34.7680' },
    { id: 'STN-008', name: 'Total Milimani', location: 'Milimani, Kisumu', company: 'Total Energies Kenya', capacity: 38000, current: 33000, contact: 'Lucy Achieng', phone: '+254 727 888999', email: 'milimani@totalenergies.co.ke', depotId: 'DEP-004', coordinates: '-0.1022, 34.7617', inspectionLastDate: '29/11/2022', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-009', name: 'Shell Uganda Road', location: 'Eldoret Town', company: 'Vivo Energy Kenya (Shell)', capacity: 40000, current: 35000, contact: 'Daniel Kiptoo', phone: '+254 728 999000', email: 'eldoret@shell.co.ke', depotId: 'DEP-003', coordinates: '0.5143, 35.2698', inspectionLastDate: '02/02/2026', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-010', name: 'Engen Rupa Mall', location: 'Eldoret', company: 'Engen Kenya', capacity: 36000, current: 31000, contact: 'Ruth Chebet', phone: '+254 729 000111', email: 'rupa@engen.co.ke', depotId: 'DEP-003', coordinates: '0.5201, 35.2817', inspectionLastDate: '08/02/2026', inspectionResult: 'FAIL', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-011', name: 'Total Kenyatta Avenue', location: 'Nakuru Town', company: 'Total Energies Kenya', capacity: 37000, current: 32000, contact: 'Simon Kamau', phone: '+254 730 111222', email: 'nakuru@totalenergies.co.ke', depotId: 'DEP-002', coordinates: '-0.3031, 36.0800' },
    { id: 'STN-012', name: 'Rubis Lanet', location: 'Lanet, Nakuru', company: 'Rubis Energy Kenya', capacity: 34000, current: 29000, contact: 'Elizabeth Wambui', phone: '+254 731 222333', email: 'lanet@rubis.co.ke', depotId: 'DEP-002', coordinates: '-0.2827, 36.0983', inspectionLastDate: '12/12/2022', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-013', name: 'Shell Thika Road', location: 'Thika', company: 'Vivo Energy Kenya (Shell)', capacity: 39000, current: 34000, contact: 'Patrick Njenga', phone: '+254 732 333444', email: 'thika@shell.co.ke', depotId: 'DEP-002', coordinates: '-1.0332, 37.0692', inspectionLastDate: '08/01/2023', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
    { id: 'STN-014', name: 'Total Blue Post', location: 'Thika Town', company: 'Total Energies Kenya', capacity: 35000, current: 30000, contact: 'Jane Njeri', phone: '+254 733 444555', email: 'bluepost@totalenergies.co.ke', depotId: 'DEP-002', coordinates: '-1.0369, 37.0903' },
    { id: 'STN-015', name: 'Engen Meru', location: 'Meru Town', company: 'Engen Kenya', capacity: 33000, current: 28000, contact: 'Francis Mwiti', phone: '+254 734 555666', email: 'meru@engen.co.ke', depotId: 'DEP-002', coordinates: '0.0469, 37.6497', inspectionLastDate: '20/12/2022', inspectionResult: 'PASS', inspectionFootage: 'https://www.youtube.com/watch?v=43q_b26iWPE' },
  ];
  for (const station of gasStations) {
    await prisma.gasStation.create({ data: station });
  }
  console.log(`  Seeded ${gasStations.length} gas stations`);

  // Seed Transactions
  const transactions = [
    { id: 'TXN-001', fromLocation: 'Nairobi West Depot', toLocation: 'Total Westlands', vehicle: 'KCA 123A', status: 'in-transit', volume: 5000, fuelType: 'Diesel', date: '2026-02-10', time: '08:30', driver: 'Joseph Kimani', driverLicense: 'DL-2023-045891', transporter: 'KenTrans Logistics Ltd', loadingBay: 'Bay 3', compartment: 'C1, C2', sealNumberLoading: 'SL-20260210-001', sealNumberDelivery: 'SD-20260210-001', markerType: 'EPRA Molecular Marker', markerConcentration: '15.2 ppm', markerBatchNo: 'MBN-2026-0087', temperature: '28.4°C', density: '835.6 kg/m³', loadingTicket: 'LT-2026-00341', expectedDelivery: '2026-02-10 12:30', gpsLoading: '-1.3207, 36.8074', approvedBy: 'Sarah Kimani' },
    { id: 'TXN-002', fromLocation: 'Kipevu Oil Storage Facility', toLocation: 'Shell Moi Avenue', vehicle: 'KBZ 456B', status: 'completed', volume: 6000, fuelType: 'Gasoline', date: '2026-02-10', time: '09:15', driver: 'Ahmed Ali', driverLicense: 'DL-2022-032567', transporter: 'Coast Fuel Carriers', loadingBay: 'Bay 1', compartment: 'C1, C2, C3', sealNumberLoading: 'SL-20260210-002', sealNumberDelivery: 'SD-20260210-002', markerType: 'EPRA Molecular Marker', markerConcentration: '14.8 ppm', markerBatchNo: 'MBN-2026-0088', temperature: '31.2°C', density: '748.3 kg/m³', loadingTicket: 'LT-2026-00342', expectedDelivery: '2026-02-10 13:15', gpsLoading: '-4.0435, 39.6682', approvedBy: 'John Mwangi' },
    { id: 'TXN-003', fromLocation: 'Eldoret Depot', toLocation: 'Shell Uganda Road', vehicle: 'KCD 789C', status: 'completed', volume: 4500, fuelType: 'Diesel', date: '2026-02-10', time: '10:00', driver: 'Samuel Korir', driverLicense: 'DL-2021-078234', transporter: 'Rift Valley Transporters', loadingBay: 'Bay 2', compartment: 'C1, C2', sealNumberLoading: 'SL-20260210-003', sealNumberDelivery: 'SD-20260210-003', markerType: 'EPRA Molecular Marker', markerConcentration: '15.0 ppm', markerBatchNo: 'MBN-2026-0089', temperature: '22.1°C', density: '836.1 kg/m³', loadingTicket: 'LT-2026-00343', expectedDelivery: '2026-02-10 14:00', gpsLoading: '0.5143, 35.2698', approvedBy: 'David Kiplagat' },
    { id: 'TXN-004', fromLocation: 'Nairobi West Depot', toLocation: 'Rubis Kilimani', vehicle: 'KAA 234D', status: 'in-transit', volume: 4000, fuelType: 'Gasoline', date: '2026-02-10', time: '11:20', driver: 'Paul Njoroge', driverLicense: 'DL-2023-056789', transporter: 'SafeHaul Kenya Ltd', loadingBay: 'Bay 1', compartment: 'C1', sealNumberLoading: 'SL-20260210-004', sealNumberDelivery: 'SD-20260210-004', markerType: 'EPRA Molecular Marker', markerConcentration: '14.9 ppm', markerBatchNo: 'MBN-2026-0090', temperature: '27.8°C', density: '749.1 kg/m³', loadingTicket: 'LT-2026-00344', expectedDelivery: '2026-02-10 13:20', gpsLoading: '-1.3207, 36.8074', approvedBy: 'Sarah Kimani' },
    { id: 'TXN-005', fromLocation: 'Kisumu Depot', toLocation: 'Rubis Oginga Odinga', vehicle: 'KCB 567E', status: 'completed', volume: 3500, fuelType: 'Diesel', date: '2026-02-10', time: '12:45', driver: 'Tom Ochieng', driverLicense: 'DL-2022-089012', transporter: 'Lake Basin Logistics', loadingBay: 'Bay 1', compartment: 'C1, C2', sealNumberLoading: 'SL-20260210-005', sealNumberDelivery: 'SD-20260210-005', markerType: 'EPRA Molecular Marker', markerConcentration: '15.1 ppm', markerBatchNo: 'MBN-2026-0091', temperature: '29.5°C', density: '835.9 kg/m³', loadingTicket: 'LT-2026-00345', expectedDelivery: '2026-02-10 15:45', gpsLoading: '-0.0917, 34.7680', approvedBy: 'Grace Otieno' },
    { id: 'TXN-006', fromLocation: 'Nairobi West Depot', toLocation: 'Shell Uhuru Highway', vehicle: 'KBY 890F', status: 'completed', volume: 5500, fuelType: 'Gasoline', date: '2026-02-09', time: '14:30', driver: 'John Mutua', driverLicense: 'DL-2021-034567', transporter: 'KenTrans Logistics Ltd', loadingBay: 'Bay 2', compartment: 'C1, C2, C3', sealNumberLoading: 'SL-20260209-006', sealNumberDelivery: 'SD-20260209-006', markerType: 'EPRA Molecular Marker', markerConcentration: '15.3 ppm', markerBatchNo: 'MBN-2026-0086', temperature: '26.9°C', density: '748.7 kg/m³', loadingTicket: 'LT-2026-00340', expectedDelivery: '2026-02-09 17:30', gpsLoading: '-1.3207, 36.8074', approvedBy: 'Sarah Kimani' },
    { id: 'TXN-007', fromLocation: 'Kipevu Oil Storage Facility', toLocation: 'Total Nyali', vehicle: 'KBA 123G', status: 'completed', volume: 5200, fuelType: 'Diesel', date: '2026-02-09', time: '15:15', driver: 'Hassan Omar', driverLicense: 'DL-2023-012345', transporter: 'Coast Fuel Carriers', loadingBay: 'Bay 2', compartment: 'C1, C2', sealNumberLoading: 'SL-20260209-007', sealNumberDelivery: 'SD-20260209-007', markerType: 'EPRA Molecular Marker', markerConcentration: '14.7 ppm', markerBatchNo: 'MBN-2026-0085', temperature: '32.0°C', density: '836.4 kg/m³', loadingTicket: 'LT-2026-00339', expectedDelivery: '2026-02-09 18:15', gpsLoading: '-4.0435, 39.6682', approvedBy: 'John Mwangi' },
    { id: 'TXN-008', fromLocation: 'Eldoret Depot', toLocation: 'Engen Rupa Mall', vehicle: 'KCC 456H', status: 'completed', volume: 4000, fuelType: 'Gasoline', date: '2026-02-09', time: '16:00', driver: 'David Cheruiyot', driverLicense: 'DL-2022-067890', transporter: 'Rift Valley Transporters', loadingBay: 'Bay 1', compartment: 'C1, C2', sealNumberLoading: 'SL-20260209-008', sealNumberDelivery: 'SD-20260209-008', markerType: 'EPRA Molecular Marker', markerConcentration: '15.0 ppm', markerBatchNo: 'MBN-2026-0084', temperature: '21.5°C', density: '749.5 kg/m³', loadingTicket: 'LT-2026-00338', expectedDelivery: '2026-02-09 19:00', gpsLoading: '0.5143, 35.2698', approvedBy: 'David Kiplagat' },
  ];
  for (const txn of transactions) {
    await prisma.transaction.create({ data: txn });
  }
  console.log(`  Seeded ${transactions.length} transactions`);

  // Seed Stock Data
  const stockData = [
    { location: 'Kipevu Oil Storage Facility', opening: 450000, current: 385000, capacity: 450000, variance: 0.08, receipts: 120000, withdrawals: 185000, losses: 150, company: 'Kenya Pipeline Company', diesel: 185000, gasoline: 135000, kerosene: 65000 },
    { location: 'Nairobi West Depot', opening: 320000, current: 275000, capacity: 320000, variance: 0.11, receipts: 95000, withdrawals: 140000, losses: 120, company: 'Total Energies Kenya', diesel: 130000, gasoline: 100000, kerosene: 45000 },
    { location: 'Eldoret Depot', opening: 180000, current: 152000, capacity: 180000, variance: 0.09, receipts: 42000, withdrawals: 70000, losses: 80, company: 'Vivo Energy Kenya (Shell)', diesel: 72000, gasoline: 55000, kerosene: 25000 },
    { location: 'Kisumu Depot', opening: 150000, current: 128000, capacity: 150000, variance: 0.12, receipts: 38000, withdrawals: 60000, losses: 70, company: 'Rubis Energy Kenya', diesel: 60000, gasoline: 46000, kerosene: 22000 },
    { location: 'Total Westlands', opening: 45000, current: 38000, capacity: 45000, variance: 0.15, receipts: 15000, withdrawals: 22000, losses: 30, company: 'Total Energies Kenya', diesel: 18000, gasoline: 14000, kerosene: 6000 },
    { location: 'Shell Uhuru Highway', opening: 50000, current: 42000, capacity: 50000, variance: 0.13, receipts: 18000, withdrawals: 26000, losses: 25, company: 'Vivo Energy Kenya (Shell)', diesel: 20000, gasoline: 15000, kerosene: 7000 },
    { location: 'Rubis Kilimani', opening: 40000, current: 35000, capacity: 40000, variance: 0.18, receipts: 12000, withdrawals: 17000, losses: 20, company: 'Rubis Energy Kenya', diesel: 16000, gasoline: 13000, kerosene: 6000 },
    { location: 'Total Nyali', opening: 42000, current: 36000, capacity: 42000, variance: 0.10, receipts: 14000, withdrawals: 20000, losses: 15, company: 'Total Energies Kenya', diesel: 17000, gasoline: 13000, kerosene: 6000 },
  ];
  for (const stock of stockData) {
    await prisma.stockData.create({ data: stock });
  }
  console.log(`  Seeded ${stockData.length} stock data entries`);

  // Seed Incidents
  const incidents = [
    { id: 'INC-001', location: 'Rubis Kilimani', type: 'Variance Breach', severity: 'high', timestamp: '2026-02-09 10:30', status: 'open', assignedTo: 'James Odhiambo' },
    { id: 'INC-002', location: 'Total Kenyatta Avenue', type: 'Variance Breach', severity: 'high', timestamp: '2026-02-09 11:15', status: 'open', assignedTo: 'Simon Kamau' },
    { id: 'INC-003', location: 'Shell Moi Avenue', type: 'Delayed Transaction', severity: 'medium', timestamp: '2026-02-09 09:45', status: 'investigating', assignedTo: 'Fatuma Mohamed' },
    { id: 'INC-004', location: 'Total Westlands', type: 'Volume Discrepancy', severity: 'medium', timestamp: '2026-02-08 16:20', status: 'resolved', assignedTo: 'Peter Kariuki' },
    { id: 'INC-005', location: 'Nairobi West Depot', type: 'Sensor Offline', severity: 'low', timestamp: '2026-02-08 14:10', status: 'resolved', assignedTo: 'Sarah Kimani' },
  ];
  for (const incident of incidents) {
    await prisma.incident.create({ data: incident });
  }
  console.log(`  Seeded ${incidents.length} incidents`);

  // Seed Users
  const users = [
    { name: 'Admin User', role: 'admin', email: 'admin@epra.go.ke', password: 'demo' },
    { name: 'Depot Operator', role: 'operator', email: 'operator@epra.go.ke', password: 'demo' },
    { name: 'Station Operator', role: 'station_operator', email: 'station@epra.go.ke', password: 'demo' },
    { name: 'Inspector', role: 'inspector', email: 'inspector@epra.go.ke', password: 'demo' },
  ];
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log(`  Seeded ${users.length} users`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
