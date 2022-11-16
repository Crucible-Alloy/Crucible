import {useEffect, useRef, useState} from 'react'
import {useDrag, useDrop} from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {ATOM, CONNECTION} from '../../utils/constants'
import {ActionIcon, Group, HoverCard, Paper, Text, Button, TextInput, MantineTheme, useMantineTheme} from "@mantine/core";
import {AtomOutPort} from "./AtomOutPort";
import {AtomInPort} from "./AtomInPort";
import {IconAlertTriangle, IconTrash} from "@tabler/icons";
import {AtomV2} from "./AtomV2";
import {showNotification} from "@mantine/notifications";
const { v4: uuidv4 } = require('uuid');

export function AtomContents({ id, left, top, sourceAtomKey, projectKey, testKey}) {
    const outPort = useRef();
    const inPort = useRef();

    const [atomData, setAtomData] = useState(initializeAtom);
    const [metaData, setMetaData] = useState(initializeMetaData);

    const [connectorActive, setConnectorActive] = useState(false);
    const [position, setPosition] = useState({});

    const [acceptTypes, setAcceptTypes] = useState([]);

    const renderType = ATOM;
    const theme = useMantineTheme();

    useEffect( () => {
        window.electronAPI.listenForMetaDataChange((_event, value) => {
            window.electronAPI.getAtom(projectKey, sourceAtomKey).then(atom => {
                setMetaData(atom);
            })
        })
    }, []);

    useEffect( () => {
        window.electronAPI.getAcceptTypes(projectKey, sourceAtomKey).then(types => {
            setAcceptTypes(types);
        })
    }, []);

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, []);

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: ATOM,
            item: {id, left, top, sourceAtomKey, projectKey, renderType, atomData, metaData},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id, left, top, sourceAtomKey, projectKey, renderType, atomData, metaData],
    )

    const [{isOver, canDrop}, drop] = useDrop(
        () => ({
            accept: acceptTypes,
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
            drop(item, monitor) {
                const delta = monitor.getDifferenceFromInitialOffset()
                let left = Math.round(item.left + delta.x)
                let top = Math.round(item.top + delta.y)
                console.log(top);

                if (item.renderType === CONNECTION) {
                    console.log("Attempted connection")
                    addNewConnection(sourceAtomKey, id, metaData.label, atomData.nickname, item.sourceAtomKey, item.id, item.metaData.label, item.atomData.nickname)
                }

                return undefined
            },
        }),
        [createConnection],
    )

    function createConnection(fromAtom, toAtom, fromAtomLabel, toAtomLabel, connectionLabel) {
        window.electronAPI.makeConnection(projectKey, testKey, fromAtom, toAtom, fromAtomLabel, toAtomLabel, connectionLabel);
    }

    function addNewConnection(sourceAtomKey, toAtom, toAtomLabel, toNickname, fromAtomSource, fromAtom, fromAtomLabel, fromNickname) {
        let eligibleToAdd = true;
        let connectionsArray = [];
        let foundMultiplicity;
        let targetLabels = [];
        fromAtomLabel = fromAtomLabel.split('/')[1]
        toAtomLabel = toAtomLabel.split('/')[1]

        // Get connections of the originating atom
        window.electronAPI.getConnections(projectKey, testKey, fromAtom).then(connections => {
            connectionsArray = connections;
        })

        window.electronAPI.getAtom(projectKey, sourceAtomKey).then(atom => {
            targetLabels = [atom.label, ...atom.parents]
            console.log(targetLabels)
        })

        // Get relations of the originating atom
        window.electronAPI.getRelations(projectKey, fromAtomSource).then(relations => {
            let connectionName;

            relations.forEach(function(relation) {
                // Find the correct relation via source key of the receiving atom and check the multiplicity
                targetLabels.forEach(label => {
                    if (relation.related_label === label) {
                        connectionName = relation["label"];
                        if (relation["multiplicity"] === "lone" || relation["multiplicity"] === "one") {
                            console.log("Multiplicity is one")
                            // Parse connections array and compare if there is already a connection with a label matching 'related_label'
                            connectionsArray.forEach(function(connection) {
                                console.log("To Label: " + connection["toLabel"])
                                console.log("Related Label: " + relation["related_label"])
                                if (connection["connectionLabel"] === relation["label"]) {
                                    // Matching connection had been found, alert user of multiplicity violation.
                                    console.log("Found a match!")
                                    eligibleToAdd = false;
                                    foundMultiplicity = relation["multiplicity"];
                                }
                            })
                        }
                    }
                })
            })

            if (eligibleToAdd) {
                console.log(testKey);
                createConnection(fromAtom, toAtom, fromAtomLabel, toAtomLabel, fromNickname, toNickname, connectionName);
            } else {
                showNotification({
                    title: "Cannot add connection",
                    message: `Adding that connection would exceed it's ${foundMultiplicity} multiplicity.`,
                    color: "red",
                    icon: <IconAlertTriangle/>
                });
            }
        })
    }

    function getAtomStyles(theme, shape, left, top) {
        const transform = `translate3d(${left}px, ${top}px, 0)`

        return {
            position: 'relative',

            // IE fallback: hide the real node using CSS when dragging
            // because IE will ignore our custom "empty image" drag preview.
            opacity: isDragging ? 0 : 1,
            backgroundColor: canDrop ?  theme.colors.dark[3] : theme.colors.dark[5],
            margin: "auto",
        }
    }

    function initializeAtom() {
        window.electronAPI.getAtomInstance(projectKey, testKey, id).then(atom => {
            setAtomData(atom)
        })
    }

    function initializeMetaData() {
        window.electronAPI.getAtom(projectKey, sourceAtomKey).then(atom => {
            setMetaData(atom);
        })
    }

    function deleteAtom(id) {
        window.electronAPI.deleteAtom(projectKey, testKey, id)
    }

    function deleteConnections(id) {
        window.electronAPI.deleteConnections(projectKey, testKey, id)
    }

   return (metaData && atomData) ? (
                <Paper
                    ref={drag}
                    p="md"
                    radius={"md"}
                    role="DraggableBox"
                    style={getAtomStyles(theme, metaData.shape, left, top)}
                >
                    <Text size={"xl"} color={metaData.color} weight={800} align={'center'}> {atomData.nickname} </Text>
                </Paper>
        ) : (
           <Paper
               ref={drag}
               p="md"
               radius={"md"}
               role="DraggableBox"
               stye={{opacity: isDragging ? 0 : 1}}
           >
               <Text size={"xl"} weight={800}> {} </Text>
           </Paper>
   )
}

