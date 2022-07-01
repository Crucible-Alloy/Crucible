import {Box, Container, Group, Text} from "@mantine/core";
import TestPlayBtn from "./TestPlayBtn";
import TestSettingsBtn from "./TestSettingsBtn";
import {useState} from "react";
import {useDrop} from "react-dnd";
import Atom from "./Atom";

function TabCanvasContent ({tab}) {

    const [canvas, setCanvas] = useState([]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "Atom",
        drop: (item) => addAtomToCanvas(item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        })
    }))

    const addAtomToCanvas = (item) => {
        setCanvas(canvas => [...canvas, item]);
    }

    return (
        <>
            <Group pb={"xs"}>
                <TestPlayBtn />
                <TestSettingsBtn tab={tab} />
            </Group>

            <Box
                ref={drop}
                color={"white"}
                className={"canvas"}
            >
                {canvas.map((atom) => (
                    <Atom id={atom.id} title={atom.title} color={atom.color} />
                ))}
            </Box>
        </>
    );
}

export default TabCanvasContent;