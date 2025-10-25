import { SliderData } from "./SliderList";

export const initialSliderData: SliderData[] = [
    {
        id: "1",
        title: "Welcome to Our Store",
        description: "Discover amazing products with great deals and discounts. Shop now and save big on your favorite items.",
        imageUrl: "/images/carousel/carousel-01.png",
        link: "/products",
        order: 1,
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "2",
        title: "New Collection Arrival",
        description: "Check out our latest collection featuring trendy designs and premium quality materials.",
        imageUrl: "/images/carousel/carousel-02.png",
        link: "/new-arrivals",
        order: 2,
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "3",
        title: "Special Offers",
        description: "Limited time offers on selected items. Don't miss out on these incredible deals!",
        imageUrl: "/images/carousel/carousel-03.png",
        link: "/offers",
        order: 3,
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "4",
        title: "Premium Quality",
        description: "Experience the difference with our premium quality products designed for your lifestyle.",
        imageUrl: "/images/carousel/carousel-04.png",
        link: "/premium",
        order: 4,
        isActive: false,
        createdAt: "2024-01-01T00:00:00.000Z"
    }
]; 