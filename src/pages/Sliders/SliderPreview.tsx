import React, { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { SliderData } from "./SliderList";

interface SliderPreviewProps {
    sliders: SliderData[];
}

export default function SliderPreview({ sliders }: SliderPreviewProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [imageLoadError, setImageLoadError] = useState<{[key: string]: boolean}>({});
    const activeSliders = sliders.filter(slider => slider.isActive);

    useEffect(() => {
        if (activeSliders.length === 0) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => 
                prev === activeSliders.length - 1 ? 0 : prev + 1
            );
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [activeSliders.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => 
            prev === 0 ? activeSliders.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        setCurrentSlide((prev) => 
            prev === activeSliders.length - 1 ? 0 : prev + 1
        );
    };

    const handleImageError = (sliderId: string) => {
        setImageLoadError(prev => ({
            ...prev,
            [sliderId]: true
        }));
    };

    if (activeSliders.length === 0) {
        return (
            <ComponentCard title="Slider Preview">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No active sliders to display
                </div>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Slider Preview">
            <div className="relative">
                {/* Main Carousel */}
                <div className="relative h-64 md:h-80 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {activeSliders.map((slider, index) => (
                        <div
                            key={slider.id}
                            className={`absolute inset-0 transition-opacity duration-500 ${
                                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                            {imageLoadError[slider.id] ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <div className="text-center text-gray-500 dark:text-gray-400">
                                        <div className="text-4xl mb-2">📷</div>
                                        <p className="text-sm">Image not available</p>
                                        <p className="text-xs mt-1">{slider.title}</p>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={slider.imageUrl}
                                    alt={slider.title}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(slider.id)}
                                    onLoad={() => {
                                        // Clear error state when image loads successfully
                                        if (imageLoadError[slider.id]) {
                                            setImageLoadError(prev => ({
                                                ...prev,
                                                [slider.id]: false
                                            }));
                                        }
                                    }}
                                />
                            )}
                            
                            {/* Overlay with gradient for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                            
                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h3 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-lg">
                                    {slider.title}
                                </h3>
                                <p className="text-sm md:text-base mb-4 opacity-90 drop-shadow-md line-clamp-2">
                                    {slider.description}
                                </p>
                                {slider.link && (
                                    <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-lg">
                                        Learn More
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {activeSliders.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-20"
                            aria-label="Previous slide"
                        >
                            ←
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-20"
                            aria-label="Next slide"
                        >
                            →
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {activeSliders.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                        {activeSliders.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    index === currentSlide
                                        ? 'bg-white shadow-lg'
                                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Slide Counter */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-20">
                    {currentSlide + 1} / {activeSliders.length}
                </div>
            </div>

            {/* Slider Info */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Current Slide Info
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Title:</strong> {activeSliders[currentSlide]?.title}</p>
                    <p><strong>Order:</strong> {activeSliders[currentSlide]?.order}</p>
                    <p><strong>Link:</strong> {activeSliders[currentSlide]?.link || 'None'}</p>
                    
                    {imageLoadError[activeSliders[currentSlide]?.id] && (
                        <p className="text-red-500"><strong>Status:</strong> Image failed to load</p>
                    )}
                </div>
            </div>
        </ComponentCard>
    );
} 