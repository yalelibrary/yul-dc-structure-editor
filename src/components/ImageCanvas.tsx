import React from 'react';
import { ManifestCanvasInfo } from '../utils/IIIFUtils';
import { useInView } from "react-intersection-observer";


class ImageListProps {
  selectedOids: string[] = [];
  canvasInfo: ManifestCanvasInfo[] = [];
  onCanvasClick?: ((oid: string, shiftKey: boolean, metaKey: boolean) => void);
}


function ImageCanvas({ canvasInfo, selectedOids, onCanvasClick }: ImageListProps) {

  const { ref, inView } = useInView({
    threshold: 0,
  });

  return (
    <div className='image-list' ref={ref}>
      {canvasInfo.map((info) => {
        return <div className={'item' + (selectedOids.includes(info.oid) ? " selected" : "")} key={info.oid} onClick={(e) => {
          if (onCanvasClick) {
            onCanvasClick(info.oid, e.shiftKey, e.metaKey)
          }
        }}>
          {inView && <img src={info.thumbnail} loading="lazy" alt={info.label + " " + info.oid} />}
          <br />
          <span className='item-index'>{(info.index + 1) + ": "}</span> <span className='item-label'>{info.label}</span>
        </div>
      })}
    </div>
  );
}

export default ImageCanvas;