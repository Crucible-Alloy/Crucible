import React from 'react';
import {Input, InputWrapper} from "@mantine/core";
import {FileSearch} from "tabler-icons-react";
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
            <InputWrapper
                required
                labelElement="div"
                label={"Primary Alloy File"}
                description={"Select the Alloy file you wish to test."}
            >
                <Input icon={<FileSearch />} onClick={handleSelectFile} value={trimmedPath}/>
            </InputWrapper>
            <br />
        </>
    );
}

export default FileSelector;