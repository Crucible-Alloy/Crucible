import { ipcMain, BrowserWindow } from "electron";
import { getColorArray } from "../../src/utils/helpers";
import { Prisma, PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";

const {
  GET_ATOM_SOURCES,
  SET_ATOM_COLOR,
  SET_ATOM_SHAPE,
} = require("../../src/utils/constants.js");

const prisma = new PrismaClient();

export type AtomSourceWithRelations = Prisma.AtomSourceGetPayload<{
  include: { fromRelations: true; isChildOf: true };
}>;

ipcMain.on(GET_ATOM_SOURCES, async (event, projectID: number) => {
  const number = z.coerce.number();
  console.log(`Getting atoms with projectID: ${projectID}`);
  const atoms = await prisma.atomSource.findMany({
    where: { projectID: number.parse(projectID) },
    include: {
      fromRelations: true,
      isChildOf: true,
    },
  });
  event.sender.send("get-atom-sources-resp", atoms ? atoms : {});
});

ipcMain.on(SET_ATOM_COLOR, async (event, { sourceAtomID, color }: SetColor) => {
  const number = z.coerce.number();
  await prisma.atomSource.update({
    where: { id: number.parse(sourceAtomID) },
    data: { color: color },
  });

  // Alert the browser to a change in state.
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.send("meta-data-update");
  }
});
