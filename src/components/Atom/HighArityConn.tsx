import React, {useEffect, useState} from 'react';
import {AtomSourceWithRelations, AtomWithSource} from "../../main";
import {useDrag} from "react-dnd";
import {ActionIcon, Group} from "@mantine/core";
import {IconArrowRight, IconLink} from "@tabler/icons";
import {Relation} from "@prisma/client";

interface Props {
  color: string;
  name: string;
  atom: AtomWithSource;
  relation: Relation;
  toggleModal: (val: boolean) => void;
  setFrom: (val: AtomWithSource) => void;
}

function HighArityConn({color, name, atom, relation, toggleModal, setFrom}: Props) {

  const [metaData, setMetaData] = useState<AtomSourceWithRelations>(
    atom.srcAtom
  );
  const [atomTypes, setAtomTypes] = useState([atom.srcAtom.label]);

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


  function handleOpenModal() {
    toggleModal(true)
    setFrom(atom)
  }

  return (
    <Group spacing={'xs'} sx={{height: '32px', color: 'white', fontSize: '12px'}}>
      {name} : {relation.multiplicity.split(' ')[0]}
      <IconArrowRight height={12}/>
      {relation.toLabel.split('/').at(-1)}
      <ActionIcon size={20} onClick={() => handleOpenModal()} id={atom.id.toString() + relation.label} color={color} variant={"subtle"}><IconLink/></ActionIcon>
    </Group>
  );
}

export default HighArityConn;