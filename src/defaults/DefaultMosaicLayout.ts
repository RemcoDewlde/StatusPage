import { MosaicNode } from 'react-mosaic-component';

const DEFAULT_LAYOUT: MosaicNode<string> = {
    direction: 'row',
    first: 'tile1',
    second: {
        direction: 'column',
        first: 'tile2',
        second: 'tile3',
    },
};

export default DEFAULT_LAYOUT;
