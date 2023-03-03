"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const { GET_ATOM_SOURCES, SET_ATOM_COLOR, GET_ATOM_SOURCE, CREATE_CONNECTION, } = require("../../src/utils/constants");
const prisma = new client_1.PrismaClient();
const number = zod_1.z.coerce.number();
electron_1.ipcMain.on(GET_ATOM_SOURCE, (event, { srcAtomID }) => __awaiter(void 0, void 0, void 0, function* () {
    const atom = yield prisma.atomSource.findFirst({
        where: { id: number.parse(srcAtomID) },
        include: {
            fromRelations: true,
            toRelations: true,
            isChildOf: true,
        },
    });
    event.sender.send(`${GET_ATOM_SOURCE}-resp`, atom ? atom : {});
}));
electron_1.ipcMain.on(SET_ATOM_COLOR, (event, { sourceAtomID, color }) => __awaiter(void 0, void 0, void 0, function* () {
    const number = zod_1.z.coerce.number();
    yield prisma.atomSource.update({
        where: { id: number.parse(sourceAtomID) },
        data: { color: color },
    });
    // Alert the browser to a change in state.
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
        window.webContents.send("meta-data-update");
    }
}));
electron_1.ipcMain.on(CREATE_CONNECTION, (event, { toAtom, fromAtom }) => {
    // Alert the browser to a change in state.
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
        window.webContents.send("canvas-update");
    }
});
