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
const { GET_ATOM_SOURCES } = require('../../src/utils/constants.js');
const prisma = new client_1.PrismaClient();
electron_1.ipcMain.on(GET_ATOM_SOURCES, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    const atoms = yield prisma.atomSource.findMany({ where: { projectID: projectID } });
    event.sender.send('get-atom-sources-resp', atoms ? atoms : {});
}));
