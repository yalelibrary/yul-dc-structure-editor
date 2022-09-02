import { Pagination } from 'antd';
import React, { useEffect, useState } from 'react';
import { ManifestCanvasInfo } from '../utils/IIIFUtils';
import CanvasImage from './CanvasImage';

class ImageListProps {
  selectedCanvasIds: string[] = [];
  canvasInfo: ManifestCanvasInfo[] = [];
  maxWidthHeight: number = 200;
  onShowCanvas!: ((id: string) => void);
  onCanvasClick?: ((canvasId: string, shiftKey: boolean, metaKey: boolean) => void);
}

function ImageCanvases({ canvasInfo, selectedCanvasIds, maxWidthHeight, onCanvasClick, onShowCanvas }: ImageListProps) {

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    setPage(0);
    setPageSize(50);
  }, [canvasInfo]);

  const handlePageChange = (current: any, size: any) => {
    setPage(current - 1);
    setPageSize(size);
  }

  return (
    <div className="canvases">
      <div className='image-list'>
        {canvasInfo.slice(page * pageSize, (page + 1) * pageSize).map((info) => {
          return <CanvasImage key={info.canvasId} info={info} maxWidthHeight={maxWidthHeight}
            onDoubleClick={(e) => onShowCanvas(info.imageId)}
            selected={selectedCanvasIds.includes(info.canvasId)} onClick={(e) => onCanvasClick && onCanvasClick(info.canvasId, e.shiftKey, e.metaKey)} />
        })}
      </div>
      <div className='canvases-footer'>
        {canvasInfo.length / pageSize > 1 && <Pagination
          total={canvasInfo.length}
          current={page + 1}
          pageSize={pageSize}
          showSizeChanger
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />}
      </div>
    </div>
  );
}

export default ImageCanvases;