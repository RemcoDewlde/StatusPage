import 'reflect-metadata';
import { ToastType } from '../context/toastContext.tsx';
import { BaseDirectory, exists, readTextFile, writeFile } from '@tauri-apps/plugin-fs';
import { typeRegistry } from './TypeRegistry.ts';

export function RegisterType(target: any) {
    const key = target.name.toLowerCase();
    typeRegistry.set(key, target);
}

export abstract class BaseSettingType {
    static settingsFile = 'settings.json';
    static settingsDirectory = BaseDirectory.AppData;

    static async load<T extends BaseSettingType>(
        this: new () => T,
        addToast?: (message: string, type: ToastType, closable?: boolean) => void,
    ): Promise<T | null> {
        const key = this.name.toLowerCase();
        try {
            const fileExists = await exists(BaseSettingType.settingsFile, { baseDir: BaseDirectory.AppConfig});
            if (!fileExists) {
                addToast?.('No settings file found', ToastType.Warning, true);
                return null;
            }
            const fileContent = await readTextFile(BaseSettingType.settingsFile, { baseDir: BaseSettingType.settingsDirectory });
            const allSettings = JSON.parse(fileContent || '{}');
            if (allSettings[key]) {
                const instance = new this();
                Object.assign(instance, allSettings[key]);
                return instance;
            } else {
                // addToast?.('No settings found', ToastType.Warning, true);
                console.warn(`No settings found for ${key}`);
                return null;
            }
        } catch (error) {
            addToast?.('Error fetching settings', ToastType.Error, true);
            return null;
        }
    }

    static async save<T extends BaseSettingType>(
        this: new () => T,
        settings: T,
        addToast?: (message: string, type: ToastType, closable?: boolean) => void,
    ): Promise<void> {
        const key = this.name.toLowerCase();
        try {
            let allSettings: Record<string, any> = {};
            const fileExists = await exists(BaseSettingType.settingsFile, { baseDir: BaseSettingType.settingsDirectory });
            if (fileExists) {
                try {
                    const fileContent = await readTextFile(BaseSettingType.settingsFile, { baseDir: BaseSettingType.settingsDirectory });
                    allSettings = JSON.parse(fileContent || '{}');
                } catch {}
            }
            allSettings[key] = settings.toObject();
            await writeFile(
                BaseSettingType.settingsFile,
                new TextEncoder().encode(JSON.stringify(allSettings, null, 2)),
                { baseDir: BaseSettingType.settingsDirectory }
            );
            addToast?.('Saved', ToastType.Success, true);
        } catch (error) {
            console.error('Error saving settings:', error);
            addToast?.('Error saving settings', ToastType.Error, true);
        }
    }

    abstract toObject(): object;
}
