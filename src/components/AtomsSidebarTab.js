import {Group} from "@mantine/core";
import {useState} from "react";
import {AtomSource} from "./AtomSource";
import {v4 as uuidv4} from "uuid";
import {useEffect} from "react";

function AtomsSidebarTab({ projectKey }) {

    const [atoms, setAtoms] = useState([]);

    useEffect(() => {
        window.electronAPI.getAtoms(projectKey).then(atoms => {
            setAtoms(atoms)
        })
    }, );

    return (
        <Group p={"lg"}>

            {atoms.map((label) => (
                <AtomSource id={uuidv4()} label={label} />
            ))}
        </Group>
    );
}

export default AtomsSidebarTab;