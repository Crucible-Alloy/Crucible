import { ipcMain } from "electron";
import { getColorArray } from "../../src/utils/helpers";
import { PrismaClient, Project } from "@prisma/client";
import path from "path";
import fs from "fs";
import { ZodError } from "zod";
import axios, { AxiosResponse } from "axios";
import {
  NewProject,
  ValidAtomResp,
  ValidPredResp,
} from "../validation/formValidation";
import { NewProjectSchema, AtomRespSchema } from "../validation/formValidation";

const {
  VALIDATE_NEW_PROJECT_FORM,
  CREATE_NEW_PROJECT,
  GET_PROJECT,
  DELETE_PROJECT,
} = require("../../src/utils/constants");

const prisma = new PrismaClient();

/**
 * Validate the form data to ensure no duplicate project names are used and all paths are valid.
 * @param data Form data to be validated.
 * @returns boolean
 */
async function validateNewProject(
  data: NewProject
): Promise<{ success: boolean; error?: any }> {
  try {
    await NewProjectSchema.parseAsync(data);
    return { success: true, error: null };
  } catch (e) {
    if (e instanceof ZodError) {
      return { success: false, error: e.issues };
    } else {
      throw e;
    }
  }
}

async function initializeAtoms(atoms: ValidAtomResp[], projectID: number) {
  let colors = getColorArray();

  // Validate all Atom.
  atoms.forEach((atom) => {
    try {
      AtomRespSchema.parse(atom);
    } catch (e) {
      if (e instanceof ZodError) {
        return { success: false, error: e.issues };
      } else {
        throw e;
      }
    }
  });

  for (const atom of atoms) {
    // Reset colors if needed, then grab a color for assignment.
    if (colors.length === 0) getColorArray();
    let selectedColor = colors.splice(
      Math.floor(Math.random() * colors.length),
      1
    )[0];

    // Insert AtomSource data into the database (sans parent/child data)
    const newAtom = await prisma.atomSource.create({
      data: {
        projectID: projectID,
        label: atom.label,
        isEnum: atom.isEnum ? true : undefined, // Prisma cannot handle null, so must be undefined (schema default is false).
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
}

async function initializeInheritance(
  atoms: ValidAtomResp[],
  projectID: number
) {
  for (const atom of atoms) {
    // Insert parents of atom to atomInheritance table.
    if (atom.parents) {
      for (const parent of atom.parents) {
        // See if the inheritance is already in the database.
        await prisma.atomInheritance.upsert({
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
        await prisma.atomInheritance.upsert({
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
}

async function initializeRelations(atoms: ValidAtomResp[], projectID: number) {
  for (const atom of atoms) {
    // Insert parents of atom to atomInheritance table.
    if (atom.relations) {
      for (const relation of atom.relations) {
        // Nasty transformation to get the last label in a -> chain e.g. "{this/Book->this/Name->this/Listing}"
        const toLabel = relation.type
          .split("->")
          [relation.type.split("->").length - 1].split("}")[0];
        // See if the inheritance is already in the database.
        await prisma.relation.upsert({
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
}

async function initializePredicates(
  predicates: ValidPredResp[],
  projectID: number
) {
  for (const pred of predicates) {
    const newPred = await prisma.predicate.create({
      data: {
        projectID: projectID,
        name: pred.label,
      },
    });
    for (const param of pred.parameters) {
      await prisma.predParam.create({
        data: {
          predID: newPred.id,
          label: param.label,
          paramType: param.paramType,
        },
      });
    }
  }
}

async function initProjectData(data: NewProject, projectID: number) {
  try {
    // Send file to alloy API and get back metadata
    const apiRequest = axios.post("http://localhost:8080/files", null, {
      params: { filePath: data.alloyFile },
    });
    let resp: AxiosResponse<{
      atoms: ValidAtomResp[];
      functions: ValidPredResp[];
    }> = await apiRequest;
    if (resp.data) {
      await initializeAtoms(resp.data.atoms, projectID);
      await initializeInheritance(resp.data.atoms, projectID);
      await initializeRelations(resp.data.atoms, projectID);
      await initializePredicates(resp.data.functions, projectID);
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Insert new project record into the database and initialize project assets based on SpringBoot response.
 * @param data
 */
async function createNewProject(data: NewProject) {
  // Validate data. If there is an error, return it to the client.
  let validationResp = await validateNewProject(data);
  if (!validationResp.success) return validationResp;

  // Create project directories
  const fullProjectPath = data.projectPath + data.projectName;
  const projectFolder = fs.mkdirSync(fullProjectPath, { recursive: true });
  const testsFolder = fs.mkdirSync(path.join(fullProjectPath, "tests"), {
    recursive: true,
  });

  if (projectFolder && testsFolder) {
    // Insert project data if paths are good.
    const project = await prisma.project.create({
      data: {
        name: data.projectName,
        projectPath: fullProjectPath,
        alloyFile: data.alloyFile,
      },
    });

    if (!project) {
      return { success: false, error: "Could not create project." };
    }

    await initProjectData(data, project.id);
    return { success: true, error: null, projectID: project.id };
  }
}

ipcMain.on(
  VALIDATE_NEW_PROJECT_FORM,
  async (event: Electron.IpcMainEvent, data: NewProject) => {
    const response = await validateNewProject(data);
    event.sender.send("project-name-validation", response);
  }
);

ipcMain.on(CREATE_NEW_PROJECT, async (event, data: NewProject) => {
  const result = await createNewProject(data);
  event.sender.send("new-project-resp", result);
});

ipcMain.on(GET_PROJECT, async (event, projectID: number) => {
  const project = await prisma.project.findFirst({ where: { id: projectID } });
  event.sender.send("get-project-resp", project);
});

ipcMain.on(DELETE_PROJECT, async (event, project: Project) => {
  await fs.rmdir(project.projectPath, { recursive: true }, (err) => {
    if (err) {
      return console.log("error occurred in deleting directory", err);
    }
  });

  const delResp = await prisma.project.delete({ where: { id: project.id } });
  event.sender.send("delete-project-resp", delResp);
});
