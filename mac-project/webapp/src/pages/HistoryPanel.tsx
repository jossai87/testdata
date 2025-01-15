import { HelpPanel } from "@cloudscape-design/components"

export const HistoryPanel = () => {

    return (
        <HelpPanel

            header={<h2>History Page</h2>}
        >
            <div>
                View execution history listed by an unique execution ID. Each execution history shows the following upon clicking the execution ID.
                <ul>
                    <li>selected image</li>
                    <li>final attributes list item</li>
                    <li>brand voice messaging</li>
                    <li>generated product description</li>
                </ul>
            </div>
        </HelpPanel>
    )
}