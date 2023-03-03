import { ipcMain, BrowserWindow } from "electron";
import { getColorArray } from "../../src/utils/helpers";
import { Prisma, PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";

const {
  GET_ATOM_SOURCES,
  SET_ATOM_COLOR,
  GET_ATOM_SOURCE,
  CREATE_CONNECTION,
} = require("../../src/utils/constants");

const prisma = new PrismaClient();
const number = z.coerce.number();

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
