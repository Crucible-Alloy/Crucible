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
const formValidation_1 = require("../validation/formValidation");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const { CREATE_NEW_TEST, READ_TEST, DELETE_TEST, GET_TESTS, TEST_CAN_ADD_ATOM, TEST_ADD_ATOM, } = require("../../src/utils/constants.js");
const prisma = new client_1.PrismaClient();
const number = zod_1.z.coerce.number(); // For id validation (ipc passes strings as default so IDs must be coerced)
/**
 * Validate the form data to ensure no duplicate test names are used and all paths are valid.
 * @returns boolean
 * @param data
 */
function validateNewTest(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield formValidation_1.NewTestSchema.parseAsync(data);
            return { success: true, error: null };
        }
        catch (e) {
            if (e instanceof zod_1.ZodError) {
                return { success: false, error: e.issues };
            }
            else {
                throw e;
            }
        }
    });
}
function createNewTest(projectID, testName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create placeholder test file in /tests, write test to store with blank canvas, return test object to ipcRender
        // Validate data. If there is an error, return it to the client.
        let validationResp = yield validateNewTest({ testName, projectID });
        if (!validationResp.success) {
            console.log(validationResp);
            return validationResp;
        }
        const number = zod_1.z.coerce.number();
        const project = yield prisma.project.findFirst({
            where: { id: number.parse(projectID) },
        });
        if (project) {
            let testFilePath = path_1.default.join(project.projectPath, `tests/${testName}.txt`);
            // Create temp test file at the given path. If error, return it to the client.
            fs_1.default.writeFile(testFilePath, "Placeholder file...", function (err) {
                if (err)
                    return { success: false, error: err.message };
            });
            // Insert new test into the database
            const newTest = yield prisma.test.create({
                data: {
                    name: testName,
                    projectID: project.id,
                    testFile: testFilePath,
                },
            });
            if (!newTest) {
                return { success: false, error: "Could not create test." };
            }
            else {
                return { success: true, error: null, test: newTest };
            }
        }
    });
}
electron_1.ipcMain.on(CREATE_NEW_TEST, (event, projectID, testName) => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield createNewTest(projectID, testName);
    event.sender.send("created-new-test", result);
}));
electron_1.ipcMain.on(READ_TEST, (event, { testID, returnKey }) => __awaiter(void 0, void 0, void 0, function* () {
    const test = yield prisma.test.findFirst({
        where: { id: number.parse(testID) },
        include: { atoms: true, connections: true },
    });
    event.sender.send(returnKey, test ? test : {});
}));
electron_1.ipcMain.on(GET_TESTS, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    const tests = yield prisma.test.findMany({
        where: { projectID: number.parse(projectID) },
    });
    event.sender.send("got-tests", tests ? tests : []);
}));
electron_1.ipcMain.on(DELETE_TEST, (event, projectID, testID) => __awaiter(void 0, void 0, void 0, function* () {
    const test = yield prisma.test.delete({
        where: { id: number.parse(testID) },
    });
    // TODO: Alert client to change in tests table.
}));
// TODO: This can likely be simplified to a single query
electron_1.ipcMain.on(TEST_CAN_ADD_ATOM, (event, { testID, sourceAtomID }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let test = yield prisma.test.findFirstOrThrow({
            where: { id: testID },
            include: { atoms: true },
        });
        let atomSource = yield prisma.atomSource.findFirstOrThrow({
            where: { id: sourceAtomID },
        });
        if (atomSource.isLone || atomSource.isOne) {
            if (test.atoms.filter((atom) => atom.srcID === atomSource.id)) {
                console.log("Found an atom");
                event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: false }); // already an atom with a matching source
            }
        }
        event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, { success: true }); // No multiplicity issues, eligible atom
    }
    catch (e) {
        event.sender.send(`${TEST_CAN_ADD_ATOM}-resp`, {
            success: false,
            error: e,
        });
    }
}));
// TODO: Build out default nickname
electron_1.ipcMain.on(TEST_ADD_ATOM, (event, { testID, sourceAtomID, top, left, }) => __awaiter(void 0, void 0, void 0, function* () {
    let atom = yield prisma.atom.create({
        data: {
            testID: number.parse(testID),
            srcID: number.parse(sourceAtomID),
            top: number.parse(top),
            left: number.parse(left),
            nickname: "Test",
        },
    });
    // Alert the browser to a change in state.
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
        window.webContents.send("canvas-update");
    }
}));
