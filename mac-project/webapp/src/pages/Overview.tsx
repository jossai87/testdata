import React, { useState } from "react";
import { Box, Container, Grid, Header, SpaceBetween, Input, Button } from "@cloudscape-design/components";

export const Overview = () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <Box padding="l">
            <SpaceBetween size="l">
                {/* Overview Section */}
                <Header variant="h1">Overview</Header>
                <Container
                    header={
                        <Header
                            variant="h1"
                            description="Amazon Bedrock's multi-agent collaboration allows developers to create networks of specialized agents that tackle specific tasks under a supervisor agent's guidance, enhancing efficiency and accuracy. In the case of a large retailer facing growing customer support demands, Bedrock enables the deployment of multiple AI-powered agents—each skilled in areas like order management, troubleshooting, and personalized recommendations. This setup not only improves response times and accuracy but also scales effectively to meet increasing demands, ensuring a superior customer experience."
                        >
                            Why Multi-Agent Collaboration?
                        </Header>
                    }
                >
                </Container>
                {/* Click-through Demo Section */}
                <Container
                    header={
                        <SpaceBetween direction="horizontal" size="xl">
                            <Header
                                variant="h2"
                                description="Experience our interactive demo."
                            >
                                Click-through Demo
                            </Header>
                            <Box>
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value="P05tR1VBedrock2024"
                                        readOnly
                                        style={{ width: "300px" }}
                                    />
                                    <Button
                                        onClick={() => setShowPassword(!showPassword)}
                                        iconName={showPassword ? "view-full" : "view-hidden"}
                                    >
                                        {showPassword ? "Hide" : "Show"} password
                                    </Button>
                                </SpaceBetween>
                            </Box>
                        </SpaceBetween>
                    }
                >
                    <Box>
                        <Box style={{ position: "relative" }}>
                            
                            <iframe 
                                src="https://aws.storylane.io/share/otdlltvd8jz7" 
                                style={{
                                    width: "100%",
                                    height: "800px",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                                }}
                                title="Click-through Demo"
                            />
                        </Box>
                    </Box>
                </Container>
                {/* Architecture Diagram Section */}
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Explore the architecture behind this system."
                        >
                            System Architecture
                        </Header>
                    }
                >
                    <Box textAlign="center" padding="l">
                        <img
                            src="../images/arch_diagram2.png"
                            alt="Architecture Diagram"
                            style={{
                                maxWidth: "90%",
                                width: "1000px",
                                height: "auto",
                                borderRadius: "8px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                            }}
                        />
                    </Box>
                </Container>

                {/* Overview Video Section */}
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Watch the overview video to learn more."
                        >
                            Overview Video
                        </Header>
                    }
                >
                    <Box textAlign="center" padding="l">
                        <a
                            href="https://www.youtube.com/watch?v=tMqTy1HR974"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src="https://img.youtube.com/vi/tMqTy1HR974/0.jpg"
                                alt="YouTube Thumbnail"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                                }}
                            />
                        </a>
                    </Box>
                </Container>


            </SpaceBetween>
        </Box>
    );
};
