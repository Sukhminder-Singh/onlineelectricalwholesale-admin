import { useEffect, useState } from "react";

interface ImagePreviewModalProps {
    src: string;
    onClose: () => void;
}

export default function ImagePreviewModal({ src, onClose }: ImagePreviewModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Trigger show animation on mount
        setTimeout(() => setShow(true), 10);
    }, []);

    const handleClose = () => {
        // Trigger close animation
        setShow(false);
        setTimeout(onClose, 300); // Match transition duration
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
                show ? "bg-black/70 opacity-100" : "bg-black/0 opacity-0"
            } backdrop-blur-sm`}
        >
            <div
                className={`relative max-w-3xl w-full p-4 transition-all duration-300 transform ${
                    show ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
                <button
                    className="absolute top-2 right-2 text-white text-xl hover:text-red-400 transition"
                    onClick={handleClose}
                >
                    ✕
                </button>
                <img
                    src={src}
                    alt="Preview"
                    className="w-full max-h-[80vh] object-contain rounded-lg"
                />
            </div>
        </div>
    );
}
