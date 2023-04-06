import { Input, Select } from "@mantine/core";
import React from "react";

import { PredicateState } from "./PredicateState";
import { AtomWithSource, PredInstanceWithParams } from "../../main";
import { PredicateParam } from "./PredicateParam";
interface Props {
  predicate: PredInstanceWithParams;
  atoms: AtomWithSource[];
}
export function Predicate({ predicate, atoms }: Props) {
  return (
    <>
      <PredicateState predicate={predicate} />
      {predicate.params.map((param) => (
        <PredicateParam param={param} atoms={atoms} />
      ))}
    </>
  );
}
