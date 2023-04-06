-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "projectPath" TEXT NOT NULL,
    "alloyFile" TEXT NOT NULL,
    "activeTab" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "testFile" TEXT NOT NULL,
    CONSTRAINT "Test_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tab" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectID" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    CONSTRAINT "Tab_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tab_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Canvas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testId" INTEGER NOT NULL,
    "atomCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Canvas_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AtomSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectID" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "isEnum" BOOLEAN NOT NULL DEFAULT false,
    "isLone" BOOLEAN NOT NULL DEFAULT false,
    "isOne" BOOLEAN NOT NULL DEFAULT false,
    "isSome" BOOLEAN NOT NULL DEFAULT false,
    "isAbstract" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL,
    "shape" TEXT NOT NULL DEFAULT 'rectangle',
    CONSTRAINT "AtomSource_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "canvasID" INTEGER NOT NULL,
    "fromID" INTEGER NOT NULL,
    "toID" INTEGER NOT NULL,
    "connLabel" TEXT NOT NULL,
    CONSTRAINT "Connection_canvasID_fkey" FOREIGN KEY ("canvasID") REFERENCES "Canvas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Connection_fromID_fkey" FOREIGN KEY ("fromID") REFERENCES "Atom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Connection_fromID_fkey" FOREIGN KEY ("fromID") REFERENCES "Atom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "canvasID" INTEGER NOT NULL,
    "top" INTEGER NOT NULL,
    "left" INTEGER NOT NULL,
    "srcID" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    CONSTRAINT "Atom_canvasID_fkey" FOREIGN KEY ("canvasID") REFERENCES "Canvas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Atom_srcID_fkey" FOREIGN KEY ("srcID") REFERENCES "AtomSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Predicate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT,
    CONSTRAINT "Predicate_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PredParam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "predID" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "paramType" TEXT NOT NULL,
    "atom" INTEGER,
    CONSTRAINT "PredParam_predID_fkey" FOREIGN KEY ("predID") REFERENCES "Predicate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "multiplicity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fromLabel" TEXT NOT NULL,
    "toLabel" TEXT NOT NULL,
    CONSTRAINT "Relation_fromLabel_fkey" FOREIGN KEY ("fromLabel") REFERENCES "AtomSource" ("label") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_toLabel_fkey" FOREIGN KEY ("toLabel") REFERENCES "AtomSource" ("label") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_children" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_children_A_fkey" FOREIGN KEY ("A") REFERENCES "AtomSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_children_B_fkey" FOREIGN KEY ("B") REFERENCES "AtomSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_parents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_parents_A_fkey" FOREIGN KEY ("A") REFERENCES "AtomSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_parents_B_fkey" FOREIGN KEY ("B") REFERENCES "AtomSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectPath_key" ON "Project"("projectPath");

-- CreateIndex
CREATE UNIQUE INDEX "Test_name_key" ON "Test"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Test_testFile_key" ON "Test"("testFile");

-- CreateIndex
CREATE UNIQUE INDEX "Tab_testId_key" ON "Tab"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "Canvas_testId_key" ON "Canvas"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "AtomSource_label_key" ON "AtomSource"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Atom_nickname_key" ON "Atom"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Relation_label_key" ON "Relation"("label");

-- CreateIndex
CREATE UNIQUE INDEX "_children_AB_unique" ON "_children"("A", "B");

-- CreateIndex
CREATE INDEX "_children_B_index" ON "_children"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_parents_AB_unique" ON "_parents"("A", "B");

-- CreateIndex
CREATE INDEX "_parents_B_index" ON "_parents"("B");
