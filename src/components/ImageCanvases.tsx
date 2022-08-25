import React from 'react';
import { ManifestCanvasInfo } from '../utils/IIIFUtils';
import CanvasImage from './CanvasImage';

class ImageListProps {
  selectedCanvasIds: string[] = [];
  canvasInfo: ManifestCanvasInfo[] = [];
  maxWidthHeight: number = 200;
  onCanvasClick?: ((canvasId: string, shiftKey: boolean, metaKey: boolean) => void);
}

function ImageCanvases({ canvasInfo, selectedCanvasIds, maxWidthHeight, onCanvasClick }: ImageListProps) {
  return (
    <div className='image-list'>
      {canvasInfo.map((info) => {
        return <CanvasImage info={info} key={info.canvasId} maxWidthHeight={maxWidthHeight} selected={selectedCanvasIds.includes(info.canvasId)} onClick={(e) => onCanvasClick && onCanvasClick(info.canvasId, e.shiftKey, e.metaKey)} />
      })}
    </div>
  );
}

export default ImageCanvases;