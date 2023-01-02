import {ipcMain} from 'electron';
import {PrismaClient, Project} from '@prisma/client';
import path from "path";
import fs from "fs";
import axios from "axios";
import {z, ZodError} from "zod";

const { VALIDATE_NEW_PROJECT_FORM, CREATE_NEW_PROJECT } = require('../../src/utils/constants.js');

const prisma = new PrismaClient();

// Form Validation for project creation.
const validFileName = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;

const NewProjectSchema = z.object({
    projectName: z.string()
        .regex(validFileName, "Invalid file name.")
        .min(3, "Project name should be at least 3 characters.")
        .refine(async (val) => {
                let result = await isProjectNameAvailable(val)
                console.log(result)
                return result
            },
            (val) => ( { message: `A project named ${val} already exists.`} )
        ),
    projectPath: z.string(),
    alloyFile: z.string()
}).refine(
    (data) => !fs.existsSync( data.projectPath + data.projectName ),
    (data) => ({ message: `${data.projectName} already exists at the given path.`, path: ['projectName'] })
)
export type NewProject = z.infer<typeof NewProjectSchema>;

/**
 * Returns false if there is a project with the given name in the database.
 * @param name
 * @returns Promise<Project | null>
 */
async function isProjectNameAvailable(name: string) : Promise<boolean> {
    let project = await prisma.project.findFirst({
        where: {
            name: {equals: name},
        }
    });
    return project == null;
}

/**
 * Validate the form data to ensure no duplicate project names are used and all paths are valid.
 * @param data Form data to be validated.
 * @returns boolean
 */
async function validateNewProject( data: NewProject ) : Promise<{success: boolean; error?: any}> {
    try {
        await NewProjectSchema.parseAsync(data);
        return { success: true, error: null }
    } catch (e) {
        if (e instanceof ZodError) {
            return { success: false, error: e.issues }
        } else {
            throw e
        }
    }
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
async function createNewProject( data: NewProject ) {

    // Validate data. If there is an error, return it to the client.
    let validationResp = await validateNewProject( data );
    if (!validationResp.success) return validationResp;


    // Create project directories
    const fullProjectPath = data.projectPath + data.projectName;
    console.log(`Project Path: ${fullProjectPath}`)
    const projectFolder =  fs.mkdirSync( fullProjectPath, {recursive: true} );
    const testsFolder = fs.mkdirSync(path.join(fullProjectPath, "tests"), {recursive: true});

    if (projectFolder && testsFolder) {
        // Insert project data if paths are good.
        const project = await prisma.project.create({
            data: {
                name: data.projectName,
                projectPath: fullProjectPath,
                alloyFile: data.alloyFile,
            },
        })

        if (!project) {
            return { success: false, error: "Could not create project." }
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

}

ipcMain.on(VALIDATE_NEW_PROJECT_FORM, async (event: Electron.IpcMainEvent, data : NewProject) => {
    const response = await validateNewProject(data)
    event.sender.send('project-name-validation', response)
})

ipcMain.on(CREATE_NEW_PROJECT, async (event, data : NewProject) => {
    const result = await createNewProject(data);
    event.sender.send('new-project-resp', result)
})