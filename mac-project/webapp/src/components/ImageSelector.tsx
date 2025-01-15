import { useMemo, useState } from "react";
import { Container, Header, Select, SelectProps, SpaceBetween, Tiles } from "@cloudscape-design/components";
import { ImageDirType, ImageType, useListProductImages } from "../hooks/useStorage";
import { useResetAtom } from "jotai/utils";
import { transactionAtom } from "../atoms/AppAtoms";

export interface SelectedImageProps extends ImageType {
    category: string
}
interface ImageSelectorProps {
    loading: boolean;
    onImageSelected: (selectedImage: SelectedImageProps) => void
}
export const ImageSelector = (props: ImageSelectorProps) => {
    const resetTransaction = useResetAtom(transactionAtom)
    const { data: productImages } = useListProductImages()
    const [item, setItem] = useState<string>("");
    const [
        selectedOption,
        setSelectedOption
    ] = useState<SelectProps.Option | null>({ label: "Fashion", value: "fashion" },);


    const imageList = useMemo(() => {
        const images: ImageDirType = productImages as ImageDirType
        return images && selectedOption && selectedOption.value ? images[selectedOption.value] : []
    }, [selectedOption, productImages])

    const onImageSelected = (imageKey: string) => {
        setItem(imageKey)
        const selectedImage = imageList.find(i => i.imageName === imageKey)
        if (selectedImage && selectedOption && selectedOption.value) {
            props.onImageSelected({
                ...selectedImage,
                category: selectedOption.value
            })
        }
    }

    return (
        <div style={{
            maxHeight: '90vh',
            overflow: 'auto'
        }}>
            <Container
                header={
                    <Header
                        variant="h2"
                        description="Select a segment to list images"
                    >
                        Segments
                    </Header>
                }
            >
                <SpaceBetween size="l" direction="vertical" >
                    <Select
                        selectedOption={selectedOption}
                        statusType={props.loading ? "loading" : "finished"}
                        loadingText="loading catagories"
                        onChange={({ detail }) => {
                            setSelectedOption(detail.selectedOption)
                            resetTransaction()
                        }
                        }
                        options={productImages ? Object.keys(productImages).map(key => {
                            return { value: key, label: key[0].toUpperCase() + key.slice(1) }
                        }) : []}
                    />
                    {imageList && imageList.length > 0 &&
                        <Tiles
                            onChange={({ detail }) => onImageSelected(detail.value)}
                            value={item}
                            columns={1}
                            items={imageList.map((item, index) => ({
                                label: `Image-${index + 1}`,
                                value: item.imageName,
                                image: (
                                    <img
                                        src={item.url}
                                        alt={item.imageName}
                                        width={"100%"}
                                        height={"100%"}
                                    />
                                ),
                            }))}
                        />}
                </SpaceBetween>
            </Container>
        </div>
    )
}