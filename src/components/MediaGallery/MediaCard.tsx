

type MediaFile = {
    id: string
    name: string
    url: string
}

type MediaCardProps = {
    file: MediaFile
    onSelect: () => void
}

export default function MediaCard({ file, onSelect }: MediaCardProps) {
    return (
        <div className="relative group cursor-pointer border rounded overflow-hidden">
            <img src={file.url} alt={file.name} className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 hidden group-hover:flex items-center justify-center">
                <button onClick={onSelect} className="text-white bg-primary px-3 py-1 rounded">Insert</button>
            </div>
        </div>
    )
}