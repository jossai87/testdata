import { FormField, Input, SpaceBetween, Button, StatusIndicator, Select, Box, Container, Header } from "@cloudscape-design/components";
import { useState } from 'react';

interface IDFieldsProps {
  sessionId: string;
  agentId?: string;
  aliasId?: string;
  websocketId?: string;
  onSessionIdChange: (value: string) => void;
  onAgentIdChange: (value: string) => void;
  onAliasIdChange: (value: string) => void;
  onWebsocketIdChange: (value: string) => void;
}

export const IDFields = ({
  sessionId,
  agentId,
  aliasId,
  websocketId,
  onSessionIdChange,
  onAgentIdChange,
  onAliasIdChange,
  onWebsocketIdChange,
}: IDFieldsProps) => {
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState({ label: "Select a sample question", value: "" });

  const sampleQuestions = [
    { 
      label: "Product Recommendations",
      value: "What are the top recommended products in the headphones and speaker categories with high customer satisfaction, and what do customers say about them?"
    },
    {
      label: "Battery Issue",
      value: "I recently ordered an ultrabook pro laptop. After a few months, the battery started having issues. Can you help me understand what might be wrong and recommend some solutions?"
    },
    {
      label: "Smartwatch Issue",
      value: "My smartwatch's time on the screen stopped responding suddenly, even though the battery is fully charged. I tried restarting it, but the issue persists. Could you help me find a solution?"
    },
    {
      label: "Affordable Computer Recommendations",
      value: "I’m interested in an affordable computer for my home office setup. Could you recommend a few popular items that are currently in stock, and let me know if there are any common issues with these products or tips to improve their longevity?"
    }
  ];

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${fieldName} copied!`);
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyStatus('Failed to copy');
    }
  };

  return (
    <div className="left-panel">
      {/* Connection Settings Section */}
      <div className="id-fields-container">
        <Container
          header={
            <Header variant="h2">
              ID Configuration
            </Header>
          }
        >
          <SpaceBetween size="m">
            <FormField label="Session ID">
              <Input
                value={sessionId}
                onChange={({ detail }) => onSessionIdChange(detail.value)}
                placeholder="Enter Session ID"
              />
            </FormField>
            <FormField label="Supervisor Agent ID">
              <Input
                value={agentId ?? ""}
                onChange={({ detail }) => onAgentIdChange(detail.value)}
                placeholder="Enter Agent ID..."
              />
            </FormField>
            <FormField label="Supervisor Alias ID">
              <Input
                value={aliasId ?? ""}
                onChange={({ detail }) => onAliasIdChange(detail.value)}
                placeholder="Enter Alias ID..."
              />
            </FormField>
            <FormField label="Websocket ID">
              <Input
                value={websocketId ?? ""}
                onChange={({ detail }) => onWebsocketIdChange(detail.value)}
                placeholder="Enter Websocket ID..."
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </div>

      {/* Sample Questions Section */}
      <div className="navigation-container">
        <Container
          header={
            <Header variant="h2">
              Sample Questions
            </Header>
          }
        >
          <SpaceBetween size="m">
            <FormField label="Select a Sample Question">
              <Select
                selectedOption={selectedQuestion}
                onChange={({ detail }) => setSelectedQuestion(detail.selectedOption)}
                options={sampleQuestions}
                placeholder="Choose a sample question"
              />
            </FormField>
            {selectedQuestion.value && (
              <Button
                onClick={() => copyToClipboard(selectedQuestion.value, "Sample question")}
                iconName="copy"
              >
                Copy question
              </Button>
            )}
            {copyStatus && <StatusIndicator type="success">{copyStatus}</StatusIndicator>}
          </SpaceBetween>
        </Container>
      </div>
    </div>
  );
};
