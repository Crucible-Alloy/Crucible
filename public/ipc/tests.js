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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const { CREATE_NEW_TEST, DELETE_TEST, GET_TESTS, } = require("../../src/utils/constants.js");
const prisma = new client_1.PrismaClient();
// Form Validation for test creation.
const validFileName = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;
const NewTestSchema = zod_1.z
    .string()
    .regex(validFileName, "Invalid test name.")
    .min(3, "Test name should be at least 3 characters.")
    .refine((val) => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield isTestNameAvailable(val);
    return result;
}), (val) => ({ message: `A test named ${val} already exists.` }));
function isTestNameAvailable(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let test = yield prisma.test.findFirst({
            where: {
                name: { equals: name },
            },
        });
        return test == null;
    });
}
electron_1.ipcMain.on(CREATE_NEW_TEST, (event, projectID, testName) => __awaiter(void 0, void 0, void 0, function* () {
    // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
    const project = yield prisma.project.findFirst({
        where: { id: projectID },
    });
    if (project) {
        let testFilePath = path_1.default.join(project.projectPath, `tests/${testName}.txt`);
        fs_1.default.writeFile(testFilePath, "Placeholder file...", function (err) {
            if (err)
                throw err;
        });
        let newTest = {
            name: testName,
            testFile: testFilePath,
            canvas: {
                atomCount: 0,
                atoms: {},
                connections: {},
            },
        };
    }
    event.sender.send("created-new-test", newTest);
}));
electron_1.ipcMain.on(GET_TESTS, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    const number = zod_1.z.coerce.number(); // Validate projectID is a number.
    const tests = yield prisma.test.findMany({
        where: { projectID: number.parse(projectID) },
    });
    event.sender.send("got-tests", tests ? tests : []);
}));
electron_1.ipcMain.on(DELETE_TEST, (event, projectID, testID) => __awaiter(void 0, void 0, void 0, function* () {
    const number = zod_1.z.coerce.number(); // Validate projectID is a number.
    const tests = yield prisma.test.delete({
        where: { id: number.parse(testID) },
    });
    // TODO: Alert client to change in tests table.
}));
