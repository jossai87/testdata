import { Box, Container, Header } from "@cloudscape-design/components";
import { IDFields } from "../components/IDFields";
import { useState } from "react";
import { useIDSettings } from "../hooks/useStorage";

export const Settings = () => {
    const [sessionId, setSessionId] = useState("");
    const { getStoredSettings, saveSettings } = useIDSettings();
    const [idSettings, setIdSettings] = useState(getStoredSettings());

    const handleAgentIdChange = (value: string) => {
        const newSettings = { ...idSettings, agentId: value };
        setIdSettings(newSettings);
        saveSettings(newSettings);
    };

    const handleAliasIdChange = (value: string) => {
        const newSettings = { ...idSettings, aliasId: value };
        setIdSettings(newSettings);
        saveSettings(newSettings);
    };

    return (
        <Box padding={'s'}>
            <Container
                header={
                    <Header
                        variant="h2"
                        description="Fine tune LLM settings"
                    >
                        Chat Settings
                    </Header>
                }
            >
                <IDFields
                    sessionId={sessionId}
                    agentId={idSettings.agentId}
                    aliasId={idSettings.aliasId}
                    websocketId={idSettings.websocketId || ""}
                    onSessionIdChange={setSessionId}
                    onAgentIdChange={handleAgentIdChange}
                    onAliasIdChange={handleAliasIdChange}
                    onWebsocketIdChange={(value) => {
                        const newSettings = { ...idSettings, websocketId: value };
                        setIdSettings(newSettings);
                        saveSettings(newSettings);
                    }}
                />
            </Container>
        </Box>
    )
}