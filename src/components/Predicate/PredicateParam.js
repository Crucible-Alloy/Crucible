"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredicateParam = void 0;
const core_1 = require("@mantine/core");
const react_1 = __importDefault(require("react"));
const zod_1 = require("zod");
function PredicateParam({ param, atoms }) {
    function handleChange(value) {
        let intVal = null;
        if (value)
            intVal = zod_1.z.coerce.number().parse(value);
        window.electronAPI.updatePredParam({
            predParamID: param.id,
            atomID: intVal,
        });
    }
    return (react_1.default.createElement(core_1.Select, { description: `Parameter: ${param.param.label}`, placeholder: "Pick one", value: param.atom ? param.atom.toString() : null, onChange: (value) => handleChange(value), data: 
        // Get the Atom from the canvas that match the type of the parameter
        Object.entries(atoms)
            .filter(([key, atom]) => atom.srcAtom.label === param.param.paramType)
            .map(([key, atom]) => ({
            value: atom.id.toString(),
            label: atom.nickname,
        })) }));
}
exports.PredicateParam = PredicateParam;
