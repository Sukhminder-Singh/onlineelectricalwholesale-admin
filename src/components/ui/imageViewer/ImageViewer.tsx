import { motion, AnimatePresence } from 'framer-motion';

interface ImageViewerModalProps {
    imageUrl: string | null;
    onClose: () => void;
}


export default function ImageViewer({ imageUrl, onClose }: ImageViewerModalProps) {
    return (
        <AnimatePresence>
            {imageUrl && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.img
                        src={imageUrl}
                        alt="Full View"
                        className="max-w-3xl max-h-[80vh] rounded-lg shadow-2xl"
                        initial={{ scale: 0.7 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.7 }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}