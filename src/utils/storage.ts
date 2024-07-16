import { Store } from "tauri-plugin-store-api";
import { ToastType } from "../context/toastContext.tsx";

const store = new Store(".settings.dat");

export const saveToSettings = async (key: string, value: object, addToast: (message: string, type: ToastType, closable: boolean) => void) => {
    const store = new Store(".settings.dat");

    try {
        await store.set(key, { value: value });
        await store.save();
        const val = await store.get<{ value: object }>(key);

        if (val) {
            console.log(val);
            addToast("Saved", ToastType.Success, true);
        } else {
            addToast("Something went wrong", ToastType.Warning, true);
        }
    } catch (error) {
        console.error("Error saving settings:", error);
        addToast("Error saving settings", ToastType.Error, true);
    }
};

export const loadSettings = async (key: string, addToast: (message: string, type: ToastType, closable: boolean) => void) => {

    try {
        const val = await store.get<{ value: object }>(key);  // Get value using the key
        if (val) {
            return val.value;
        } else {
            addToast("No settings found", ToastType.Warning, true);
            return null;
        }
    } catch (error) {
        addToast("Error fetching settings", ToastType.Error, true);
        return null;
    }
};