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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
const { VALIDATE_NEW_PROJECT_FORM, CREATE_NEW_PROJECT } = require('../../src/utils/constants.js');
const prisma = new client_1.PrismaClient();
// Form Validation for project creation.
const validFileName = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;
const NewProjectSchema = zod_1.z.object({
    projectName: zod_1.z.string()
        .regex(validFileName, "Invalid file name.")
        .min(3, "Project name should be at least 3 characters.")
        .refine((val) => __awaiter(void 0, void 0, void 0, function* () {
        let result = yield isProjectNameAvailable(val);
        console.log(result);
        return result;
    }), (val) => ({ message: `A project named ${val} already exists.` })),
    projectPath: zod_1.z.string(),
    alloyFile: zod_1.z.string()
}).refine((data) => !fs_1.default.existsSync(data.projectPath + data.projectName), (data) => ({ message: `${data.projectName} already exists at the given path.`, path: ['projectName'] }));
/**
 * Returns false if there is a project with the given name in the database.
 * @param name
 * @returns Promise<Project | null>
 */
function isProjectNameAvailable(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let project = yield prisma.project.findFirst({
            where: {
                name: { equals: name },
            }
        });
        return project == null;
    });
}
/**
 * Validate the form data to ensure no duplicate project names are used and all paths are valid.
 * @param data Form data to be validated.
 * @returns boolean
 */
function validateNewProject(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield NewProjectSchema.parseAsync(data);
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
// function initProjectData(filePath:string , projectKey:string) {
//     let colors = getColorArray();
//     let atomData = {};
//     let predicateData = {};
//
//     try {
//         // Send file to alloy API and get back metadata
//         const apiRequest = axios.post("http://localhost:8080/files",null, {params: {"filePath": filePath}})
//         apiRequest.then(data => {
//             if (data.data) {
//                 console.log(data.data)
//                 for (const atom in data.data["atoms"]) {
//
//                     // If colors array is empty, repopulate it.
//                     if (!colors.length) {
//                         colors = getColorArray();
//                     }
//                     // Pop a random color from the colors array and assign to the atom
//                     data.data["atoms"][atom]["color"] = colors.splice(Math.floor(Math.random() * colors.length), 1)[0]
//
//                     // Set the shape of the atom.
//                     data.data["atoms"][atom]["shape"] = "rectangle"
//
//                     atomData[uuidv4()] = data.data["atoms"][atom]
//                 }
//
//                 // Post-processing on the relations information for multiplicity enforcement
//                 for (const [key, atom] of Object.entries(atomData)) {
//
//                     // Get the multiplicity and related atom label from the response returned to the API
//                     atom["relations"].forEach(function (item) {
//                         let multiplicity = item["multiplicity"].split(" ")[0];
//                         let relationFromLabel = item["type"].split("->")[0].split("{")[1];
//                         let relationToLabel = item["type"].split("->")[1].split("}")[0];
//
//                         // Overwrite the multiplicity key and set related_label
//                         item["multiplicity"] = multiplicity;
//                         item["toLabel"] = relationToLabel;
//                         item["fromLabel"] = relationFromLabel;
//
//                         // Find the related atom key
//                         for (const [key, value] of Object.entries(atomData)) {
//                             if (value["label"] === relationToLabel) {
//                                 item["toKey"] = key
//                             } else if ( value["label"] === relationFromLabel ) {
//                                 item["fromKey"] = key
//                             }
//                         }
//                     });
//                 }
//
//                 let preds = data.data.functions
//
//                 // Status can be 'null', 'equals', or 'negate'
//                 preds.forEach(predicate => {
//                     predicateData[predicate['label'].split('/').at(-1)] = {
//                         status: "null",
//                         params: predicate['parameters']};
//                 })
//
//                 Object.values(predicateData).forEach(predicate => {
//                     predicate.params.forEach(param => {
//                         param.atom = "null"
//                     })
//                 })
//
//             }
//         }).then( () => {
//             // Write all atom data to the project
//             store.set(`projects.${projectKey}.atoms`, atomData);
//             store.set(`projects.${projectKey}.predicates`, predicateData)
//         });
//     } catch (err) {
//         console.log(err)
//     }
// }
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
        console.log(`Project Path: ${fullProjectPath}`);
        const projectFolder = fs_1.default.mkdirSync(fullProjectPath, { recursive: true });
        const testsFolder = fs_1.default.mkdirSync(path_1.default.join(fullProjectPath, "tests"), { recursive: true });
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
        }
        // TODO: Refactor this stuff next
        // store.set(`projects.${projectKey}.predicates`, [])
        // store.set(`projects.${projectKey}.tabs`, [])
        // store.set(`projects.${projectKey}.activeTab`, "")
        // store.set(`projects.${projectKey}.tests`, {})
        //
        // // Get atom data from springBoot API and write to sqlite db
        // initProjectData(alloyFile, projectKey)
        //
        // // Open new project
        // openProject(projectKey);
    });
}
electron_1.ipcMain.on(VALIDATE_NEW_PROJECT_FORM, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield validateNewProject(data);
    event.sender.send('project-name-validation', response);
}));
electron_1.ipcMain.on(CREATE_NEW_PROJECT, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield createNewProject(data);
    event.sender.send('new-project-resp', result);
}));
