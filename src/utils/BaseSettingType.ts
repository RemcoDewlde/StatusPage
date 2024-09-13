import 'reflect-metadata';
import { ToastType } from '../context/toastContext.tsx';
import { Store } from 'tauri-plugin-store-api';
import { typeRegistry } from './TypeRegistry.ts';

export function RegisterType(target: any) {
    const key = target.name.toLowerCase();
    typeRegistry.set(key, target);
}

export abstract class BaseSettingType {
    // * @param addToast: A function to add a toast message (Optional).
    static async load<T extends BaseSettingType>(
        this: new () => T,
        addToast?: (message: string, type: ToastType, closable?: boolean) => void,
    ): Promise<T | null> {
        const key = this.name.toLowerCase();
        const store = new Store('.settings.dat');

        try {
            const val = await store.get<{ value: any }>(key);
            if (val) {
                const instance = new this();
                Object.assign(instance, val.value);
                return instance;
            } else {
                addToast?.('No settings found', ToastType.Warning, true);
                return null;
            }
        } catch (error) {
            addToast?.('Error fetching settings', ToastType.Error, true);
            return null;
        }
    }

    // * Purpose: Load the settings from the store.
    // * @param addToast: A function to add a toast message (Optional).
    static async save<T extends BaseSettingType>(
        this: new () => T,
        settings: T,
        addToast?: (message: string, type: ToastType, closable?: boolean) => void,
    ): Promise<void> {
        const key = this.name.toLowerCase();
        const store = new Store('.settings.dat');

        try {
            await store.set(key, { value: settings.toObject() });
            await store.save();
            const val = await store.get<{ value: any }>(key);

            if (val) {
                addToast?.('Saved', ToastType.Success, true);
            } else {
                addToast?.('Something went wrong', ToastType.Warning, true);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            addToast?.('Error saving settings', ToastType.Error, true);
        }
    }

    // * Purpose: Save the settings to the store.
    // * @param settings: The settings to save.
    abstract toObject(): object;
}
