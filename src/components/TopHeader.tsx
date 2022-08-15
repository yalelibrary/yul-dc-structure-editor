import { Layout, Button } from 'antd';
import React from 'react';
const { Header } = Layout;

class TopHeaderProps {
  addRangeEnabled: boolean = true;
  onOpenModal!: (() => void);
  onAddRange!: (() => void);
}

function TopHeader({addRangeEnabled, onOpenModal, onAddRange}: TopHeaderProps) {

    return (<Header className='display-flex header'>
      <Button onClick={onOpenModal}>
        Get Manifest
      </Button>
      <Button onClick={onAddRange} disabled={!addRangeEnabled}>
        Range +
      </Button>
    </Header>);
}

export default TopHeader;