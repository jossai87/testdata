import { useEffect } from 'react'
import { useSessionStorage } from './hooks/useSessionStorage'
import { Amplify, } from 'aws-amplify';
import { Authenticator, Button, Heading, useAuthenticator, useTheme, View, Text, Flex } from '@aws-amplify/ui-react';

import { Box, Container, Button as CSButton, } from "@cloudscape-design/components";
import { signInWithRedirect } from "aws-amplify/auth";
import cartLogo from "./assets/cart.png"

// pages
import { AppBase } from "./pages/AppBase";
import { Login } from "./pages/Login";

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);


Amplify.configure({
  Auth: {
    Cognito: {
      // OPTIONAL - Amazon Cognito Usser Pool ID
      userPoolId: import.meta.env
        .VITE_CONFIG_COGNITO_USERPOOL_ID,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: import.meta.env
        .VITE_CONFIG_COGNITO_APPCLIENT_ID,
      identityPoolId: import.meta.env
        .VITE_CONFIG_COGNITO_IDENTITYPOOL_ID,
      allowGuestAccess: false,
      // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not        
      loginWith: {
        oauth: {
          domain: import.meta.env
            .VITE_CONFIG_COGNITO_DOMAIN, // do no include https:// in this url
          scopes: ["openid"],
          redirectSignIn: isLocalhost ? ["http://localhost:3000"] : [import.meta.env
            .VITE_CONFIG_COGNITO_CALLBACK_URL],
          redirectSignOut: isLocalhost ? ["http://localhost:3000"] : [import.meta.env
            .VITE_CONFIG_COGNITO_CALLBACK_URL],
          responseType: "code",
        },
      }
    },
  },
  API: {
    REST: {
      "http-api": {
        endpoint: import.meta.env.VITE_CONFIG_HTTP_API_URL,
        region: import.meta.env.VITE_REGION // Optional
      },
      "rest-api": {
        // remove the trailing / as we will attach it to the request call
        endpoint: String(import.meta.env.VITE_CONFIG_REST_API_URL).slice(0, -1),
        region: import.meta.env.VITE_REGION // Optional
      }
    }
  },
  Storage: {
    S3: {
      region: import.meta.env.VITE_REGION,
      bucket: import.meta.env.VITE_CONFIG_S3_DATA_BUCKET_NAME,
    },
  },
})


function App() {
  // hook below is only reevaluated when `user` changes
  const { route, authStatus } = useAuthenticator((context) => [context.route, context.authStatus]);
  const { sessionSettings, updateSessionSettings } = useSessionStorage();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      // Generate a new websocket ID if not present
      if (!sessionSettings.websocketId) {
        updateSessionSettings({
          websocketId: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }
  }, [authStatus, sessionSettings.websocketId, updateSessionSettings])

  const components = {
    Header() {
      const { tokens } = useTheme();
      return (
        <View as="div"
          ariaLabel="View example"
          borderRadius="2vw"
          textAlign="center"
          padding={tokens.space.medium}
        >

          <Flex direction="column" textAlign="center" alignItems={"center"}  >

            <Box variant="h1" textAlign="center">
              Product Description Generator
            </Box>
            <img src={cartLogo} alt="Logo" height={"50%"} width={"50%"} style={{
              borderRadius: "1vw",
            }} />
            <Flex direction={"row"} width={"100%"} paddingTop={"1vh"} paddingBottom={"1vh"}>
              <div style={{
                flexGrow: 1,
                height: '2px',
                backgroundColor: 'rgb(131,58,180)',
              }} />
            </Flex>
            <Container fitHeight >

              <CSButton onClick={() => signInWithRedirect()} iconName="lock-private" variant="primary">
                Login with Midway
              </CSButton>
            </Container>
            <Box
              color="text-body-secondary"
              textAlign="center"
              fontWeight="bold"
              fontSize="heading-m">
              OR
            </Box>
          </Flex>
        </View >
      );
    },
    Footer() {
      const { tokens } = useTheme();
      return (
        <View textAlign="center" padding={tokens.space.large}>
          <Text color={tokens.colors.black}>
            &copy; 2024 AWS Gen-AI Labs Team
          </Text>
        </View>
      );
    },
    SignIn: {
      Header() {
        const { tokens } = useTheme();
        return (
          <Heading
            padding={`${tokens.space.small} 0 0 ${tokens.space.small}`}
            level={6}
            style={{ textAlign: 'center' }}
          >
            Login with Amazon Cognito
          </Heading>


        );
      },
      Footer() {
        const { toForgotPassword } = useAuthenticator();
        return (
          <View textAlign="center">
            <Button
              fontWeight="normal"
              onClick={toForgotPassword}
              size="small"
              variation="link"
            >
              Reset Password
            </Button>
          </View>
        );
      },
    },

  }

  const formFields = {
    signIn: {
      username: {
        isRequired: true,
        label: 'Email:',
        placeholder: 'Enter your email',
      },
    },
    resetPassword: {
      username: {
        type: "email",
        isRequired: true,
        label: 'Email:',
        placeholder: 'Enter your email',
      },
    },

  }

  return (
    <div style={{
      background: "linear-gradient(209deg, rgba(101,27,182,0.48363095238095233) 25%, rgba(53,106,177,0.469625350140056) 51%, rgba(13,86,170,0.5116421568627452) 86%)",
      // background: "linear-gradient(90deg, rgba(92,86,189,0.3295693277310925) 22%, rgba(104,136,149,0.33) 51%, rgba(110,185,200,1) 100%)",
      minHeight: "100vh",
      // minWidth: "100vw",
      overflow: 'hidden',
      alignItems: "center",
      justifyContent: "center",
    }}>
      <Authenticator formFields={formFields} hideSignUp={true} components={components} >
        {() => <AppBase />}
      </Authenticator>

    </div>
  )
}

export default App


