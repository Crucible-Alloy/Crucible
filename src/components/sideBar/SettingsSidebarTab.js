import {Button, Group, Input, InputWrapper} from "@mantine/core";
import {IconFileSearch} from "@tabler/icons";
import {useEffect, useState} from "react";


function SettingsSidebarTab({projectKey}) {

    const [projectFile, setProjectFile] = useState();

    useEffect(() => {
        window.electronAPI.getProjectFile(projectKey).then(filePath => {
            setProjectFile(trimFullPath(filePath))
        })
    }, []);

    function trimFullPath(filePath) {
        let segments = filePath.split('/')
        console.log(segments[-1])
        return segments.pop()
    }

    function handleSelectFile() {
        window.electronAPI.updateProjectFile(projectKey).then( filePath => {
            console.log(filePath)
            setProjectFile(trimFullPath(filePath));
        })
    }

    return (
        <Group p={"sm"}>
            <Input.Wrapper
                labelElement="div"
                label={"Project File"}
                description={"Select the Alloy file you wish to test"}
            >
               <Input icon={<IconFileSearch />} onClick={() => handleSelectFile} value={projectFile} />
            </Input.Wrapper>
        </Group>
    )

} export default SettingsSidebarTab;
