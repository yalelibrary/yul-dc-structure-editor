import React from 'react';
import { ManifestCanvasInfo } from '../utils/IIIFUtils';


class ImageListProps {
  selectedOids: string[] = [];
  canvasInfo: ManifestCanvasInfo[] = [];
  onCanvasClick?: ((oid: string, shiftKey: boolean, metaKey: boolean) => void);
}


function ImageCanvas({ canvasInfo, selectedOids, onCanvasClick }: ImageListProps) {
  return (
    <div className='image-list'>
      {canvasInfo.map((info) => {
        return <div className={'item' + (selectedOids.includes(info.oid) ? " selected" : "")} key={info.oid} onClick={(e) => {
          if (onCanvasClick) {
            onCanvasClick(info.oid, e.shiftKey, e.metaKey)
          }
        }}>
          <img src={info.thumbnail} alt={info.label + " " + info.oid} /><br />
          <span className='item-index'>{(info.index + 1) + ": "}</span> <span className='item-label'>{info.label}</span>
        </div>
      })}
    </div>
  );
}

export default ImageCanvas;