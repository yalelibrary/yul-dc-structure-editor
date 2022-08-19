import { faRemove } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout, Button, Divider } from 'antd';
import React from 'react';
const { Header } = Layout;

class TopHeaderProps {
  addRangeEnabled: boolean = true;
  addCanvasEnabled: boolean = true;
  addPartialCanvasEnabled?: boolean = true;
  deleteEnabled: boolean = true;
  onOpenModal!: (() => void);
  onAddRange!: (() => void);
  onAddCanvas!: (() => void);
  onAddPartialCanvas?: (() => void);  
  onDelete!: (() => void);
}

function TopHeader({ addRangeEnabled, addCanvasEnabled, addPartialCanvasEnabled, deleteEnabled, onOpenModal, onAddRange, onAddCanvas, onAddPartialCanvas, onDelete }: TopHeaderProps) {

  return (<Header className='display-flex header'>
    <Button onClick={onOpenModal}>
      Get Manifest
    </Button>
    <Divider type="vertical" />
    <Button onClick={onAddRange} disabled={!addRangeEnabled}>
      Range +
    </Button>
    <Button onClick={onAddCanvas} disabled={!addCanvasEnabled}>
      Canvas +
    </Button>
    <Button onClick={onAddPartialCanvas} disabled={!addPartialCanvasEnabled}>
      Partial Canvas +
    </Button>
    <Divider type="vertical" />
    <Button onClick={onDelete} disabled={!deleteEnabled} title="Delete Selected Structure Items">
      <FontAwesomeIcon icon={faRemove} />
    </Button>
  </Header>);
}

export default TopHeader;