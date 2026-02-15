-- CreateTable
CREATE TABLE "Depot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "current" INTEGER NOT NULL,
    "contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL DEFAULT '',
    "coordinates" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Depot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GasStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "current" INTEGER NOT NULL,
    "contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "depotId" TEXT,
    "coordinates" TEXT NOT NULL,
    "inspectionLastDate" TEXT,
    "inspectionResult" TEXT,
    "inspectionFootage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GasStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "from_location" TEXT NOT NULL,
    "to_location" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "driver_license" TEXT NOT NULL,
    "transporter" TEXT NOT NULL,
    "loading_bay" TEXT NOT NULL,
    "compartment" TEXT NOT NULL,
    "seal_number_loading" TEXT NOT NULL,
    "seal_number_delivery" TEXT NOT NULL,
    "marker_type" TEXT NOT NULL,
    "marker_concentration" TEXT NOT NULL,
    "marker_batch_no" TEXT NOT NULL,
    "temperature" TEXT NOT NULL,
    "density" TEXT NOT NULL,
    "loading_ticket" TEXT NOT NULL,
    "expected_delivery" TEXT NOT NULL,
    "gps_loading" TEXT NOT NULL,
    "approved_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockData" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "opening" INTEGER NOT NULL,
    "current" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "receipts" INTEGER NOT NULL,
    "withdrawals" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "diesel" INTEGER NOT NULL,
    "gasoline" INTEGER NOT NULL,
    "kerosene" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assigned_to" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockData_location_key" ON "StockData"("location");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "GasStation" ADD CONSTRAINT "GasStation_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "Depot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
