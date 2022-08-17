import { Layout, Button } from 'antd';
import React from 'react';
const { Header } = Layout;

class TopHeaderProps {
  addRangeEnabled: boolean = true;
  addCanvasEnabled: boolean = true;
  onOpenModal!: (() => void);
  onAddRange!: (() => void);
  onAddCanvas!: (() => void);
}

function TopHeader({addRangeEnabled, addCanvasEnabled, onOpenModal, onAddRange, onAddCanvas}: TopHeaderProps) {

    return (<Header className='display-flex header'>
      <Button onClick={onOpenModal}>
        Get Manifest
      </Button>
      <Button onClick={onAddRange} disabled={!addRangeEnabled}>
        Range +
      </Button>
      <Button onClick={onAddCanvas} disabled={!addCanvasEnabled}>
        Canvas +
      </Button>
    </Header>);
}

export default TopHeader;