import {CloseButton, Group, Paper, Tabs, Text} from "@mantine/core";
import {ChartDots3, CodePlus} from "tabler-icons-react";
import Atom from "./Atom";
import {useState} from "react";
import TabCanvasContent from "./TabCanvasContent";



function AtomsSidebarTab() {

    const [atoms, setAtoms] = useState([
        {id: 1, title: "List", color: "#CC5DE8"},
        {id: 2, title: "Node", color: "#20C997"}
    ]);

    return (
        <Group p={"lg"}>
            {atoms.map((atom) => (
                <Atom id={atom.id} title={atom.title} color={atom.color} />
            ))}
        </Group>
    );
}

export default AtomsSidebarTab;