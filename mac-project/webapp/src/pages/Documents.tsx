import { Box, Header, Table, TextFilter, Pagination, Tabs } from "@cloudscape-design/components";
import ErrorBoundary from "../components/ErrorBoundary";
import { useEffect, useState } from "react";
import OrderManagementTable from "../components/OrderManagementTable";
import PersonalizationTable from "../components/PersonalizationTable";
import ProdRecTable from "../components/ProdRecTable";
import TroubleshootTable from "../components/TroubleshootTable";



// No interfaces needed after cleanup

const OrderManagementContent = () => {
  console.log('%c OrderManagementContent rendering', 'background: #222; color: #bada55');
  return (
    <ErrorBoundary>
      <Box padding={{ vertical: "l" }}>
        <OrderManagementTable />
      </Box>
    </ErrorBoundary>
  );
};

const PersonalizationContent = () => {
  const [key, setKey] = useState(0);
  console.log('%c PersonalizationContent rendering', 'background: #222; color: #bada55');

  useEffect(() => {
    // Force a remount of PersonalizationTable when the component is rendered
    setKey(prev => prev + 1);
  }, []);

  return (
    <ErrorBoundary>
      <Box padding={{ vertical: "l" }}>
        <PersonalizationTable key={key} />
      </Box>
    </ErrorBoundary>
  );
};

const ProdRecContent = () => {
  const [key, setKey] = useState(0);
  console.log('%c Product Recommendation rendering', 'background: #222; color: #bada55');

  useEffect(() => {
    // Force a remount of ProdRecTable when the component is rendered
    setKey(prev => prev + 1);
  }, []);

  return (
    <ErrorBoundary>
      <Box padding={{ vertical: "l" }}>
        <ProdRecTable key={key} />
      </Box>
    </ErrorBoundary>
  );
};

const TroubleshootContent = () => {
  const [key, setKey] = useState(0);
  console.log('%c Troubleshoot rendering', 'background: #222; color: #bada55');
  
  useEffect(() => {
    // Force a remount of TroubleshootTable when the component is rendered
    setKey(prev => prev + 1);
  }, []);

  return (
    <ErrorBoundary>
      <Box padding={{ vertical: "l" }}>
        <TroubleshootTable key={key} />
      </Box>
    </ErrorBoundary>
  );
};

const Documents = () => {
  const [activeTabId, setActiveTabId] = useState("order_management");
  useEffect(() => {
    console.log('Documents mounted, initial activeTabId:', activeTabId);
  }, []);

  console.log('Documents rendering, activeTabId:', activeTabId);
  
  return (
    <Box padding="l">
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => {
          console.log('Tab changed to:', detail.activeTabId);
          setActiveTabId(detail.activeTabId);
        }}
        tabs={[
          {
            id: "order_management",
            label: "Order Management Data",
            content: <OrderManagementContent />
          },
          {
            id: "personalization",
            label: "Personalization Data",
            content: <PersonalizationContent />
          },
          {
            id: "prod_recommendation",
            label: "Product Recommendation Data",
            content: <ProdRecContent />
          },
          {
            id: "troubleshoot",
            label: "Troubleshoot Data",
            content: <TroubleshootContent />
          }

        ]}
      />
    </Box>
  );
};

export default Documents;