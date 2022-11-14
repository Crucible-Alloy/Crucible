import {Center, Group, Loader, ScrollArea} from "@mantine/core";
import {useState} from "react";
import {AtomSource} from "../atoms/AtomSource";
import {useEffect} from "react";
import {SIDEBAR_HEIGHT} from "../../utils/constants";

function AtomsSidebarTab({ projectKey }) {

    const [atoms, setAtoms] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAtoms = () => {
        setLoading(true)
        window.electronAPI.getAtoms(projectKey).then(atoms => {
            setAtoms(atoms)
            setLoading(false)
        })
    }

    useEffect(() => {
        getAtoms();
    }, []);

    if (loading) {
        return (
            <Center style={{height: 670}}>
                <Loader />
            </Center>
        )
    } else {
        return (
            <ScrollArea style={{height: SIDEBAR_HEIGHT}}>
                <Group p={"lg"}>

                    {Object.entries(atoms).map(([key, value]) => (
                        value["isAbstract"] ?
                            <></> :
                            <AtomSource label={value["label"]} color={value["color"]} sourceAtomKey={key} projectKey={projectKey} atom={ value } top={0} left={0}/>
                    ))}
                </Group>
            </ScrollArea>
        );
    }
}

export default AtomsSidebarTab;