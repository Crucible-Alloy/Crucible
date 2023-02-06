"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const { CREATE_NEW_TEST, READ_TEST, DELETE_TEST, GET_TESTS, TEST_CAN_ADD_ATOM, TEST_ADD_ATOM, OPEN_TEST, } = require("../../src/utils/constants.js");
const prisma = new client_1.PrismaClient();
