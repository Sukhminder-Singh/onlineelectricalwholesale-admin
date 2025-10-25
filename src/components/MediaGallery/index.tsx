import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import MediaCard from './MediaCard'
import UploadZone from './UploadZone'
import useMedia from './useMedia'

type MediaFile = {
    id: string
    name: string
    url: string
}


type MediaGalleryProps = {
    visible: boolean
    onClose: () => void
    onSelect: (file: MediaFile) => void
}

export default function MediaGallery({ visible, onClose, onSelect }: MediaGalleryProps) {
    const { mediaList, search, setSearch, filteredList, uploadFiles } = useMedia()

    return (
        <Dialog header="Select Media" visible={visible} onHide={onClose} style={{ width: '70vw' }}>
            <div className="flex justify-between items-center mb-4">
                <InputText placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
                <UploadZone onUpload={uploadFiles} />
            </div>

            <div className="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
                {filteredList.map(file => (
                    <MediaCard key={file.id} file={file} onSelect={() => onSelect(file)} />
                ))}
            </div>
        </Dialog>
    )
}