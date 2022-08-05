import React, {useState} from 'react';
import { Layout } from 'antd';
import { downloadManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import LaunchModal from './components/LaunchModal';
import './App.css';
const { Sider, Content } = Layout;


function App() {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest ] = useState<{[key: string]: any}>({});


  const handleOpenModal = () => {
    setIsModalVisible(true);
  }

  const setApiKeyAndManifest = (apiKey: string, manifestUrl: string) => {
    setApiKeyGlobal(apiKey);
    downloadManifest(manifestUrl).then((manifest) => {
      setLoadedManifest(manifest);
    }).catch((error) => {
      error.response.then((info: JSON) => {
        setLoadedManifest(info)
      })
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
          {JSON.stringify(loadedManifest)}
          {/* <p>images</p> */}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
