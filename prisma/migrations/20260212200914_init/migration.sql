-- CreateTable
CREATE TABLE "tblogin" (
    "idLogin" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "societa" TEXT NOT NULL,
    "tecnicocod" TEXT NOT NULL,
    "attivo" TEXT NOT NULL DEFAULT 'S',
    "typeutente" TEXT NOT NULL DEFAULT 'AMMINISTRATORE',
    "colore" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "taboperazioni" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proprietario" TEXT NOT NULL,
    "tipo" INTEGER NOT NULL,
    "stato" INTEGER NOT NULL,
    "descrizione" TEXT,
    "dataCreazione" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataMofifica" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tabclienti" (
    "codice" TEXT NOT NULL PRIMARY KEY,
    "denominazione" TEXT NOT NULL,
    "indirizzo" TEXT,
    "citta" TEXT,
    "provincia" TEXT,
    "cap" TEXT,
    "attivo" TEXT NOT NULL DEFAULT 'S',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "tblogin_email_key" ON "tblogin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tabclienti_codice_key" ON "tabclienti"("codice");
