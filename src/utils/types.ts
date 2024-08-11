import 'reflect-metadata';
import { BaseSettingType, RegisterType } from "./BaseSettingType.ts";

/**
 * TODO: probably should move this to a separate file
 */
export interface PageSetting {
    pageId: string;
    name: string;
}

@RegisterType
export class PageSettingType extends BaseSettingType {
    settings: PageSetting[];

    constructor(settings: PageSetting[] = []) {
        super();
        this.settings = settings;
    }

    toObject(): object {
        return {
            settings: this.settings
        };
    }
}