import React from 'react';
import PropTypes from 'prop-types';
import {Paper, Text} from "@mantine/core";
import {CodePlus} from "tabler-icons-react";
import {useDrag} from "react-dnd";

function Atom({id, title, color}) {
    const [{ isDragging }, drag] = useDrag(() => ({
            type: "Atom",
            item: {id: id,
                   title: title,
                   color: color},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            })
        }),
    )

    return (
        <Paper
            ref={drag}
            shadow="md"
            p="md"
            radius={"md"}
            sx={(theme) => ({
                backgroundColor: theme.colors.dark[5],
                border: `solid 6px ${color}`,
                width: 200,
            })}
        >
            <Text color={color} size={"xl"} weight={"800"}>{title} <CodePlus /></Text>
        </Paper>
    );

}

export default Atom;
