import {Group} from "@mantine/core";
import {useState} from "react";
import {AtomSource} from "./AtomSource";
import {v4 as uuidv4} from "uuid";
import {ItemTypes} from "./ItemTypes";



function AtomsSidebarTab() {

    const [atoms, setAtoms] = useState({
        [uuidv4()]: {title: "List", color: "#CC5DE8", top: 40, left: 40},
        [uuidv4()]: {title: "Node", color: "#20C997", top: 0, left: 0}
    });

    return (
        <Group p={"lg"}>
            {Object.keys(atoms).map((key) => (
                <AtomSource key={key} id={key} {...atoms[key]} />
            ))}
        </Group>
    );
}

export default AtomsSidebarTab;