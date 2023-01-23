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
const helpers_1 = require("../../src/utils/helpers");
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const formValidation_1 = require("../validation/formValidation");
const { VALIDATE_NEW_PROJECT_FORM, CREATE_NEW_PROJECT, GET_PROJECT, DELETE_PROJECT, } = require("../../src/utils/constants.js");
const prisma = new client_1.PrismaClient();
/**
 * Validate the form data to ensure no duplicate project names are used and all paths are valid.
 * @param data Form data to be validated.
 * @returns boolean
 */
function validateNewProject(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield formValidation_1.NewProjectSchema.parseAsync(data);
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
function initializeAtoms(atoms, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        let colors = (0, helpers_1.getColorArray)();
        // Validate all Atom.
        atoms.forEach((atom) => {
            try {
                formValidation_1.AtomRespSchema.parse(atom);
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
        for (const atom of atoms) {
            // Reset colors if needed, then grab a color for assignment.
            if (colors.length === 0)
                (0, helpers_1.getColorArray)();
            let selectedColor = colors.splice(Math.floor(Math.random() * colors.length), 1)[0];
            // Insert AtomSource data into the database (sans parent/child data)
            const newAtom = yield prisma.atomSource.create({
                data: {
                    projectID: projectID,
                    label: atom.label,
                    isEnum: atom.isEnum ? true : undefined,
                    isLone: atom.isLone ? true : undefined,
                    isOne: atom.isOne ? true : undefined,
                    isSome: atom.isSome ? true : undefined,
                    isAbstract: atom.isAbstract ? true : undefined,
                    color: selectedColor,
                },
            });
            if (newAtom === undefined) {
                // TODO: Error handling for issue inserting atom.
            }
        }
    });
}
function initializeInheritance(atoms, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const atom of atoms) {
            // Insert parents of atom to atomInheritance table.
            if (atom.parents) {
                for (const parent of atom.parents) {
                    // See if the inheritance is already in the database.
                    yield prisma.atomInheritance.upsert({
                        where: {
                            atomInheritanceID: {
                                parentLabel: parent,
                                childLabel: atom.label,
                                projectID: projectID,
                            },
                        },
                        create: {
                            parentLabel: parent,
                            childLabel: atom.label,
                            projectID: projectID,
                        },
                        update: {},
                    });
                }
            }
            // Insert children of atom to atomChildren table
            if (atom.children) {
                for (const child of atom.children) {
                    yield prisma.atomInheritance.upsert({
                        where: {
                            atomInheritanceID: {
                                parentLabel: atom.label,
                                childLabel: child,
                                projectID: projectID,
                            },
                        },
                        create: {
                            parentLabel: atom.label,
                            childLabel: child,
                            projectID: projectID,
                        },
                        update: {},
                    });
                }
            }
        }
    });
}
function initializeRelations(atoms, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const atom of atoms) {
            // Insert parents of atom to atomInheritance table.
            if (atom.relations) {
                for (const relation of atom.relations) {
                    // Nasty transformation to get the last label in a -> chain e.g. "{this/Book->this/Name->this/Listing}"
                    const toLabel = relation.type
                        .split("->")[relation.type.split("->").length - 1].split("}")[0];
                    // See if the inheritance is already in the database.
                    yield prisma.relation.upsert({
                        where: {
                            relationID: {
                                projectID: projectID,
                                label: relation.label,
                            },
                        },
                        create: {
                            projectID: projectID,
                            label: relation.label,
                            multiplicity: relation.multiplicity,
                            type: relation.type,
                            fromLabel: atom.label,
                            toLabel: toLabel,
                        },
                        update: {},
                    });
                }
            }
        }
    });
}
function initializePredicates(predicates, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const pred of predicates) {
            const newPred = yield prisma.predicate.create({
                data: {
                    projectID: projectID,
                    name: pred.label,
                },
            });
            for (const param of pred.parameters) {
                yield prisma.predParam.create({
                    data: {
                        predID: newPred.id,
                        label: param.label,
                        paramType: param.paramType,
                    },
                });
            }
        }
    });
}
function initProjectData(data, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Send file to alloy API and get back metadata
            const apiRequest = axios_1.default.post("http://localhost:8080/files", null, {
                params: { filePath: data.alloyFile },
            });
            let resp = yield apiRequest;
            if (resp.data) {
                yield initializeAtoms(resp.data.atoms, projectID);
                yield initializeInheritance(resp.data.atoms, projectID);
                yield initializeRelations(resp.data.atoms, projectID);
                yield initializePredicates(resp.data.functions, projectID);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
/**
 * Insert new project record into the database and initialize project assets based on SpringBoot response.
 * @param data
 */
function createNewProject(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate data. If there is an error, return it to the client.
        let validationResp = yield validateNewProject(data);
        if (!validationResp.success)
            return validationResp;
        // Create project directories
        const fullProjectPath = data.projectPath + data.projectName;
        const projectFolder = fs_1.default.mkdirSync(fullProjectPath, { recursive: true });
        const testsFolder = fs_1.default.mkdirSync(path_1.default.join(fullProjectPath, "tests"), {
            recursive: true,
        });
        if (projectFolder && testsFolder) {
            // Insert project data if paths are good.
            const project = yield prisma.project.create({
                data: {
                    name: data.projectName,
                    projectPath: fullProjectPath,
                    alloyFile: data.alloyFile,
                },
            });
            if (!project) {
                return { success: false, error: "Could not create project." };
            }
            yield initProjectData(data, project.id);
            return { success: true, error: null, projectID: project.id };
        }
    });
}
electron_1.ipcMain.on(VALIDATE_NEW_PROJECT_FORM, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield validateNewProject(data);
    event.sender.send("project-name-validation", response);
}));
electron_1.ipcMain.on(CREATE_NEW_PROJECT, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield createNewProject(data);
    event.sender.send("new-project-resp", result);
}));
electron_1.ipcMain.on(GET_PROJECT, (event, projectID) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield prisma.project.findFirst({ where: { id: projectID } });
    event.sender.send("get-project-resp", project);
}));
electron_1.ipcMain.on(DELETE_PROJECT, (event, project) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_1.default.rmdir(project.projectPath, { recursive: true }, (err) => {
        if (err) {
            return console.log("error occurred in deleting directory", err);
        }
    });
    const delResp = yield prisma.project.delete({ where: { id: project.id } });
    event.sender.send("delete-project-resp", delResp);
}));
