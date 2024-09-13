import 'reflect-metadata';
import { BaseSettingType, RegisterType } from './BaseSettingType.ts';
import { MosaicNode } from 'react-mosaic-component';

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
            settings: this.settings,
        };
    }
}

type ViewId = 'tile1' | 'tile2' | 'tile3';
type LocalMosaicState = MosaicNode<ViewId> | null;

@RegisterType
export class LayOutType extends BaseSettingType {
    settings: MosaicNode<any>;

    constructor(object: LocalMosaicState = null) {
        super();
        this.settings = object;
    }

    toObject(): object {
        return {
            settings: this.settings,
        };
    }
}
