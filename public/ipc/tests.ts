import { ipcMain, BrowserWindow } from "electron";
import { getColorArray } from "../../src/utils/helpers";
import { Prisma, PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import path from "path";
import fs from "fs";

const {
  CREATE_NEW_TEST,
  DELETE_TEST,
  GET_TESTS,
} = require("../../src/utils/constants.js");

const prisma = new PrismaClient();

// Form Validation for test creation.
const validFileName = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;

const NewTestSchema = z
  .string()
  .regex(validFileName, "Invalid test name.")
  .min(3, "Test name should be at least 3 characters.")
  .refine(
    async (val) => {
      let result = await isTestNameAvailable(val);
      return result;
    },
    (val) => ({ message: `A test named ${val} already exists.` })
  );
// TODO: Verify file does not exist at path projectPath/tests/<testName>
export type NewProject = z.infer<typeof NewTestSchema>;

async function isTestNameAvailable(name: string): Promise<boolean> {
  let test = await prisma.test.findFirst({
    where: {
      name: { equals: name },
    },
  });
  return test == null;
}

ipcMain.on(
  CREATE_NEW_TEST,
  async (event, projectID: number, testName: string) => {
    // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
    const project = await prisma.project.findFirst({
      where: { id: projectID },
    });
    if (project) {
      let testFilePath = path.join(
        project.projectPath,
        `tests/${testName}.txt`
      );

      fs.writeFile(testFilePath, "Placeholder file...", function (err) {
        if (err) throw err;
      });

      let newTest = {
        name: testName,
        testFile: testFilePath,
        canvas: {
          atomCount: 0, // For use with atom nickname
          atoms: {},
          connections: {},
        },
      };
    }

    event.sender.send("created-new-test", newTest);
  }
);

ipcMain.on(GET_TESTS, async (event, projectID: number) => {
  const number = z.coerce.number(); // Validate projectID is a number.
  const tests = await prisma.test.findMany({
    where: { projectID: number.parse(projectID) },
  });
  event.sender.send("got-tests", tests ? tests : []);
});

ipcMain.on(DELETE_TEST, async (event, projectID, testID) => {
  const number = z.coerce.number(); // Validate projectID is a number.
  const tests = await prisma.test.delete({
    where: { id: number.parse(testID) },
  });
  // TODO: Alert client to change in tests table.
});
