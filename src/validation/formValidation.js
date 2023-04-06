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
exports.NewProjectSchema = exports.PredicateRespSchema = exports.AtomRespSchema = exports.NewTestSchema = void 0;
// Form Validation for test creation.
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const validFileName = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;
function isTestNameAvailable(name, projectID) {
    return __awaiter(this, void 0, void 0, function* () {
        let test = yield prisma.test.findFirst({
            where: {
                name: { equals: name },
                projectID: { equals: projectID },
            },
        });
        return test == null;
    });
}
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
            },
        });
        return project == null;
    });
}
const NewTestSchema = zod_1.z
    .object({
    testName: zod_1.z
        .string()
        .regex(validFileName, "Invalid test name.")
        .min(3, "Test name should be at least 3 characters."),
    projectID: zod_1.z.coerce.number().refine((val) => __awaiter(void 0, void 0, void 0, function* () {
        const project = yield prisma.project.findFirst({
            where: { id: val },
        });
        return !!project;
    })),
})
    .refine(({ testName, projectID }) => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield isTestNameAvailable(testName, projectID);
    return result;
}), (val) => ({
    message: `A test named ${val.testName} already exists in this project.`,
    path: ["testName"],
}));
exports.NewTestSchema = NewTestSchema;
const NewProjectSchema = zod_1.z
    .object({
    projectName: zod_1.z
        .string()
        .regex(validFileName, "Invalid file name.")
        .min(3, "Project name should be at least 3 characters.")
        .refine((val) => __awaiter(void 0, void 0, void 0, function* () {
        let result = yield isProjectNameAvailable(val);
        return result;
    }), (val) => ({ message: `A project named ${val} already exists.` })),
    projectPath: zod_1.z.string(),
    alloyFile: zod_1.z.string(),
})
    .refine((data) => !fs_1.default.existsSync(data.projectPath + data.projectName), (data) => ({
    message: `${data.projectName} already exists at the given path.`,
    path: ["projectName"],
}));
exports.NewProjectSchema = NewProjectSchema;
const AtomRespSchema = zod_1.z.object({
    label: zod_1.z.string(),
    isEnum: zod_1.z.coerce.boolean(),
    isLone: zod_1.z.coerce.boolean(),
    isOne: zod_1.z.coerce.boolean(),
    isSome: zod_1.z.coerce.boolean(),
    isAbstract: zod_1.z.coerce.boolean(),
    parents: zod_1.z.string().array().optional(),
    children: zod_1.z.string().array().optional(),
    relations: zod_1.z
        .object({ label: zod_1.z.string(), multiplicity: zod_1.z.string(), type: zod_1.z.string() })
        .array(),
});
exports.AtomRespSchema = AtomRespSchema;
//     Validation rules for db entry.
//     color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Invalid hex color code."),
//     shape: z.enum(['Rectangle', 'Triangle', 'Circle']),
//     projectID: z.number(),
const PredicateRespSchema = zod_1.z.object({
    label: zod_1.z.string(),
    parameters: zod_1.z
        .object({
        label: zod_1.z.string(),
        paramType: zod_1.z.string(),
    })
        .array(),
});
exports.PredicateRespSchema = PredicateRespSchema;
