import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    DndContext,
    closestCorners,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface OrderManagerProps<T> {
    items: T[];
    onOrderChange?: (items: T[]) => void;
    renderItem: (item: T, index: number, dragHandleProps: any, isDragging: boolean) => React.ReactNode;
    getId: (item: T) => string;
    maxItems?: number;
    className?: string;
    autoSave?: boolean;
    saveOnDragEnd?: boolean;
}

function OrderManager<T>({
    items,
    onOrderChange,
    renderItem,
    getId,
    maxItems = 50,
    className = '',
    autoSave = true,
    saveOnDragEnd = true,
}: OrderManagerProps<T>) {
    const [orderedItems, setOrderedItems] = useState<T[]>(items);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setOrderedItems(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setIsDragging(false);
        const { active, over } = event;
        if (active.id !== over?.id && over) {
            setOrderedItems((prev) => {
                const oldIndex = prev.findIndex((item) => getId(item) === active.id);
                const newIndex = prev.findIndex((item) => getId(item) === over.id);
                if (oldIndex === -1 || newIndex === -1) return prev;
                const newItems = arrayMove(prev, oldIndex, newIndex);
                onOrderChange?.(newItems);
                return newItems;
            });
        }
    }, [getId, onOrderChange]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={orderedItems.map(getId)}
                strategy={verticalListSortingStrategy}
            >
                <ul className="space-y-0" role="list">
                    {orderedItems.map((item, index) => (
                        <SortableItem<T>
                            key={getId(item)}
                            id={getId(item)}
                            index={index}
                            renderItem={renderItem}
                            item={item}
                        />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
}

interface SortableItemProps<T> {
    id: string;
    index: number;
    item: T;
    renderItem: (item: T, index: number, dragHandleProps: any, isDragging: boolean) => React.ReactNode;
}

function SortableItem<T>({ id, index, item, renderItem }: SortableItemProps<T>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <li ref={setNodeRef} style={style}>
            {renderItem(item, index, { ...attributes, ...listeners, style: { touchAction: 'none', cursor: 'grab' } }, isDragging)}
        </li>
    );
}

export default OrderManager;
