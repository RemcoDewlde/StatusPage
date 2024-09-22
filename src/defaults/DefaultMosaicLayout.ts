import { MosaicNode } from 'react-mosaic-component';
import { ViewId } from '@/utils/types.ts';

const DEFAULT_LAYOUT: MosaicNode<ViewId> = {
    direction: 'row',
    first: 'tile1',
    second: {
        direction: 'column',
        first: 'tile2',
        second: 'tile3',
    },
};

export default DEFAULT_LAYOUT;
