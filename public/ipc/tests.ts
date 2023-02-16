import { BrowserWindow, ipcMain } from "electron";
import { Prisma, PrismaClient, Test } from "@prisma/client";
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
  OPEN_TEST,
} = require("../../utils/constants");

const prisma = new PrismaClient();
