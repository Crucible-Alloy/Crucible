import {Center, Group, Loader, ScrollArea, Stack, Text, Title} from "@mantine/core";
import {useState} from "react";
import {AtomSourceItem} from "../atoms/AtomSourceItem";
import {useEffect} from "react";
import {SIDEBAR_HEIGHT} from "../../utils/constants";

function AtomsSidebarTab({ projectKey }) {

    const [atoms, setAtoms] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAtoms = () => {
        setLoading(true)
        window.electronAPI.getAtomSources(projectKey).then(atoms => {
            if (atoms.length > 0) {
                setAtoms(atoms)
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        getAtoms();
    }, []);

    if (loading) {
        return (
            <Stack sx={{marginTop: "40%"}}>
                <Center>
                        <Title order={4} color={'dimmed'}>Loading atoms...</Title>
                </Center>
                <Center>
                    <Loader/>
                </Center>
            </Stack>
        )
    } else {
        return (
            <ScrollArea style={{height: SIDEBAR_HEIGHT}}>
                <Group p={"lg"}>

                    {Object.entries(atoms).map(([key, value]) => (
                        value["isAbstract"] ?
                            <></> :
                            <AtomSourceItem label={value["label"]} color={value["color"]} sourceAtomKey={key} projectKey={projectKey} atom={ value } top={0} left={0}/>
                    ))}
                </Group>
            </ScrollArea>
        );
    }
}

export default AtomsSidebarTab;