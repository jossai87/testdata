import { TopNavigation, ButtonDropdownProps } from "@cloudscape-design/components";
import { Mode } from '@cloudscape-design/global-styles';
// atoms
import { useAtom } from 'jotai';
import { appName, MidwayUserAtom, themeAtom, toggleThemeAtom } from '../atoms/AppAtoms';
import Favicon from "../assets/favicon.png"
import { useEffect, useMemo } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function TopBar() {
    // atoms
    const [theme] = useAtom(themeAtom);
    const [, toggleTheme] = useAtom(toggleThemeAtom);
    // const [userAttributes, setUserAttributes] = useAtom(UserAttributesAtom);
    const [midwayUser, setMidwayUser] = useAtom(MidwayUserAtom)
    const { user, signOut } = useAuthenticator((context) => [context.user]);

    // for cognito user pool user
    // const handleFetchUserAttributes = useCallback(async () => {
    //     try {
    //         const userAttributes = await fetchUserAttributes();    //         
    //         setUserAttributes(userAttributes);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }, [setUserAttributes])

    useEffect(() => {
        setMidwayUser(user)
    }, [user])

    const userName = useMemo(() => {
        if (user.username.includes("AmazonFederate")) {
            return `${user.username.split("_")[1]}@amazon.com`
        }

        return user.username
    }, [user])



    async function handleSignOut() {
        try {
            await signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    const handleSettingsClick = (detail: ButtonDropdownProps.ItemClickDetails) => {
        if (detail.id === "switch-theme") {
            toggleTheme();
        }
    }

    const handleMenuItemClick = (detail: ButtonDropdownProps.ItemClickDetails) => {
        if (detail.id === "signout") {
            handleSignOut();
        }
    }

    return (
        <TopNavigation
            identity={{
                href: "/",
                title: appName,
                logo: {
                    src: Favicon,
                    alt: appName
                }
            }}
            utilities={[

                {
                    type: "button",
                    iconName: "notification",
                    title: "Notifications",
                    ariaLabel: "Notifications (unread)",
                    badge: false,
                    disableUtilityCollapse: false
                },
                {
                    type: "menu-dropdown",
                    iconName: "settings",
                    ariaLabel: "Settings",
                    title: "Settings",
                    onItemClick: ({ detail }) => handleSettingsClick(detail),
                    items: [
                        {
                            id: "switch-theme",
                            text: theme === Mode.Light ? "🌙  Dark Theme" : "💡 Light Theme"
                        },

                    ]
                },
                {
                    type: "menu-dropdown",
                    // text: `${userAttributes?.given_name ?? ""} ${userAttributes?.family_name ?? ""}`,
                    // description: `${userAttributes?.email ?? ""}`,
                    text: userName,
                    iconName: "user-profile",
                    items: [
                        {
                            id: "support-group",
                            text: "Support",
                            items: [
                                {
                                    id: "documentation",
                                    text: "Documentation",
                                    href: "https://aws.amazon.com/bedrock/",
                                    external: true,
                                    externalIconAriaLabel:
                                        " (opens in new tab)"
                                },
                                {
                                    id: "feedback",
                                    text: "Feedback",
                                    href: "https://aws.amazon.com/contact-us/?cmpid=docs_headercta_contactus",
                                    external: true,
                                    externalIconAriaLabel:
                                        " (opens in new tab)"
                                }
                            ]
                        },
                        { id: "signout", text: "Sign out" }
                    ],
                    onItemClick: ({ detail }) => handleMenuItemClick(detail),
                }
            ]}
            i18nStrings={{
                searchIconAriaLabel: "Search",
                searchDismissIconAriaLabel: "Close search",
                overflowMenuTriggerText: "More",
                overflowMenuTitleText: "All",
                overflowMenuBackIconAriaLabel: "Back",
                overflowMenuDismissIconAriaLabel: "Close menu"
            }}
        />
    )

}