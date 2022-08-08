import { Layout, Button } from 'antd';
import React from 'react';
const { Header } = Layout;

class TopHeaderProps {
  onOpenModal!: (() => void);
}

function TopHeader({onOpenModal}: TopHeaderProps) {

    return (<Header className='display-flex header'>
      <Button onClick={onOpenModal}>
        Get Manifest
      </Button>
    </Header>);
}

export default TopHeader;