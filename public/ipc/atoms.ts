import { ipcMain, BrowserWindow } from "electron";
import { getColorArray } from "../../utils/helpers";
import { Prisma, PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";

const {
  GET_ATOM_SOURCES,
  SET_ATOM_COLOR,
  GET_ATOM_SOURCE,
  CREATE_CONNECTION,
} = require("../../utils/constants");

const prisma = new PrismaClient();
const number = z.coerce.number();

export type AtomSourceWithRelations = Prisma.AtomSourceGetPayload<{
  include: { fromRelations: true; toRelations: true; isChildOf: true };
}>;

ipcMain.on(GET_ATOM_SOURCES, async (event, projectID: number) => {
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

ipcMain.on(GET_ATOM_SOURCE, async (event, { srcAtomID }) => {
  const atom = await prisma.atomSource.findFirst({
    where: { id: number.parse(srcAtomID) },
    include: {
      fromRelations: true,
      toRelations: true,
      isChildOf: true,
    },
  });
  event.sender.send(`${GET_ATOM_SOURCE}-resp`, atom ? atom : {});
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

ipcMain.on(CREATE_CONNECTION, (event, { toAtom, fromAtom }) => {
  // Alert the browser to a change in state.
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.send("canvas-update");
  }
});
