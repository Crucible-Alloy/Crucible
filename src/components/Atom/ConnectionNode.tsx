import React, { useEffect, useRef, useState } from "react";
import { Group, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons";
import { useDrag } from "react-dnd";
import { CONNECTION } from "../../utils/constants";
import { AtomSourceWithRelations } from "../../main";
import { Relation } from "@prisma/client";

interface Props {
  color: string;
  name: string;
  atom: any;
  relation: Relation;
}
function ConnectionNode({color, name, atom, relation}: Props) {

  const renderType = CONNECTION;
  const [metaData, setMetaData] = useState<AtomSourceWithRelations>(
    atom.srcAtom
  );
  const [atomTypes, setAtomTypes] = useState([atom.srcAtom.label]);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: atom.srcAtom.label,
      item: {
        renderType,
        data: atom,
        metaData,
        relation,
        types: atomTypes,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [atom, metaData]
  );

  useEffect(() => {
    window.electronAPI.listenForMetaDataChange(() => {
      window.electronAPI
        .getAtomSource(atom.srcID)
        .then((srcAtom: AtomSourceWithRelations) => {
          setMetaData(srcAtom);
        });
    });
    const parentAtoms = atom.srcAtom.isChildOf.map(
      (parent: any) => parent.parentLabel
    );
    setAtomTypes([...atomTypes, ...parentAtoms]);
  }, []);

  return (
    <Group spacing={'xs'} sx={{height: '32px', color: 'white', fontSize: '12px'}}>
      {name} : {relation.multiplicity.split(' ')[0]}
      <IconArrowRight height={12}/>
      {relation.toLabel.split('/').at(-1)}
      <div className={'connectionNode'} ref={drag} style={{backgroundColor: 'white', border: `4px solid ${atom.srcAtom.color}`}} />
    </Group>
  );
}

export default ConnectionNode;