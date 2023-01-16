import React, { useState } from "react";
import { ActionIcon, Avatar, Grid, Group, Text } from "@mantine/core";
import { IconSettings, IconTrash } from "@tabler/icons";
import { Project } from "@prisma/client";
import DeleteProjectModal from "./DeleteProjectModal";

interface Props {
  project: Project;
}

function ProjectListItem({ project }: Props) {
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <>
      <Grid
        p={"xs"}
        sx={(theme) => ({
          borderRadius: theme.radius.sm,
          "&:hover": {
            cursor: "pointer",
            backgroundColor: theme.colors.gray[2],
          },
        })}
      >
        <Grid.Col
          span={"auto"}
          onClick={() => {
            window.electronAPI.openProject(project.id);
          }}
        >
          <Group
            position={"left"}
            styles={(theme) => ({
              root: {
                borderRadius: 8,
                maxHeight: 60,
                width: 320,
                whitespace: "nowrap",
                textOverflow: "ellipsis",
                "&:hover": {
                  backgroundColor: theme.colors.gray[2],
                },
              },
            })}
          >
            <Avatar size={30} color="blue">
              {project.name.charAt(0)}
            </Avatar>
            <Text p={0} m={0}>
              {project.name}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group position={"right"}>
            <ActionIcon color={"gray"} variant={"subtle"} size={20}>
              <IconSettings />
            </ActionIcon>
            <ActionIcon
              color={"gray"}
              variant={"subtle"}
              size={20}
              onClick={() => {
                setDeleteModal(true);
              }}
            >
              <IconTrash />
            </ActionIcon>
          </Group>
        </Grid.Col>
      </Grid>
      <DeleteProjectModal
        setModalOpened={setDeleteModal}
        opened={deleteModal}
        project={project}
      />
      {/* TODO: Project Settings Modal
                - Rename project
                - Associate to project file */}
    </>
  );
}

export default ProjectListItem;
