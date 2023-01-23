import { BrowserWindow, ipcMain } from "electron";
import { Prisma, PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import { NewTest } from "../validation/formValidation";
import { NewTestSchema } from "../validation/formValidation";
import path from "path";
import fs from "fs";

const {
  CREATE_NEW_TEST,
  READ_TEST,
  DELETE_TEST,
  GET_TESTS,
  TEST_CAN_ADD_ATOM,
  TEST_ADD_ATOM,
} = require("../../src/utils/constants.js");

const prisma = new PrismaClient();

export type TestWithCanvas = Prisma.TestGetPayload<{
  include: { atoms: true; connections: true };
}>;

const number = z.coerce.number(); // For id validation (ipc passes strings as default so IDs must be coerced)

/**
 * Validate the form data to ensure no duplicate test names are used and all paths are valid.
 * @returns boolean
 * @param data
 */
async function validateNewTest(
  data: NewTest
): Promise<{ success: boolean; error?: any }> {
  try {
    await NewTestSchema.parseAsync(data);
    return { success: true, error: null };
  } catch (e) {
    if (e instanceof ZodError) {
      return { success: false, error: e.issues };
    } else {
      throw e;
    }
  }
}

async function createNewTest(projectID: number, testName: string) {
  // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
  // Validate data. If there is an error, return it to the client.
  let validationResp = await validateNewTest({ testName, projectID });
  if (!validationResp.success) {
    console.log(validationResp);
    return validationResp;
  }
  const number = z.coerce.number();
  const project = await prisma.project.findFirst({
    where: { id: number.parse(projectID) },
  });
  if (project) {
    let testFilePath = path.join(project.projectPath, `tests/${testName}.txt`);

    // Create temp test file at the given path. If error, return it to the client.
    fs.writeFile(testFilePath, "Placeholder file...", function (err) {
      if (err) return { success: false, error: err.message };
    });

    // Insert new test into the database
    const newTest = await prisma.test.create({
      data: {
        name: testName,
        projectID: project.id,
        testFile: testFilePath,
      },
    });

    if (!newTest) {
      return { success: false, error: "Could not create test." };
    } else {
      return { success: true, error: null, test: newTest };
    }
  }
}

ipcMain.on(
  CREATE_NEW_TEST,
  async (event, projectID: number, testName: string) => {
    let result = await createNewTest(projectID, testName);
    event.sender.send("created-new-test", result);
  }
);

ipcMain.on(
  READ_TEST,
  async (
    event,
    { testID, returnKey }: { testID: number; returnKey: string }
  ) => {
    const test = await prisma.test.findFirst({
      where: { id: number.parse(testID) },
      include: { atoms: true, connections: true },
    });
    event.sender.send(returnKey, test ? test : {});
  }
);

ipcMain.on(GET_TESTS, async (event, projectID: number) => {
  const tests = await prisma.test.findMany({
    where: { projectID: number.parse(projectID) },
  });
  event.sender.send("got-tests", tests ? tests : []);
});

ipcMain.on(DELETE_TEST, async (event, projectID, testID) => {
  const test = await prisma.test.delete({
    where: { id: number.parse(testID) },
  });
  // TODO: Alert client to change in tests table.
});

// TODO: This can likely be simplified to a single query
ipcMain.on(
  TEST_CAN_ADD_ATOM,
  async (
    event,
    { testID, sourceAtomID }: { testID: number; sourceAtomID: number }
  ) => {
    try {
      let test = await prisma.test.findFirstOrThrow({
        where: { id: testID },
        include: { atoms: true },
      });
      let atomSource = await prisma.atomSource.findFirstOrThrow({
        where: { id: sourceAtomID },
      });
      if (atomSource.isLone || atomSource.isOne) {
        if (test.atoms.filter((atom) => atom.srcID === atomSource.id)) {
          console.log("Found an atom");
          event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: false }); // already an atom with a matching source
        }
      }
      event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: true }); // No multiplicity issues, eligible atom
    } catch (e) {
      event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, {
        success: false,
        error: e,
      });
    }
  }
);

// TODO: Build out default nickname
ipcMain.on(
  TEST_ADD_ATOM,
  async (
    event,
    {
      testID,
      sourceAtomID,
      top,
      left,
    }: { testID: number; sourceAtomID: number; top: number; left: number }
  ) => {
    let atom = await prisma.atom.create({
      data: {
        testID: number.parse(testID),
        srcID: number.parse(sourceAtomID),
        top: number.parse(top),
        left: number.parse(left),
        nickname: "Test",
      },
    });

    // Alert the browser to a change in state.
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.send("canvas-update");
    }
  }
);
