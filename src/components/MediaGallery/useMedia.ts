import { useEffect, useState } from 'react'
type MediaFile = {
    id: string
    name: string
    url: string
}
export default function useMedia() {
    const [mediaList, setMediaList] = useState<MediaFile[]>([])

    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchMedia()
    }, [])

    const fetchMedia = async () => {
        const res = await fetch('/api/media')
        const data = await res.json()
        setMediaList(data)
    }

    const uploadFiles = async (files: any[]) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))

        await fetch('/api/media/upload', {
            method: 'POST',
            body: formData,
        })
        fetchMedia()
    }

    const filteredList = mediaList.filter(file =>
        file.name.toLowerCase().includes(search.toLowerCase())
    )

    return { mediaList, search, setSearch, filteredList, uploadFiles }
}