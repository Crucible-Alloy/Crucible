import { Select } from "@mantine/core";
import React from "react";
import { Atom, PredInstanceParams, PredParam } from "@prisma/client";
import { AtomWithSource, PredParamWithSource } from "../../main";
import { z } from "zod";

interface Props {
  param: PredParamWithSource;
  atoms: AtomWithSource[];
}
export function PredicateParam({ param, atoms }: Props) {
  function handleChange(value: string | null) {
    let intVal = null;
    if (value) intVal = z.coerce.number().parse(value);
    window.electronAPI.updatePredParam({
      predParamID: param.id,
      atomID: intVal,
    });
  }

  return (
    <Select
      description={`Parameter: ${param.param.label}`}
      placeholder="Pick one"
      value={param.atom ? param.atom.toString() : null}
      onChange={(value) => handleChange(value)}
      data={
        // Get the Atom from the canvas that match the type of the parameter
        Object.entries(atoms)
          .filter(([key, atom]) => atom.srcAtom.label === param.param.paramType)
          .map(([key, atom]) => ({
            value: atom.id.toString(),
            label: atom.nickname,
          }))
      }
    />
  );
}
