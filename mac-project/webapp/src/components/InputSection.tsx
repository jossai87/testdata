import { FormField, Grid, Textarea } from "@cloudscape-design/components"
import { transactionAtom } from "../atoms/AppAtoms"
import { useAtom } from "jotai"

export const InputSection = () => {
    const [transaction, setTransaction] = useAtom(transactionAtom)

    return (
        <Grid
            gridDefinition={[
                { colspan: { default: 6, xxs: 6 } },
                { colspan: { default: 6, xxs: 6 } }
            ]}
        >
            <FormField label="Target Demographics">
                <Textarea
                    onChange={({ detail }) => setTransaction({
                        ...transaction, demographics: detail.value
                    })}
                    value={transaction.demographics}
                    placeholder="Enter target demographic information"
                    rows={5}


                />
            </FormField>
            <FormField label="Brand Voice Messaging">
                <Textarea
                    onChange={({ detail }) => setTransaction({
                        ...transaction, brandMessaging: detail.value
                    })}
                    value={transaction.brandMessaging}
                    placeholder="Enter brand voice messaging"
                    rows={5}

                />
            </FormField>
        </Grid>

    )
}