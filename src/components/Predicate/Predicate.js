"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Predicate = void 0;
const react_1 = __importDefault(require("react"));
const PredicateState_1 = require("./PredicateState");
const PredicateParam_1 = require("./PredicateParam");
function Predicate({ predicate, atoms }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(PredicateState_1.PredicateState, { predicate: predicate }),
        predicate.params.map((param) => (react_1.default.createElement(PredicateParam_1.PredicateParam, { param: param, atoms: atoms })))));
}
exports.Predicate = Predicate;
