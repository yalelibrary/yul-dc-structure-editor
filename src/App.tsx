import React, {useState, useEffect} from 'react';
import { Layout, Modal } from 'antd';
import { downloadManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import ImageCanvas from './components/ImageCanvas'
import LaunchModal from './components/LaunchModal';
import { canvasInfoFromManifest, ManifestCanvasInfo } from './utils/IIIFUtils';
import './App.css';
const { Sider, Content } = Layout;


function App() {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest ] = useState<{[key: string]: any} | null>(null);
  const [canvasInfo, setCanvasInfo] = useState<ManifestCanvasInfo[]>([]);
  const [selectedOids, setSelectedOids] = useState<string[]>([]);
  const [selectStart, setSelectStart] = useState<string | null>(null);

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

  const handleCanvasClicked = (oid: string, shiftKey: boolean, metaKey: boolean) => {
    let newSelections: string[] = [];
    if (metaKey) {
      if (selectedOids.includes(oid)) {
        newSelections = selectedOids.filter((soid) => soid !== oid);
        if (oid === selectStart) setSelectStart(null);
      } else {
        newSelections = [...selectedOids, oid];
        setSelectStart(oid);
      }
    } else if (shiftKey && selectStart && selectStart !== oid) {
      newSelections = [...selectedOids];
      setSelectStart(oid);
      let selecting = false;
      for (let c of canvasInfo) {
        if (selecting) {
          if (!newSelections.includes(c.oid)) newSelections.push(c.oid);
        }
        if (c.oid === selectStart || c.oid === oid) {
          selecting = !selecting;
          if (!newSelections.includes(c.oid)) newSelections.push(c.oid);
        }
      }
    } else {
      setSelectStart(oid);
      if (newSelections.includes(oid)) {
        newSelections = newSelections.filter((o) => o !== oid);
      } else {
        newSelections = [oid];
      }
    }
    console.log(newSelections + " " + selectStart);
    setSelectedOids(newSelections);
  }

  useEffect(() => {
    // set the tree data based on the manifests items
    let canvasInfo = canvasInfoFromManifest(loadedManifest);
    // setTreeData(null);
    canvasInfo && setCanvasInfo(canvasInfo);
    setSelectStart(null);
    setSelectedOids([]);
    // setSelectedTreeNode(null);
  }, [loadedManifest])

  return (
    <Layout className="main-container">
      <TopHeader onOpenModal={handleOpenModal} />
      <Layout>
        <LaunchModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} setApiKeyAndManifest={setApiKeyAndManifest}/>
        <Sider className="sider">
          <p>tree</p>
        </Sider>
        <Content>
          <ImageCanvas canvasInfo={canvasInfo} selectedOids={selectedOids} onCanvasClick={handleCanvasClicked}/>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
