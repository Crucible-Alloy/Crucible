import {useEffect, useRef, useState} from 'react'
import {useDrag, useDrop} from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {ATOM, ATOM_SOURCE, CONNECTION} from '../../utils/constants'
import {Group, Paper, Text} from "@mantine/core";
import {snapToGrid as doSnapToGrid} from "../examples/SnapToGrid";
import update from "immutability-helper";
import {showNotification} from "@mantine/notifications";
import {IconAlertTriangle} from "@tabler/icons";
const { v4: uuidv4 } = require('uuid');

function getStyles(left, top, isDragging) {
    const transform = `translate3d(${left}px, ${top}px, 0)`
    return {
        position: 'absolute',
        transform,
        WebkitTransform: transform,
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : '',
    }
}
export function AtomInPort({ projectKey, testKey, atomId, atomColor, acceptTypes, sourceAtomKey, atomLabel, nickname}) {
    const inPort = useRef();

    const [position, setPosition] = useState({});

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
                    console.log("Existing atom dragged.")
                    addNewConnection(sourceAtomKey, atomId, atomLabel, nickname, item.sourceAtomKey, item.atomId, item.atomLabel, item.nickname)
                }

                return undefined
            },
        }),
        [createConnection],
    )

    return (
        <div
            ref={drop}
            className={"inPort"}
            role="ConnectionArrow"
        >
                    <Paper
                        ref={inPort}
                        className={"connectPoint"}
                        sx={(theme) => ({
                            position: "relative",
                            top: 0,
                            left: 0,
                            height: "24px",
                            width: "24px",
                            borderRadius: "100%",
                            border: `solid 6px ${canDrop ?  "green" : atomColor}`,
                            backgroundColor: theme.colors.dark[5],

                            '&:hover': {
                                backgroundColor: `${atomColor}`
                            }

                        })} />
        </div>
    )
}