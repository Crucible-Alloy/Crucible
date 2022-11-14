import React from 'react';
import {Input} from "@mantine/core";
import {IconFileSearch} from "@tabler/icons";
import {useState} from "react";

function FileSelector(props) {

    const [trimmedPath, setTrimmedPath] = useState("");

    function trimFullPath(filePath) {
        let segments = filePath.split('/')
        console.log(segments[-1])
        return segments.pop()
    }

    function handleSelectFile() {
        window.electronAPI.selectFile().then( filePath => {
            console.log(filePath)
            setTrimmedPath(trimFullPath(filePath));
            props.setSelectedFile(filePath);
        })
    }

    return (
        <>
            <Input.Wrapper
                required
                labelElement="div"
                label={"Primary Alloy File"}
                description={"Select the Alloy file you wish to test."}
            >
                <Input icon={<IconFileSearch />} onClick={handleSelectFile} value={trimmedPath}/>
            </Input.Wrapper>
            <br />
        </>
    );
}

export default FileSelector;