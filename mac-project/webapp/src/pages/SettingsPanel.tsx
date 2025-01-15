import { useMemo, useState } from "react";
import { Box, Container, FormField, Header, Select, SelectProps, Slider, SpaceBetween } from "@cloudscape-design/components"
import { useAtom } from "jotai";
import { currentSettingsIndexAtom, settingsAtom, SettingsType } from "../atoms/SettingsAtom";
import { transactionAtom } from "../atoms/AppAtoms";
import { useSetAtom } from "jotai/react";

export const SettingsPanel = () => {
    const [transaction, setTransaction] = useAtom(transactionAtom)

    const [selectedModel, setSelectedModel] = useState<SelectProps.Option>({
        label: "Claude 3 Haiku",
        value: "anthropic.claude-3-haiku-20240307-v1:0"
    });

    const [settings, setSettings] = useAtom<SettingsType[]>(settingsAtom);
    const [, setCurrentSettingsIndex] = useAtom(currentSettingsIndexAtom)

    const modelSettings = useMemo(() => settings.find(i => i.model.label === selectedModel.label), [selectedModel, settings])

    const updateSettings = (selectedSettings: SettingsType) => {
        const index = settings.findIndex(i => i.model.label === selectedSettings.model.label);
        setCurrentSettingsIndex(index);
        const updatedSettings = settings.slice();
        updatedSettings.splice(index, 1, selectedSettings);
        setSettings(updatedSettings);
        setTransaction({ ...transaction, settings: updatedSettings[0] })
    }

    return (
        <Box padding={'s'}>
            <Container
                header={
                    <Header
                        variant="h2"
                        description="LLM settings for description generation"
                    >
                        Description Settings
                    </Header>
                }
            >
                <SpaceBetween size="xl" direction="vertical">
                    <Select
                        placeholder="Select a LLM Model"
                        selectedOption={selectedModel}
                        onChange={({ detail }) =>
                            setSelectedModel(detail.selectedOption)

                        }
                        options={settings.map(i => i.model)}
                    />


                    {modelSettings?.temperature &&
                        <FormField
                            label="Temperature"
                            description="Controls the randomness of predictions made by the model. Use a lower value to decrease randomness in the response."
                        >
                            <Slider aria-label="temp" min={0.1} max={1.0} step={0.1} value={modelSettings.temperature ?? 0.0} onChange={({ detail }) => {
                                updateSettings({
                                    ...modelSettings,
                                    temperature: detail.value
                                })
                            }} />
                        </FormField>}


                    {modelSettings?.top_k &&
                        <FormField
                            label="Top K"
                            description="The number of most-likely candidates that the model considers for the next token. Choose a lower value to decrease the size of the pool and limit the options to more likely outputs."
                        >
                            <Slider aria-label="top_k" min={0.1} max={1.0} step={0.1} value={modelSettings.top_k ?? 0.0} onChange={({ detail }) => {
                                updateSettings({
                                    ...modelSettings,
                                    top_k: detail.value
                                })
                            }} />
                        </FormField>}

                    {modelSettings?.top_p &&
                        <FormField
                            label="Top P"
                            description="The percentage of most-likely candidates that the model considers for the next token. Choose a lower value to decrease the size of the pool and limit the options to more likely outputs."
                        >
                            <Slider aria-label="top-p" min={0.1} max={1.0} step={0.1} value={modelSettings.top_p ?? 0.0} onChange={({ detail }) => {
                                updateSettings({
                                    ...modelSettings,
                                    top_p: detail.value
                                })
                            }} />
                        </FormField>}

                    {modelSettings?.k &&
                        <FormField
                            label="K"
                            description="The number of nearest neighbors returned from the semantic search."
                        >
                            <Slider aria-label="k" min={0.1} max={1.0} step={0.1} value={modelSettings.k ?? 0.0} onChange={({ detail }) => {
                                updateSettings({
                                    ...modelSettings,
                                    k: detail.value
                                })
                            }} />
                        </FormField>}


                    {modelSettings?.max_tokens &&
                        <FormField
                            label="Max Tokens"
                            description="Best left to default. Specify the maximum number of tokens to use in the generated response. The model truncates the response once the generated text exceeds max_tokens."
                        >
                            <Slider aria-label="max_token" min={1} max={4096} step={10} value={modelSettings.max_tokens ?? 1} onChange={({ detail }) => {
                                updateSettings({
                                    ...modelSettings,
                                    max_tokens: detail.value
                                })
                            }} />

                        </FormField>}

                </SpaceBetween>
            </Container>
        </Box>


    )
}