import { useMemo } from "react"
import { Box, CollectionPreferences, Header, Link, SpaceBetween, Table } from "@cloudscape-design/components"
import { useAtom } from "jotai"

import { useGetTransactions } from "../hooks/useApigw"
import { DetailsModalAtom, HistoryResponseType } from "../atoms/AppAtoms"
import { useNavigate } from "react-router-dom"
import { AppRoutes } from "../pages/PageNavigation"

export const HistoryTable = () => {
    const navigate = useNavigate();
    const [, setDetailModal] = useAtom(DetailsModalAtom)

    const { data, isLoading } = useGetTransactions({
        opr: "list_transactions",
        payload: ""
    })

    const historyItems = useMemo(() => {
        if (data) {
            const historyData = data as unknown as HistoryResponseType

            return historyData.data ?? []
        }
    }, [data])

    return (
        <Table
            renderAriaLive={({
                firstIndex,
                lastIndex,
                totalItemsCount
            }) =>
                `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
            }
            sortingDisabled
            columnDefinitions={[
                {
                    id: "id",
                    header: "ID",
                    cell: item => <Link onClick={() => setDetailModal({
                        visible: true,
                        item: item
                    })}>{item.id}</Link>,
                    isRowHeader: true
                },
                {
                    id: "imageKey",
                    header: "Image Key",
                    cell: item => item.imageKey,

                },
                {
                    id: "category",
                    header: "Category",
                    cell: item => item.category.charAt(0).toUpperCase() + item.category.slice(1)

                },
                {
                    id: "language",
                    header: "Language",
                    cell: item => item.language.charAt(0).toUpperCase() + item.language.slice(1)
                },
                {
                    id: "settings",
                    header: "Model Name",
                    cell: item => JSON.parse(item.settings)["model"]["label"]
                },
            ]}
            columnDisplay={[
                { id: "id", visible: true },
                { id: "imageKey", visible: true },
                { id: "category", visible: true },
                { id: "language", visible: true },
                { id: "settings", visible: true },
                // { id: "generatedDescription", visible: true },


            ]}
            enableKeyboardNavigation
            items={historyItems ?? []}
            loading={isLoading}
            loadingText="Loading resources"
            trackBy="name"
            empty={
                <Box
                    margin={{ vertical: "xs" }}
                    textAlign="center"
                    color="inherit"
                >
                    <SpaceBetween size="m">
                        <b>No transactions to list. </b>
                        <b>Head to the <Link onClick={() => navigate(AppRoutes.home.href)}>Home page</Link> and select an image to begin</b>

                    </SpaceBetween>
                </Box>
            }

            header={
                <Header>
                    History
                </Header>
            }

            preferences={
                <CollectionPreferences
                    title="Preferences"
                    confirmLabel="Confirm"
                    cancelLabel="Cancel"
                    preferences={{
                        pageSize: 10,
                        contentDisplay: [
                            { id: "variable", visible: true },
                            { id: "value", visible: true },
                            { id: "type", visible: true },
                            { id: "description", visible: true }
                        ]
                    }}
                    pageSizePreference={{
                        title: "Page size",
                        options: [
                            { value: 10, label: "10 resources" },
                            { value: 20, label: "20 resources" }
                        ]
                    }}
                    wrapLinesPreference={{}}
                    stripedRowsPreference={{}}
                    contentDensityPreference={{}}
                    contentDisplayPreference={{
                        options: [
                            {
                                id: "variable",
                                label: "Variable name",
                                alwaysVisible: true
                            },
                            { id: "value", label: "Text value" },
                            { id: "type", label: "Type" },
                            { id: "description", label: "Description" }
                        ]
                    }}
                    stickyColumnsPreference={{
                        firstColumns: {
                            title: "Stick first column(s)",
                            description:
                                "Keep the first column(s) visible while horizontally scrolling the table content.",
                            options: [
                                { label: "None", value: 0 },
                                { label: "First column", value: 1 },
                                { label: "First two columns", value: 2 }
                            ]
                        },
                        lastColumns: {
                            title: "Stick last column",
                            description:
                                "Keep the last column visible while horizontally scrolling the table content.",
                            options: [
                                { label: "None", value: 0 },
                                { label: "Last column", value: 1 }
                            ]
                        }
                    }}
                />
            }
        />
    )
}