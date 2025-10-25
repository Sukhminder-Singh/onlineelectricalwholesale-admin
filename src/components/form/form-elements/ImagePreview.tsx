import { useState } from 'react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
}

const ImagePreview = ({ src, alt = 'Image' }: ImagePreviewProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        alt={alt}
        className="h-10 w-auto cursor-pointer rounded border border-gray-300 shadow-sm hover:opacity-80 transition-all duration-150"
        onClick={() => setOpen(true)}
      />

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-[90vw] sm:max-w-xl p-4">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-yellow-400"
              aria-label="Close"
            >
              &times;
            </button>

            {/* Full Image */}
            <img
              src={src}
              alt={alt}
              className="w-full max-h-[80vh] object-contain rounded-md shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;