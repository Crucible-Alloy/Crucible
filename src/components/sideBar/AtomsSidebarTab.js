import {Group} from "@mantine/core";
import {useState} from "react";
import {AtomSource} from "../AtomSource";
import {v4 as uuidv4} from "uuid";
import {useEffect} from "react";

function AtomsSidebarTab({ projectKey }) {

    const [atoms, setAtoms] = useState([]);

    useEffect(() => {
        getAtoms();
    }, []);

    const getAtoms = () => {
        window.electronAPI.getAtoms(projectKey).then(atoms => {
            setAtoms(atoms)
        })
    }


    return (
        <Group p={"lg"}>

            {Object.entries(atoms).map(([key, value]) => (
                <AtomSource id={uuidv4()} label={value["label"]} color={value["color"]} top={0} left={0} />
            ))}
        </Group>
    );
}

export default AtomsSidebarTab;