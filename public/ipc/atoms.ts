import { ipcMain } from 'electron';
import { getColorArray } from '../../src/utils/helpers';
import {PrismaClient, Project} from '@prisma/client';
import {z, ZodError} from "zod";

const { GET_ATOM_SOURCES } = require('../../src/utils/constants.js');

const prisma = new PrismaClient()

ipcMain.on(GET_ATOM_SOURCES, async (event, projectID: number) => {
    const atoms = await prisma.atomSource.findMany({ where: { projectID: projectID } })
    event.sender.send('get-atom-sources-resp', atoms ? atoms : {})
})