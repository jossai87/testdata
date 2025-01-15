import React, { useState, useEffect, useRef } from 'react';
import { useSSMParameter } from '../hooks/useSSMParameter';
import { Button, Box, Spinner, ExpandableSection, Popover, Tabs, AppLayout } from '@cloudscape-design/components';
import { IDFields } from '../components/IDFields';
import '../Chatbot.css';
import '../chatbot-layout.css';
import '../styles/layout.css';
import '../styles/components.css';
import Documents from './Documents';  
import Workflow from './Workflow';  // Assuming it's in the same directory



type Message = {
  sender: 'user' | 'bot';
  text: string;
  type: 'user' | 'chunk' | 'trace-group' | 'final';
  dropdownTitle?: string;
  tasks?: Task[];
  startTime?: number;
  sessionId?: string;
  agentId?: string;
  aliasId?: string;
};

type Task = {
  title: string;
  content: string | object;
  fullJson?: string;
  timestamp: number;
  subTasks?: Task[];
};

const Chatbot: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState('MYSESSION');
  const [supervisorValue, setSupervisorValue] = useState(localStorage.getItem('supervisor') || ' / ');
  const supervisorLoading = '';
  const supervisorError = '';
  const [websocketValue, setWebsocketValue] = useState(localStorage.getItem('websocketid') || '');
  const region = 'us-west-2'

  //const [agentId, setAgentId] = useState('Loading...');
  //const [aliasId, setAliasId] = useState('Loading...');
  const [agentId, setAgentId] = useState('');
  const [aliasId, setAliasId] = useState('');
  const [websocketId, setWebsocketId] = useState('');

  useEffect(() => {
    if (supervisorLoading) {
      setAgentId('');
      setAliasId('');
    } else if (supervisorError) {
      console.error('Error loading supervisor parameter:', supervisorError);
      setAgentId('Error loading');
      setAliasId('Error loading');
    } else if (supervisorValue) {
      try {
        const [newAgentId, newAliasId] = supervisorValue.trim().split('/');
        if (!newAgentId || !newAliasId) {
          throw new Error('Invalid parameter format - expected "agentId/aliasId"');
        }
        setAgentId(newAgentId);
        setAliasId(newAliasId);
      } catch (err) {
        console.error('Error parsing supervisor parameter:', err);
        setAgentId('');
        setAliasId('');
      }
    }
    
    // Set websocket ID from stored value
    const storedWebsocketId = localStorage.getItem('websocketid');
    if (storedWebsocketId) {
      setWebsocketId(storedWebsocketId.trim());
    }
  }, [supervisorValue, supervisorLoading, supervisorError]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const currentPromptId = useRef(0);

  useEffect(() => {
    if (!websocketId || websocketId.trim() === '') {
      console.log('WebSocket ID is empty - skipping connection');
      setError('Please enter a valid WebSocket ID to connect.');
      return;
    }

    const wsUrl = `wss://${websocketId.trim()}.execute-api.${region}.amazonaws.com/dev/`;
    
    // Close existing connection if any
    if (ws.current) {
      ws.current.close();
    }
    
    try {
      console.log('Attempting WebSocket connection to:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connection established.');
        setError(null); // Clear any previous connection errors
      };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      if (data.type === 'chunk' && data.content) {
        //handleChunkMessage(data);
      } else if (data.type === 'trace') {
        handleTraceMessage(data);
      } else if (data.type === 'final') {
        handleFinalMessage(data);
        setLoading(false);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection failed. Please check your WebSocket ID and ensure it is correct.');
      setLoading(false);
    };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection. Please check your connection and try again.');
      setLoading(false);
    }

    ws.current.onclose = () => {
      console.log('WebSocket connection closed.');
      setLoading(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [websocketId, region]);

  interface Task {
    title: string;
    content: string | null;
    fullJson: string | null;
    timestamp: number;
  }
  
  interface TraceData {
    type: string;
    content: any;
  }


  // Initialize a counter to keep track of sub-trace steps per traceType
  const traceStepCounter: { [key: string]: number } = {};

  const handleTraceMessage = (data: TraceData): void => {
    const traceContent = data.content;

    let traceType: string = "Unknown Trace";
    let subTraceTitle: string = "";
    let displayContent: string | null = null;
    let fullJsonContent: string | null = null;

    // --------------------------------------------------
    // 1a) agentCollaboratorInvocationOutput scenario
    //     in ROUTING CLASSIFIER trace
    //     (treated like "Observation", no main-step increment)
    // --------------------------------------------------
    if (
      traceContent?.trace?.routingClassifierTrace?.observation
        ?.agentCollaboratorInvocationOutput
    ) {
      const collaboratorOutput =
        traceContent.trace.routingClassifierTrace.observation
          .agentCollaboratorInvocationOutput;
      traceType = collaboratorOutput.agentCollaboratorName || "UnknownAgent";
      subTraceTitle = "Observation";

      const outputText = collaboratorOutput.output?.text;
      displayContent = outputText || "No 'text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 1b) agentCollaboratorInvocationOutput scenario
    //     in ORCHESTRATION trace
    //     (treated like "Observation", no main-step increment)
    // --------------------------------------------------
    else if (
      traceContent?.trace?.orchestrationTrace?.observation
        ?.agentCollaboratorInvocationOutput
    ) {
      const collaboratorOutput =
        traceContent.trace.orchestrationTrace.observation
          .agentCollaboratorInvocationOutput;
      traceType = collaboratorOutput.agentCollaboratorName || "UnknownAgent";
      subTraceTitle = "Observation";

      const outputText = collaboratorOutput.output?.text;
      displayContent = outputText || "No 'text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 2) Final Response (from orchestrationTrace)
    // --------------------------------------------------
    else if (traceContent?.trace?.orchestrationTrace?.observation?.finalResponse) {
      subTraceTitle = "Final Response";
      traceType = traceContent.collaboratorName || "SupervisorAgent";

      const finalResponse =
        traceContent.trace.orchestrationTrace.observation.finalResponse;
      displayContent = finalResponse.text || "No 'text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 2b) Final Response in routingClassifierTrace
    //     (Observation - Final Response, no main-step increment)
    // --------------------------------------------------
    else if (
      traceContent?.trace?.routingClassifierTrace?.observation?.finalResponse
    ) {
      subTraceTitle = "Observation - Final Response";
      traceType = traceContent.collaboratorName || "SupervisorAgent";

      const finalResponse =
        traceContent.trace.routingClassifierTrace.observation.finalResponse;
      displayContent = finalResponse.text || "No 'text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 3) Rationale
    // --------------------------------------------------
    else if (traceContent?.trace?.orchestrationTrace?.rationale) {
      subTraceTitle = "Rationale";
      traceType = traceContent.collaboratorName || "SupervisorAgent";

      const rationale = traceContent.trace.orchestrationTrace.rationale;
      displayContent = rationale.text || "No 'text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 4) Model Invocation Input (pretty-print if JSON)
    // --------------------------------------------------
    else if (traceContent?.trace?.orchestrationTrace?.modelInvocationInput) {
      subTraceTitle = "Invoking Model";
      traceType = traceContent.collaboratorName || "SupervisorAgent";

      const modelInvocationInput =
        traceContent.trace.orchestrationTrace.modelInvocationInput;
      let inputText = modelInvocationInput.text;

      if (inputText) {
        try {
          const parsedJson = JSON.parse(inputText);
          inputText = JSON.stringify(parsedJson, null, 2);
        } catch {
          // If invalid JSON, keep it raw
        }
      }

      displayContent = inputText || "No 'text' content available.";
      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 5) Model Invocation Output (pretty-print if JSON)
    // --------------------------------------------------
    else if (traceContent?.trace?.orchestrationTrace?.modelInvocationOutput) {
      subTraceTitle = "Invoking Model";
      traceType = traceContent.collaboratorName || "SupervisorAgent";

      let rawResponseContent =
        traceContent.trace.orchestrationTrace.modelInvocationOutput?.rawResponse
          ?.content;

      if (rawResponseContent) {
        try {
          const parsedJson = JSON.parse(rawResponseContent);
          rawResponseContent = JSON.stringify(parsedJson, null, 2);
        } catch {
          // If invalid JSON, keep it raw
        }
      }

      displayContent = rawResponseContent || "No 'content' attribute found.";
      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 6) Action Group Invocation Input
    // --------------------------------------------------
    else if (
      traceContent?.trace?.orchestrationTrace?.invocationInput
        ?.actionGroupInvocationInput
    ) {
      subTraceTitle = "Action Group Tool";
      traceType =
        traceContent.collaboratorName ||
        traceContent.trace.orchestrationTrace.invocationInput
          .actionGroupInvocationInput?.actionGroupName ||
        "ActionGroup";

      const actionGroupInvocationInput =
        traceContent.trace.orchestrationTrace.invocationInput
          .actionGroupInvocationInput;
      const valueAttribute =
        actionGroupInvocationInput?.requestBody?.content?.["application/json"]?.[0]
          ?.value;
      displayContent = valueAttribute || "No 'value' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 7) Action Group Invocation Output
    // --------------------------------------------------
    else if (
      traceContent?.trace?.orchestrationTrace?.observation
        ?.actionGroupInvocationOutput
    ) {
      traceType = traceContent.collaboratorName || "ActionGroup";

      const actionGroupOutput =
        traceContent.trace.orchestrationTrace.observation
          .actionGroupInvocationOutput?.text;
      try {
        const parsedOutput = JSON.parse(actionGroupOutput as string);
        const cleanedData = parsedOutput.map((item: any) =>
          item.row?.Data?.map((d: any) => d.VarCharValue).join(" | ")
        );
        displayContent = cleanedData.join("\n") || "No 'text' content available.";
      } catch {
        displayContent = "Invalid JSON format in 'text' attribute.";
      }

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 11b) Agent Collaborator Invocation Input
    //     in ROUTING CLASSIFIER trace
    //     Force under "ROUTING_CLASSIFIER"
    // --------------------------------------------------
    else if (
      traceContent?.trace?.routingClassifierTrace?.invocationInput
        ?.agentCollaboratorInvocationInput
    ) {
      // Force everything under ROUTING_CLASSIFIER
      const agentName =
        traceContent.trace.routingClassifierTrace.invocationInput
          .agentCollaboratorInvocationInput?.agentCollaboratorName ||
        "AgentCollaborator";

      subTraceTitle = `Agent Invocation - ${agentName}`;
      traceType = "ROUTING_CLASSIFIER";

      const inputText =
        traceContent.trace.routingClassifierTrace.invocationInput
          .agentCollaboratorInvocationInput?.input?.text;
      displayContent = inputText || "No 'input.text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 8) Routing Classifier
    //     - if modelInvocationOutput => "Routing Classifier Decision" (pretty-print)
    //     - otherwise => "Classifying Intent" (modelInvocationInput.text, also pretty-print)
    // --------------------------------------------------
    else if (traceContent?.trace?.routingClassifierTrace) {
      if (traceContent.trace.routingClassifierTrace.modelInvocationOutput) {
        subTraceTitle = "Routing Classifier Decision";
        traceType = "ROUTING_CLASSIFIER";

        let rawResponseContent =
          traceContent.trace.routingClassifierTrace.modelInvocationOutput
            ?.rawResponse?.content;
        if (rawResponseContent) {
          try {
            const parsedJson = JSON.parse(rawResponseContent);
            rawResponseContent = JSON.stringify(parsedJson, null, 2);
          } catch {
            // keep raw
          }
        }
        displayContent = rawResponseContent || "No 'content' attribute found.";

        fullJsonContent = JSON.stringify(traceContent, null, 2);
      } else {
        subTraceTitle = "Classifying Intent";
        traceType = "ROUTING_CLASSIFIER";

        let modelInputText =
          traceContent.trace.routingClassifierTrace.modelInvocationInput?.text;

        if (modelInputText) {
          try {
            const parsedJson = JSON.parse(modelInputText);
            modelInputText = JSON.stringify(parsedJson, null, 2);
          } catch {
            // keep raw
          }
        }
        displayContent = modelInputText || "No 'text' content available.";

        fullJsonContent = JSON.stringify(traceContent, null, 2);
      }
    }
    // --------------------------------------------------
    // 9) Knowledge Base Lookup Input
    // --------------------------------------------------
    else if (
      traceContent?.trace?.orchestrationTrace?.invocationInput
        ?.knowledgeBaseLookupInput
    ) {
      subTraceTitle = "Knowledge Base Input";
      traceType = traceContent.collaboratorName || "KnowledgeBase";

      const knowledgeBaseInput =
        traceContent.trace.orchestrationTrace.invocationInput
          .knowledgeBaseLookupInput;
      displayContent = knowledgeBaseInput.text || "No 'text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 10) Knowledge Base Lookup Output
    // --------------------------------------------------
    else if (
      traceContent?.trace?.orchestrationTrace?.observation
        ?.knowledgeBaseLookupOutput
    ) {
      subTraceTitle = "Knowledge Base Response";
      traceType = traceContent.collaboratorName || "KnowledgeBase";

      const knowledgeBaseOutput =
        traceContent.trace.orchestrationTrace.observation
          .knowledgeBaseLookupOutput?.retrievedReferences;
      displayContent =
        knowledgeBaseOutput
          ?.map((reference: any) => reference.content.text)
          .join("\n\n---\n\n") || "No 'text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 11) Agent Collaborator Invocation Input
    //     in ORCHESTRATION trace
    //     Force under "ROUTING_CLASSIFIER"
    // --------------------------------------------------
    else if (
      traceContent?.trace?.orchestrationTrace?.invocationInput
        ?.agentCollaboratorInvocationInput
    ) {
      const agentName =
        traceContent.trace.orchestrationTrace.invocationInput
          .agentCollaboratorInvocationInput?.agentCollaboratorName ||
        "AgentCollaborator";

      subTraceTitle = `Agent Invocation - ${agentName}`;
      traceType = "ROUTING_CLASSIFIER";

      const inputText =
        traceContent.trace.orchestrationTrace.invocationInput
          .agentCollaboratorInvocationInput?.input?.text;
      displayContent = inputText || "No 'input.text' content available.";

      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }
    // --------------------------------------------------
    // 12) Otherwise, if we have a collaboratorName
    // --------------------------------------------------
    else if (traceContent.collaboratorName) {
      traceType = traceContent.collaboratorName;
      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }

    // If none matched, show the entire raw JSON
    if (!fullJsonContent) {
      fullJsonContent = JSON.stringify(traceContent, null, 2);
    }

    // For "Observation," "Rationale," "Final Response," or "Observation - Final Response," skip incrementing step count
    const isRationaleFinalOrObservation =
      subTraceTitle === "Rationale" ||
      subTraceTitle === "Final Response" ||
      subTraceTitle === "Observation" ||
      subTraceTitle === "Observation - Final Response";

    const subTraceLabel = subTraceTitle;
    const currentTime = Date.now();

    setMessages((prevMessages: Message[]) => {
      const updatedMessages = [...prevMessages];

      const existingGroupIndex = updatedMessages.findIndex(
        (msg): msg is Message & { type: "trace-group" } =>
          msg.type === "trace-group" &&
          msg.dropdownTitle?.includes(traceType) &&
          Array.isArray(msg.tasks)
      );

      // Helper to remove parent's content & add a sub-task
      const addSubTask = (
        parentTask: Task,
        subTaskTitle: string,
        subTaskContent: string | object,
        subTaskJson: string | null
      ) => {
        if (!parentTask.subTasks) {
          parentTask.subTasks = [];
        }
        parentTask.content = undefined;
        parentTask.fullJson = undefined;

        const subStepIndex = parentTask.subTasks.length + 1;
        const subTimeDifference = (
          (currentTime - parentTask.timestamp) /
          1000
        ).toFixed(2);

        parentTask.subTasks.push({
          title: `Step ${parentTask.stepNumber}.${subStepIndex} - ${subTaskTitle} (${subTimeDifference} seconds)`,
          content: subTaskContent,
          fullJson: subTaskJson,
          timestamp: currentTime,
        });
      };

      if (existingGroupIndex !== -1) {
        // There is an existing group
        const currentGroup = updatedMessages[existingGroupIndex];
        const tasks = currentGroup.tasks || [];

        // Next main step (excluding Rationale, Final, Observation)
        const nextStepNumber =
          tasks.filter(
            (t) =>
              !t.title.startsWith("Rationale") &&
              !t.title.startsWith("Final Response") &&
              !t.title.includes("Observation")
          ).length + 1;

        const lastTask = tasks[tasks.length - 1];
        const baseTimestamp = currentGroup.startTime || currentTime;
        const lastTimestamp = lastTask?.timestamp || baseTimestamp;
        const timeDifference = ((currentTime - lastTimestamp) / 1000).toFixed(2);

        // Potential sub-task attachments (ActionGroup, ModelOut, KB, etc.)
        if (
          traceContent?.trace?.orchestrationTrace?.observation
            ?.actionGroupInvocationOutput
        ) {
          const lastActionGroup = [...tasks]
            .reverse()
            .find((t) => t.title.includes("Action Group Tool"));
          if (lastActionGroup) {
            const foundResponse = lastActionGroup.subTasks?.some((st) =>
              st.title.includes("Action Group Response")
            );
            if (!foundResponse) {
              addSubTask(
                lastActionGroup,
                "Action Group Response",
                displayContent || traceContent,
                fullJsonContent
              );
            }
            return updatedMessages;
          }
        }

        if (traceContent?.trace?.orchestrationTrace?.modelInvocationOutput) {
          const lastModel = [...tasks]
            .reverse()
            .find((t) => t.title.includes("Invoking Model"));
          if (lastModel) {
            const foundResponse = lastModel.subTasks?.some((st) =>
              st.title.includes("Model Invocation Response")
            );
            if (!foundResponse) {
              addSubTask(
                lastModel,
                "Model Invocation Response",
                displayContent || traceContent,
                fullJsonContent
              );
            }
            return updatedMessages;
          }
        }

        if (subTraceTitle === "Knowledge Base Response") {
          const lastKB = [...tasks]
            .reverse()
            .find((t) => t.title.includes("Knowledge Base Tool"));
          if (lastKB) {
            const foundResponse = lastKB.subTasks?.some((st) =>
              st.title.includes("Knowledge Base Response")
            );
            if (!foundResponse) {
              addSubTask(
                lastKB,
                "Knowledge Base Response",
                displayContent || traceContent,
                fullJsonContent
              );
            }
            return updatedMessages;
          }
        }

        if (
          subTraceTitle === "Observation" &&
          (
            traceContent?.trace?.routingClassifierTrace?.observation
              ?.agentCollaboratorInvocationOutput ||
            traceContent?.trace?.orchestrationTrace?.observation
              ?.agentCollaboratorInvocationOutput
          )
        ) {
          const lastAgentTask = [...tasks]
            .reverse()
            .find((t) => t.title.includes(traceType));
          if (lastAgentTask) {
            addSubTask(
              lastAgentTask,
              "Observation",
              displayContent || traceContent,
              fullJsonContent
            );
            return updatedMessages;
          }
        }

        // Otherwise, create a new main step
        const titlePrefix = isRationaleFinalOrObservation
          ? `${subTraceLabel} (${timeDifference} seconds)`
          : `Step ${nextStepNumber} - ${
              subTraceLabel === "Knowledge Base Input"
                ? "Knowledge Base Tool"
                : subTraceLabel
            } (${timeDifference} seconds)`;

        const newTask: Task = {
          stepNumber: isRationaleFinalOrObservation ? 0 : nextStepNumber,
          title: subTraceTitle
            ? titlePrefix
            : `Step ${nextStepNumber} (${timeDifference} seconds)`,
          content: displayContent || traceContent,
          fullJson: fullJsonContent,
          timestamp: currentTime,
          subTasks: undefined,
        };

        // If "Action Group Tool," "Knowledge Base Input," or "Invoking Model," create immediate sub-task
        if (subTraceTitle === "Action Group Tool") {
          newTask.content = undefined;
          newTask.fullJson = undefined;
          newTask.subTasks = [
            {
              title: `Step ${nextStepNumber}.1 - Action Group Input (${timeDifference} seconds)`,
              content: displayContent || traceContent,
              fullJson: fullJsonContent,
              timestamp: currentTime,
            },
          ];
        } else if (subTraceTitle === "Knowledge Base Input") {
          newTask.content = undefined;
          newTask.fullJson = undefined;
          newTask.subTasks = [
            {
              title: `Step ${nextStepNumber}.1 - Knowledge Base Input (${timeDifference} seconds)`,
              content: displayContent || traceContent,
              fullJson: fullJsonContent,
              timestamp: currentTime,
            },
          ];
        } else if (subTraceTitle === "Invoking Model") {
          newTask.content = undefined;
          newTask.fullJson = undefined;
          newTask.subTasks = [
            {
              title: `Step ${nextStepNumber}.1 - Model Invocation Input (${timeDifference} seconds)`,
              content: displayContent || traceContent,
              fullJson: fullJsonContent,
              timestamp: currentTime,
            },
          ];
        }

        // Update how many main steps
        const updatedActualStepCount =
          tasks.filter(
            (t) =>
              !t.title.startsWith("Rationale") &&
              !t.title.startsWith("Final Response") &&
              !t.title.includes("Observation")
          ).length + (isRationaleFinalOrObservation ? 0 : 1);

        // Increment the sub-trace step counter
        if (!traceStepCounter[traceType]) {
          traceStepCounter[traceType] = 0;
        }
        traceStepCounter[traceType] += 1;

        updatedMessages[existingGroupIndex] = {
          ...currentGroup,
          tasks: [...tasks, newTask],
          dropdownTitle: `${traceType} (${(
            (currentTime - baseTimestamp) /
            1000
          ).toFixed(2)} seconds, ${updatedActualStepCount} steps)`,
          text: `sub-trace steps: ${traceStepCounter[traceType]}`, // Update the text field
        };

        // We do NOT add "Completion Time" here, so only final scenario triggers it
        return updatedMessages;
      }

      // --------------------------------------------
      // No existing group -> create a new group
      // --------------------------------------------
      traceStepCounter[traceType] = 0; // Initialize counter for new traceType

      const firstTaskTitle = isRationaleFinalOrObservation
        ? `${subTraceLabel} (0 seconds)`
        : `Step 1 - ${
            subTraceLabel === "Knowledge Base Input"
              ? "Knowledge Base Tool"
              : subTraceLabel
          } (0 seconds)`;

      const firstTask: Task = {
        stepNumber: isRationaleFinalOrObservation ? 0 : 1,
        title: subTraceTitle ? firstTaskTitle : `Step 1 (0 seconds)`,
        content: displayContent || traceContent,
        fullJson: fullJsonContent,
        timestamp: currentTime,
        subTasks: undefined,
      };

      // Immediate sub-task creation for relevant tools
      if (subTraceTitle === "Action Group Tool") {
        firstTask.content = undefined;
        firstTask.fullJson = undefined;
        firstTask.subTasks = [
          {
            title: "Step 1.1 - Action Group Input (0 seconds)",
            content: displayContent,
            fullJson: fullJsonContent,
            timestamp: currentTime,
          },
        ];
      } else if (subTraceTitle === "Knowledge Base Input") {
        firstTask.content = undefined;
        firstTask.fullJson = undefined;
        firstTask.subTasks = [
          {
            title: "Step 1.1 - Knowledge Base Input (0 seconds)",
            content: displayContent,
            fullJson: fullJsonContent,
            timestamp: currentTime,
          },
        ];
      } else if (subTraceTitle === "Invoking Model") {
        firstTask.content = undefined;
        firstTask.fullJson = undefined;
        firstTask.subTasks = [
          {
            title: "Step 1.1 - Model Invocation Input (0 seconds)",
            content: displayContent,
            fullJson: fullJsonContent,
            timestamp: currentTime,
          },
        ];
      } else if (subTraceTitle === "Observation") {
        firstTask.content = undefined;
        firstTask.fullJson = undefined;
        firstTask.subTasks = [
          {
            title: "Step 1.1 - Observation (0 seconds)",
            content: displayContent,
            fullJson: fullJsonContent,
            timestamp: currentTime,
          },
        ];
      }

      const newGroupSteps = isRationaleFinalOrObservation ? 0 : 1;

      updatedMessages.push({
        sender: "bot",
        type: "trace-group",
        dropdownTitle: `${traceType} (0 seconds, ${newGroupSteps} steps)`,
        startTime: currentTime,
        tasks: [firstTask],
        text: "sub-trace steps: 0", // Initialize text with zero sub-trace steps
      });

      // ----------------------------------------------------------------
      // Only display completion time if "Final Response" or "Observation - Final Response"
      // i.e. we're about to stream the final message to the user.
      // ----------------------------------------------------------------
      console.log("SUBTRACE TITLE: ", subTraceTitle)

      if (
        subTraceTitle?.startsWith("Final Response") ||
        subTraceTitle === "Observation - Final Response"
      ) {
        const traceGroups = updatedMessages.filter((m) => m.type === "trace-group");
        if (traceGroups.length > 0) {
          const earliestStartTime = Math.min(...traceGroups.map((g) => g.startTime));
          const totalTime = ((currentTime - earliestStartTime) / 1000).toFixed(2);
          updatedMessages.push({
            sender: "bot",
            type: "info",
            text: `Completion Time: ${totalTime} seconds.`,
          });
        }
      }

      return updatedMessages;
    });

    //scrollToBottom();
  };

  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  const toggleImageSize = () => {
    setIsImageEnlarged((prev) => !prev);
  };  


  const handleFinalMessage = (data: any) => {
    setLoading(false);
    const finalText = data.content;
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: '', type: 'final' },
    ]);
    streamText(finalText);
  };

  const streamText = (finalText: string) => {
    let index = 0;
    const interval = setInterval(() => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;
        if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].type === 'final') {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            text: finalText.slice(0, index + 1),
          };
        }
        return updatedMessages;
      });
      //scrollToBottom();
      index++;
      if (index >= finalText.length) {
        clearInterval(interval);
      }
    }, 1);
  };

  const addMessage = (sender: 'user' | 'bot', text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender, text, type: 'user' },
    ]);
    scrollToBottom();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !loading && !event.shiftKey) {
      event.preventDefault();
      handlePromptSubmit();
    }
  };

  const handleAgentIdChange = (newAgentId: string) => {
    setAgentId(newAgentId);
    localStorage.setItem('supervisor', `${newAgentId}/${aliasId}`);
    setSupervisorValue(`${newAgentId}/${aliasId}`);
  };

  const handleAliasIdChange = (newAliasId: string) => {
    setAliasId(newAliasId);
    localStorage.setItem('supervisor', `${agentId}/${newAliasId}`);
    setSupervisorValue(`${agentId}/${newAliasId}`);
  };

  const handleWebsocketIdChange = (newWebsocketId: string) => {
    // Clean the websocket ID before storing
    const cleanWebsocketId = newWebsocketId.trim();
    setWebsocketId(cleanWebsocketId);
    localStorage.setItem('websocketid', cleanWebsocketId);
    setWebsocketValue(cleanWebsocketId);
  };

  const handlePromptSubmit = () => {
    if (prompt.trim() === '' || loading) return;
    currentPromptId.current += 1;
    setMessages([]);
    setLoading(true);
    addMessage('user', prompt);
    const payload = {
      action: 'sendMessage',
      prompt,
      sessionId,
      agentId,
      aliasId,
    };
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      setPrompt('');
    } else {
      console.error('WebSocket is not open.');
      setError('Unable to connect to WebSocket.');
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };




  const [activeTabId, setActiveTabId] = useState('chat');
  
  const handleTabChange = ({ detail }: { detail: { activeTabId: string } }) => {
    setActiveTabId(detail.activeTabId);
  };
  

  return (
    <Box padding={{ top: 'l' }}>
      <Tabs
        activeTabId={activeTabId}
        onChange={handleTabChange}
        tabs={[
          {
            id: 'chat',
            label: 'Chat',
            content: (
              <>
            <IDFields
                sessionId={sessionId}
                agentId={agentId}
                aliasId={aliasId}
                websocketId={websocketId}
                onSessionIdChange={setSessionId}
                onAgentIdChange={handleAgentIdChange}
                onAliasIdChange={handleAliasIdChange}
                onWebsocketIdChange={handleWebsocketIdChange}
            />        
          <Box className="main-content">       
              <Box className="top-section">
                  <Box className="chat-input">
                          <textarea
                          className="custom-textarea"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={handleKeyPress}
                          rows={2}
                          disabled={loading}
                      />
                      <Button onClick={handlePromptSubmit} variant="primary" disabled={loading}>
                          Send
                      </Button>
                  </Box>
              </Box>
              {error && <Box className="error-message">{error}</Box>}
              
              <Box className="chat-main">
                  <Box className="chat-history">
                      {messages.map((msg, index) => (
                          <Box
                              key={index}
                              className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}
                          >
                              {msg.type === 'trace-group' ? (
                                  <ExpandableSection
                                      header={msg.dropdownTitle || ''}
                                      defaultExpanded={false}
                                      className={msg.tasks?.some(task => 
                                        task.title.includes('Final Response') || 
                                        task.subTasks?.some(subTask => subTask.title.includes('Final Response'))
                                    ) ? 'has-observation' : ''}
                                  >
                                      {msg.tasks?.map((task, taskIndex) => (
                                          <ExpandableSection
                                              key={taskIndex}
                                              header={task.title}
                                              defaultExpanded={false}
                                          >
                                              <pre className="trace-content">
                                                  {typeof task.content === 'object'
                                                      ? JSON.stringify(task.content, null, 2)
                                                      : task.content}
                                              </pre>
                                              {task.fullJson && (
                                                  <details>
                                                      <summary>View Full JSON</summary>
                                                      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                                          {task.fullJson}
                                                      </pre>
                                                  </details>
                                              )}
                                              {task.subTasks && task.subTasks.map((subTask, subIndex) => (
                                                  <ExpandableSection
                                                      key={subIndex}
                                                      header={subTask.title}
                                                      defaultExpanded={false}
                                                  >
                                                      <pre className="trace-content">
                                                          {typeof subTask.content === 'object'
                                                              ? JSON.stringify(subTask.content, null, 2)
                                                              : subTask.content}
                                                      </pre>
                                                      {subTask.fullJson && (
                                                          <details>
                                                              <summary>View Full JSON</summary>
                                                              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                                                  {subTask.fullJson}
                                                              </pre>
                                                          </details>
                                                      )}
                                                  </ExpandableSection>
                                              ))}
                                          </ExpandableSection>
                                      ))}
                                  </ExpandableSection>
                              ) : (
                                  <div className="message-text">{msg.text}</div>
                              )}
                          </Box>
                      ))}
                      {loading && (
                          <Box className="chat-bubble bot-bubble loading">
                              <Spinner />
                              Thinking...
                          </Box>
                      )}
                      <div ref={chatEndRef} />
                  </Box>
              </Box>
          </Box>
          </>
            )
          },
          {
            id: 'documents',
            label: 'Data',
            content: <Documents />
          },
          {
            id: 'workflow',
            label: 'Workflow',
            content: <Workflow />
          }
        ]}
      />
        </Box>
  );
};

export default Chatbot;
