import {IconEqual, IconEqualNot, IconEyeOff, IconZoomCode } from "@tabler/icons";
import {Modal, Title, Text, SegmentedControl, Center, Box, Input, Tooltip, ActionIcon, Select} from "@mantine/core";
import React, {useEffect, useState} from "react";

function TestPredicatesBtn ({projectKey, testKey}) {

    const [opened, setOpened] = useState(false);
    const [predicates, setPredicates] = useState({});
    const [canvasAtoms, setCanvasAtoms] = useState(loadCanvasAtoms);

    useEffect(() => {
        return () => {
            window.electronAPI.getPredicates(projectKey).then(predicates => {
                setPredicates(predicates)
            })
        };
    }, []);

    useEffect( () => {
        window.electronAPI.listenForPredicatesChange((_event, value) => {
            window.electronAPI.getPredicates(projectKey).then(predicates => {
                console.log(predicates)
                setPredicates(predicates)
            })
        })
    }, []);

    useEffect( () => {
        window.electronAPI.listenForCanvasChange((_event, value) => {
            loadCanvasAtoms()
        })
    }, []);

    function loadCanvasAtoms() {
        window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
            setCanvasAtoms(data.atoms)
        })
    }

    function updatePredicate(predicateName, predicate) {
        window.electronAPI.setPredicate(projectKey, predicateName, predicate)
    }


    function setPredicateMode(value, predicateName) {
        let predicate = Object.fromEntries(Object.entries(predicates).filter(([key, value]) => (key === predicateName)))
        predicate[predicateName].status = value;
        window.electronAPI.setPredicate(projectKey, predicateName, predicate[predicateName])
    }

    function setPredicateParams(predicateName, paramlabel, value) {
        let predicate = Object.fromEntries(Object.entries(predicates).filter(([key, value]) => (key === predicateName)))
        // TODO: fix this shit!
        window.electronAPI.setPredicate(projectKey, predicateName, predicate[predicateName]);
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title={<Title size={"md"}>Predicates</Title>}
            >

                <Text size={"xs"} color={"dimmed"}>
                    Select a mode for the predicates you'd like to test.
                </Text>
                <br/>
                {Object.entries(predicates).map(([key, value]) =>
                    <Input.Wrapper label={key} description={"Test Mode"} mt={"xs"}>
                        <SegmentedControl
                            size={"xs"}
                            mt={"xs"}
                            mb={"sm"}
                            value={value['status']}
                            onChange={(value) => setPredicateMode(value, key)}
                            data={[{
                                label: (
                                    <Center>
                                        <IconEyeOff size={16} />
                                        <Box ml={10}>Don't Test</Box>
                                    </Center>
                                ), value: 'null' },
                                {label: (
                                        <Center>
                                            <IconEqual size={16} />
                                            <Box ml={10}>Equals</Box>
                                        </Center>
                                    ), value: 'equals' },
                                {label: (
                                        <Center>
                                            <IconEqualNot size={16} />
                                            <Box ml={10}>Not Equals</Box>
                                        </Center>
                                    ), value: 'negate' },
                            ]}
                        />
                        {value['params'].map(param =>
                                <Select description={`Parameter: ${param.label}`}
                                    placeholder="Pick one"
                                    value={param.atom}
                                    onSelect={(event) => setPredicateParams(key, param.label, event.currentTarget.value)}
                                    data={
                                        // Get the atoms from the canvas that match the type of the parameter
                                        Object.entries(canvasAtoms).filter(([key, atom]) => {
                                            return (atom.atomLabel === param.paramType.split('/')[1])
                                        }).map(([key, atom]) => (
                                                {value: atom.nickname, label: atom.nickname}
                                        )
                                    )}
                                />
                        )}
                    </Input.Wrapper>
                )}
            </Modal>
            <Tooltip label={"Predicates"} position={"bottom"}>
            <ActionIcon
                color={"blue"}
                variant={"light"}
                onClick={() => setOpened(true)}>
                <IconZoomCode size={20}/>
            </ActionIcon>
            </Tooltip>
        </>
    );
}

export default TestPredicatesBtn;