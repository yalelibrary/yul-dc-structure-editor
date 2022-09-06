import { faDrawPolygon, faRemove, faVectorSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout, Button, Divider } from 'antd';
import React from 'react';
const { Header } = Layout;

class TopHeaderProps {
  addRangeEnabled: boolean = true;
  addCanvasEnabled: boolean = true;
  addPartialCanvasEnabled?: boolean = true;
  deleteEnabled: boolean = true;
  saveManifest: boolean = true;
  showOpenManifest: boolean = true;
  manifestUrl!: string;
  onOpenModal!: (() => void);
  onAddRange!: (() => void);
  onAddCanvas!: (() => void);
  onAddPartialCanvas?: (() => void);
  onAddPartialSVGCanvas?: (() => void);
  onDelete!: (() => void);
  onSubmit!: (() => void);
}


function TopHeader({ addRangeEnabled, addCanvasEnabled, deleteEnabled, manifestUrl, showOpenManifest, addPartialCanvasEnabled, saveManifest, onOpenModal, onAddRange, onAddCanvas, onDelete, onAddPartialCanvas, onAddPartialSVGCanvas, onSubmit }: TopHeaderProps) {

  return (<Header className='header'>
    <div className='display-flex'>
      {showOpenManifest &&
        <Button onClick={onOpenModal}>
          Get Manifest
        </Button>}
      <Divider type="vertical" />
      <Button onClick={onAddRange} disabled={!addRangeEnabled}>
        Range +
      </Button>
      <Button onClick={onAddCanvas} disabled={!addCanvasEnabled}>
        Canvas +
      </Button>
      <Button onClick={onAddPartialCanvas} disabled={!addPartialCanvasEnabled}>
        <FontAwesomeIcon icon={faVectorSquare} />
      </Button>
      <Button onClick={onAddPartialSVGCanvas} disabled={!addPartialCanvasEnabled}>
        <FontAwesomeIcon icon={faDrawPolygon} />
      </Button>
      <Divider type="vertical" />
      <Button onClick={onDelete} disabled={!deleteEnabled} title="Delete Selected Structure Items">
        <FontAwesomeIcon icon={faRemove} />
      </Button>
      <Divider type="vertical" className='flex-grow' />
      <Button onClick={onSubmit} disabled={!saveManifest} title={`Submit to ${manifestUrl}`}>
        Submit
      </Button>
    </div>
  </Header>);
}

export default TopHeader;