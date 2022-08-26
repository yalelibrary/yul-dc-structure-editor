import { faRemove } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout, Button, Divider } from 'antd';
import React from 'react';
const { Header } = Layout;

class TopHeaderProps {
  addRangeEnabled: boolean = true;
  addCanvasEnabled: boolean = true;
  deleteEnabled: boolean = true;
  saveManifest: boolean = true;
  onOpenModal!: (() => void);
  onAddRange!: (() => void);
  onAddCanvas!: (() => void);
  onDelete!: (() => void);
  onSubmit!: (() => void);
}

function TopHeader({ addRangeEnabled, addCanvasEnabled, deleteEnabled, onOpenModal, onAddRange, onAddCanvas, onDelete, onSubmit, saveManifest }: TopHeaderProps) {

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
    <Divider type="vertical" />
    <Button onClick={onDelete} disabled={!deleteEnabled} title="Delete Selected Structure Items">
      <FontAwesomeIcon icon={faRemove} />
    </Button>
    <Divider type="vertical" />
    <Button onClick={onSubmit} disabled={!saveManifest} title="Submit ">
      Submit
    </Button>

  </Header>);
}

export default TopHeader;