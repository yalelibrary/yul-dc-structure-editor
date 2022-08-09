import React, {useState} from 'react';
import { Layout, Modal } from 'antd';
import { downloadManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import LaunchModal from './components/LaunchModal';
import './App.css';
const { Sider, Content } = Layout;


function App() {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest ] = useState<{[key: string]: any} | null>(null);

  const showError = (title: string, content: string) => {
    Modal.error({
      title: title,
      content: content,
    });
  };

  const showInfo = (title: string, content: string) => {
    Modal.info({
      title: title,
      content: content,
    });
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  }

  const setApiKeyAndManifest = (apiKey: string, manifestUrl: string) => {
    setApiKeyGlobal(apiKey);
    setLoadedManifest(null);
    downloadManifest(manifestUrl).then((manifest) => {
      setLoadedManifest(manifest);
      showInfo("Success", "Manifest Downloaded");
    }).catch((error) => {
      showError("Unable to download", error.response?.message || "Error Downloading Manifest");
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
          {(loadedManifest && JSON.stringify(loadedManifest)) || "Manifest Not Loaded"}
          {/* <p>images</p> */}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
