import React from 'react';
import { ManifestCanvasInfo } from '../utils/IIIFUtils';
import CanvasImage from './CanvasImage';

class ImageListProps {
  selectedCanvasIds: string[] = [];
  canvasInfo: ManifestCanvasInfo[] = [];
  onCanvasClick?: ((canvasId: string, shiftKey: boolean, metaKey: boolean) => void);
}

function ImageCanvases({ canvasInfo, selectedCanvasIds, onCanvasClick }: ImageListProps) {
  return (
    <div className='image-list'>
      {canvasInfo.map((info) => {
        return <CanvasImage info={info} selected={selectedCanvasIds.includes(info.canvasId)} onClick={(e) => onCanvasClick && onCanvasClick(info.canvasId, e.shiftKey, e.metaKey)} />
      })}
    </div>
  );
}

export default ImageCanvases;