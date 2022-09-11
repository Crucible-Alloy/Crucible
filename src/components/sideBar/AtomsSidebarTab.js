import {Center, Group, Loader} from "@mantine/core";
import {useState} from "react";
import {AtomSource} from "../atoms/AtomSource";
import {useEffect} from "react";

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
            <Group p={"lg"}>

                {Object.entries(atoms).map(([key, value]) => (
                    <AtomSource label={value["label"]} color={value["color"]} sourceAtomKey={key} projectKey={projectKey} atom={ value } top={0} left={0}/>
                ))}
            </Group>
        );
    }
}

export default AtomsSidebarTab;