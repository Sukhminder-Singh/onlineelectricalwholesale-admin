import { useState } from "react";
import Badge from "../badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../table";
import ImagePreviewModal from "./ImageTablePreview";
import cn from "classnames";
import { DeleteIcon, EditIcon } from "../../../icons";
import Switch from '../../form/switch/Switch';

interface ImageData {
    _id?: string;
    name: string;
    images: string;
    status: 'active' | 'inactive' | string;
}

interface ImageTableProps {
    data: ImageData[];
    onEdit?: (id?: string) => void;
    onDelete?: (id?: string) => void;
    onStatusToggle?: (id?: string, currentStatus?: string) => void;
    loading?: boolean;
    statusUpdatingId?: string | null;
}

export default function ImageTable({ data, onEdit, onDelete, onStatusToggle, loading, statusUpdatingId }: ImageTableProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-black/40 flex items-center justify-center z-20">
                        <span className="text-gray-600 dark:text-white text-lg font-semibold">Loading...</span>
                    </div>
                )}
                <div className="max-w-full overflow-x-auto max-h-[80vh] overflow-y-auto">
                    <Table>
                        {/* Table Header with sticky cells */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                {["Brand Name", "Images", "Status", "Action"].map((heading) => (
                                    <TableCell
                                        key={heading}
                                        isHeader
                                        className="sticky top-0 z-10 bg-white dark:bg-white/[0.03] px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400"
                                    >
                                        {heading}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-500">
                                        No brands found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((order, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                                            <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                                {order.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            <div className="w-40 h-20 relative overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer">
                                                {order.images && order.images.trim() !== '' ? (
                                                    <>
                                                        {!imageLoaded && (
                                                            <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
                                                        )}
                                                        <img
                                                            src={order.images}
                                                            alt={`${order.name} logo`}
                                                            className={cn(
                                                                "w-full h-full object-cover transition-opacity duration-500",
                                                                imageLoaded ? "opacity-100" : "opacity-0"
                                                            )}
                                                            onClick={() => order.images && order.images.trim() !== '' && setPreviewImage(order.images)}
                                                            onLoad={() => setImageLoaded(true)}
                                                            onError={() => setImageLoaded(true)}
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                        <div className="text-center">
                                                            <div className="text-2xl text-gray-400 dark:text-gray-600 mb-1">📷</div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            <div className="inline-flex items-center gap-2">
                                                <Badge
                                                    size="sm"
                                                    color={
                                                        order.status === "active"
                                                            ? "success"
                                                            : order.status === "Pending"
                                                                ? "warning"
                                                                : "error"
                                                    }
                                                >
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                                                </Badge>
                                                {onStatusToggle && (
                                                    <Switch
                                                        label=""
                                                        checked={order.status === 'active'}
                                                        disabled={statusUpdatingId === order._id}
                                                        onChange={() => onStatusToggle(order._id, order.status)}
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <div className="flex items-start gap-2">
                                                <EditIcon className="text-xl text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => onEdit && onEdit(order._id)} />
                                                <DeleteIcon className="text-xl text-red-600 hover:text-red-800 cursor-pointer" onClick={() => onDelete && onDelete(order._id)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {previewImage && (
                <ImagePreviewModal
                    src={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </>
    );
}