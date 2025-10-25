import { FileUpload } from 'primereact/fileupload'

type UploadZoneProps = {
    onUpload: (files: File[]) => void
}

export default function UploadZone({ onUpload }: UploadZoneProps) {

    return (
        <FileUpload
            mode="advanced"
            name="files[]"
            customUpload
            multiple
            auto
            accept="image/*"
            chooseLabel="Upload"
            uploadHandler={e => onUpload(e.files)}
        />
    )
}