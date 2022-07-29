import {Button, Group, Input, InputWrapper} from "@mantine/core";
import {FileSearch} from "tabler-icons-react";
import {useEffect, useState} from "react";


function SettingsSidebarTab({project}) {

    const [projectFile, setProjectFile] = useState();

    useEffect(() => {
        window.electronAPI.getProjectFile(project.key).then(filePath => {
            setProjectFile(trimFullPath(filePath))
        })
    }, );

    function trimFullPath(filePath) {
        let segments = filePath.split('/')
        console.log(segments[-1])
        return segments.pop()
    }

    function handleSelectFile() {
        window.electronAPI.setProjectFile(project.key).then( filePath => {
            console.log(filePath)
            setProjectFile(trimFullPath(filePath));
        })
    }

    return (
        <Group p={"sm"}>
            <InputWrapper
                labelElement="div"
                label={"Project File"}
                description={"Select the Alloy file you wish to test"}
            >
               <Input icon={<FileSearch />} onClick={handleSelectFile} value={projectFile} />
            </InputWrapper>
        </Group>
    )

} export default SettingsSidebarTab;
