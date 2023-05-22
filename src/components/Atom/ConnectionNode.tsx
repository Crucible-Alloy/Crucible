import React, { useEffect, useRef, useState } from "react";
import { Group, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons";
import { useDrag } from "react-dnd";
import { CONNECTION } from "../../utils/constants";
import { AtomSourceWithRelations } from "../../main";
import { Relation } from "@prisma/client";
import {getEmptyImage} from "react-dnd-html5-backend";

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
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

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
      canDrag: isEnabled,
    }),
    [atom, metaData, isEnabled]
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

  useEffect(() => {
    if (relation.arityCount > 2) {
      console.log("Depends on: ", relation.dependsOn)
      console.log(atom)
      window.electronAPI.connectionNodeEnabled(
        {relationDependsOn: relation.dependsOn, atomID: atom.id}
      ).then((resp: boolean) => {
        console.log('Got depends on response.')
        setIsEnabled(resp)
      })

    } else {
      setIsEnabled(true)
    }
  }, [atom]);


  return (
    <Group spacing={'xs'} sx={{height: '32px', color: isEnabled ? 'white' : 'gray', fontSize: '12px'}}>
      {name} : {relation.multiplicity.split(' ')[0]}
      <IconArrowRight height={12}/>
      {relation.toLabel.split('/').at(-1)}
      <div className={'connectionNode'} id={atom.id.toString() + relation.label} ref={drag} style={{backgroundColor: isEnabled ? 'white' : 'dark-gray', border: `4px solid ${ isEnabled ? atom.srcAtom.color : 'gray'}`}} />
    </Group>
  );
}

export default ConnectionNode;