import { SideNavigation } from "@cloudscape-design/components";
// router
import { useLocation, useNavigate, Routes, Route, } from "react-router-dom";
import { Overview } from "./Overview";
import Chatbot from "./Chatbot";
import { Settings } from "./Settings";
import { appName } from "../atoms/AppAtoms";
import { History } from "./History";
import { SettingsPanel } from "./SettingsPanel";
import { HistoryPanel } from "./HistoryPanel";
import Documents from "./Documents";

export const AppRoutes = {
    overview: {
        text: "Home",
        href: "/Overview",
    },
    history: {
        text: "History",
        href: "/history",
    },

    settings: {
        text: "settings",
        href: "/settings",
    }
}


export const AppSideNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <SideNavigation
            header={{ href: "/", text: appName }}
            activeHref={location.pathname}
            onFollow={(event) => {
                if (!event.detail.external) {
                    event.preventDefault();
                    navigate(event.detail.href);
                }
            }}
            items={[
                { type: "link", text: AppRoutes.overview.text, href: AppRoutes.overview.href },
                { type: "link", text: "Extracted Data", href: "/data" },
                { type: "link", text: "Chatbot", href: "/chatbot" },
                { type: "divider" },
                { type: "link", text: "Documentation", href: "https://gitlab.aws.dev/genai-labs/demo-assets/mac-demo-customer-support", external: true },
                { type: "divider" },
                { type: "link", text: "Version 1.0", href: "#" }
            ]}
        />

    );
};


export const PageContent = () => {
    const location = useLocation();
    return (
        <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path={AppRoutes.history.href} element={<History />} />
            <Route path={AppRoutes.settings.href} element={<Settings />} />
            <Route path="/data" element={<Documents />} />
            <Route path={AppRoutes.overview.href} element={<Overview />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/" element={<Overview />} />
            <Route path="*" element={<Overview />} />
        </Routes>
    )
}

export const InfoContent = () => {
    return (
        <Routes>
            <Route path={AppRoutes.overview.href} element={<Overview />} />
            <Route path="*" element={<HistoryPanel />} />
        </Routes>)
}