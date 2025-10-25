import { SliderData } from "./SliderList";
import { sliderApi, Slider } from "../../services/api";

// Convert backend Slider to frontend SliderData
const toSliderData = (slider: Slider): SliderData => ({
    id: slider._id || slider.id || '',
    title: slider.title,
    description: slider.description || '',
    imageUrl: slider.imageUrl,
    link: slider.link || '',
    order: slider.order || 1,
    isActive: slider.isActive ?? true,
    createdAt: slider.createdAt || new Date().toISOString(),
});

export const loadSlidersFromAPI = async (): Promise<SliderData[]> => {
    const sliders = await sliderApi.getAll();
    return sliders.map(toSliderData);
};

export const saveSliderOrder = async (sliders: SliderData[]): Promise<{ success: boolean; message: string }> => {
    try {
        // Update each slider's order
        await Promise.all(sliders.map(slider => sliderApi.update(slider.id, { order: slider.order })));
        return { success: true, message: 'Slider order saved successfully!' };
    } catch (error) {
        return { success: false, message: 'Error saving slider order. Please try again.' };
    }
};

export const saveNewSlider = async (slider: SliderData): Promise<{ success: boolean; message: string; slider?: SliderData }> => {
    try {
        const created = await sliderApi.create({
            title: slider.title,
            description: slider.description,
            imageUrl: slider.imageUrl,
            link: slider.link,
            order: slider.order,
            isActive: slider.isActive,
        });
        return { success: true, message: 'Slider added successfully!', slider: toSliderData(created) };
    } catch (error) {
        return { success: false, message: 'Error saving slider. Please try again.' };
    }
};

export const deleteSlider = async (sliderId: string): Promise<{ success: boolean; message: string }> => {
    try {
        await sliderApi.delete(sliderId);
        return { success: true, message: 'Slider deleted successfully!' };
    } catch (error) {
        return { success: false, message: 'Error deleting slider. Please try again.' };
    }
};

export const updateSliderStatus = async (sliderId: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
    try {
        await sliderApi.update(sliderId, { isActive });
        return { success: true, message: `Slider ${isActive ? 'activated' : 'deactivated'} successfully!` };
    } catch (error) {
        return { success: false, message: 'Error updating slider status. Please try again.' };
    }
}; 