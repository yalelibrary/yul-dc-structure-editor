import React, {useState} from 'react';
import { Layout } from 'antd';
import { downloadManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import LaunchModal from './components/LaunchModal';
import './App.css';
const { Sider, Content } = Layout;


function App() {

  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  }

  const setApiKeyAndManifest = (apiKey: string, manifestUrl: string) => {
    setApiKeyGlobal(apiKey);
    downloadManifest(manifestUrl).then((manifest) => {
      console.log(manifest);
    });
  }

  return (
    <Layout>
      <TopHeader onOpenModal={handleOpenModal} />
      <Layout>
        <LaunchModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} setApiKeyAndManifest={setApiKeyAndManifest}/>
        <Sider>
          <p>tree</p>
        </Sider>
        <Content>
          <p>images</p>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
