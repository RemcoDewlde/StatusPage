import 'reflect-metadata';
import { BaseSettingType, RegisterType } from './BaseSettingType.ts';
import type { MosaicNode as OriginalMosaicNode } from "react-mosaic-component";

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
            settings: this.settings,
        };
    }
}

export type ViewId = string;
export type ApiType = string;
export type ViewType = 'summary' | 'details' | 'graph'

export type TileSettings = {
    api: ApiType;
    viewType: ViewType;
    additionalSettings: Record<string, any>;
};

@RegisterType
export class LayOutType extends BaseSettingType {
    layout: OriginalMosaicNode<any>;
    tileSettings: Record<string, TileSettings>;
    titleMap: Record<string, string>;

    constructor(
        layout: OriginalMosaicNode<any> = null,
        tileSettings: Record<string, TileSettings> = {},
        titleMap: Record<string, string> = {}
    ) {
        super();
        this.layout = layout;
        this.tileSettings = tileSettings;
        this.titleMap = titleMap;
    }

    toObject(): object {
        return {
            layout: this.layout,
            tileSettings: this.tileSettings,
            titleMap: this.titleMap,
        };
    }
}
