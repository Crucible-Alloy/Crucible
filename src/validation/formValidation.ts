// Form Validation for test creation.
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
const prisma = new PrismaClient();

const validFileName = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;

async function isTestNameAvailable(
  name: string,
  projectID: number
): Promise<boolean> {
  let test = await prisma.test.findFirst({
    where: {
      name: { equals: name },
      projectID: { equals: projectID },
    },
  });
  return test == null;
}

/**
 * Returns false if there is a project with the given name in the database.
 * @param name
 * @returns Promise<Project | null>
 */
async function isProjectNameAvailable(name: string): Promise<boolean> {
  let project = await prisma.project.findFirst({
    where: {
      name: { equals: name },
    },
  });
  return project == null;
}

const NewTestSchema = z
  .object({
    testName: z
      .string()
      .regex(validFileName, "Invalid test name.")
      .min(3, "Test name should be at least 3 characters."),
    projectID: z.coerce.number().refine(async (val) => {
      const project = await prisma.project.findFirst({
        where: { id: val },
      });
      return !!project;
    }),
  })
  .refine(
    async ({ testName, projectID }) => {
      let result = await isTestNameAvailable(testName, projectID);
      return result;
    },
    (val) => ({
      message: `A test named ${val.testName} already exists in this project.`,
      path: ["testName"],
    })
  );

const NewProjectSchema = z
  .object({
    projectName: z
      .string()
      .regex(validFileName, "Invalid file name.")
      .min(3, "Project name should be at least 3 characters.")
      .refine(
        async (val) => {
          let result = await isProjectNameAvailable(val);
          return result;
        },
        (val) => ({ message: `A project named ${val} already exists.` })
      ),
    projectPath: z.string(),
    alloyFile: z.string(),
  })
  .refine(
    (data) => !fs.existsSync(data.projectPath + data.projectName),
    (data) => ({
      message: `${data.projectName} already exists at the given path.`,
      path: ["projectName"],
    })
  );

const AtomRespSchema = z.object({
  label: z.string(),
  isEnum: z.coerce.boolean(),
  isLone: z.coerce.boolean(),
  isOne: z.coerce.boolean(),
  isSome: z.coerce.boolean(),
  isAbstract: z.coerce.boolean(),
  parents: z.string().array().optional(),
  children: z.string().array().optional(),
  relations: z
    .object({ label: z.string(), multiplicity: z.string(), type: z.string() })
    .array(),
});

//     Validation rules for db entry.
//     color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Invalid hex color code."),
//     shape: z.enum(['Rectangle', 'Triangle', 'Circle']),
//     projectID: z.number(),

const PredicateRespSchema = z.object({
  label: z.string(),
  parameters: z
    .object({
      label: z.string(),
      paramType: z.string(),
    })
    .array(),
});

export type ValidAtomResp = z.infer<typeof AtomRespSchema>;
export type ValidPredResp = z.infer<typeof PredicateRespSchema>;
export type NewTest = z.infer<typeof NewTestSchema>;
export type NewProject = z.infer<typeof NewProjectSchema>;

export { NewTestSchema, AtomRespSchema, PredicateRespSchema, NewProjectSchema };
