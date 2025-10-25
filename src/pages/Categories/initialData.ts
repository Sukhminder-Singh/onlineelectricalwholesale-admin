import { CategoryNode } from "./CategoryList";

export const initialData: CategoryNode[] = [
    {
        key: '1',
        label: 'Electronics',
        isActive: true,
        data: { image: 'https://images.unsplash.com/photo-1510557880182-3de2f54cc6c8?w=40&h=40&fit=crop' },
        children: [
            {
                key: '1-1',
                label: 'Phones',
                isActive: true,
                data: { image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=40&h=40&fit=crop' },
                children: [
                    {
                        key: '1-1-1',
                        label: 'Smartphones',
                        isActive: true,
                        data: { image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=40&h=40&fit=crop' }
                    },
                    {
                        key: '1-1-2',
                        label: 'Charger',
                        isActive: true,
                        data: { image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=40&h=40&fit=crop' }
                    },
                    {
                        key: '1-1-3',
                        label: 'Cable',
                        isActive: true,
                        data: { image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=40&h=40&fit=crop' }
                    }
                ]
            },
            {
                key: '1-2',
                label: 'Laptops',
                isActive: true,
                data: { image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=40&h=40&fit=crop' }
            }
        ]
    },
    {
        key: '2',
        label: 'Clothing',
        isActive: true,
        data: { image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=40&h=40&fit=crop' }
    }
];