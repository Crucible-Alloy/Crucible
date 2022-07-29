import {Group} from "@mantine/core";
import {useState} from "react";
import {AtomSource} from "./AtomSource";
import {v4 as uuidv4} from "uuid";
import {useEffect} from "@types/react";

function AtomsSidebarTab({ project }) {

    const [atoms, setAtoms] = useState([]);

    useEffect(() => {
        window.electronAPI.getAtoms(project.key).then(atoms => {
            setAtoms(atoms)
        })
    }, );

    return (
        // TODO: UNPACK ATOMS AS LIST FROM API INSTEAD OF MAP
        <Group p={"lg"}>
            {Object.keys(atoms).map((key) => (
                <AtomSource key={key} id={key} label={} {...atoms[key]} />
            ))}
        </Group>
    );
}

export default AtomsSidebarTab;