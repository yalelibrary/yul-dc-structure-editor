import React, {useState, useEffect} from 'react';
import { Layout, Modal } from 'antd';
import { downloadManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import ImageCanvas from './components/ImageCanvas'
import LaunchModal from './components/LaunchModal';
import { canvasInfoFromManifest, ManifestCanvasInfo, ManifestStructureInfo, structureInfoFromManifest } from './utils/IIIFUtils';
import './App.css';
import TreeStructure from './components/TreeStructure';
const { Sider, Content } = Layout;


function App() {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest ] = useState<{[key: string]: any} | null>(null);
  const [canvasInfo, setCanvasInfo] = React.useState<ManifestCanvasInfo[]>([]);
  const [structureInfo, setStructureInfo] = React.useState<ManifestStructureInfo[]>([]);
  const [selectedCanvasIds, setSelectedCanvasIds] = React.useState<string[]>([]);
  const [selectStart, setSelectStart] = React.useState<string | null>(null);

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

  const handleCanvasClicked = (canvasId: string, shiftKey: boolean, metaKey: boolean) => {
    let newSelections: string[] = [];
    if (metaKey) {
      if (selectedCanvasIds.includes(canvasId)) {
        newSelections = selectedCanvasIds.filter((id) => canvasId !== id);
        if (canvasId === selectStart) setSelectStart(null);
      } else {
        newSelections = [...selectedCanvasIds, canvasId];
        setSelectStart(canvasId);
      }
    } else if (shiftKey && selectStart && selectStart !== canvasId) {
      newSelections = [...selectedCanvasIds];
      setSelectStart(canvasId);
      let selecting = false;
      for (let c of canvasInfo) {
        if (selecting) {
          if (!newSelections.includes(c.imageId)) newSelections.push(c.canvasId);
        }
        if (c.canvasId === selectStart || c.canvasId === canvasId) {
          selecting = !selecting;
          if (!newSelections.includes(c.imageId)) newSelections.push(c.canvasId);
        }
      }
    } else {
      setSelectStart(canvasId);
      if (newSelections.includes(canvasId)) {
        newSelections = newSelections.filter((o) => o !== canvasId);
      } else {
        newSelections = [canvasId];
      }
    }
    console.log(newSelections + " " + selectStart);
    setSelectedCanvasIds(newSelections);
  }

  const handleChangeStructureInfo = (structureInfo: ManifestStructureInfo[]) => {
    setStructureInfo(structureInfo);
  }

  useEffect(() => {
    let canvasInfo = canvasInfoFromManifest(loadedManifest);
    canvasInfo && setCanvasInfo(canvasInfo);
    setSelectStart(null);
    setSelectedCanvasIds([]);
    let structureInfo = structureInfoFromManifest(loadedManifest);
    setStructureInfo(structureInfo || []);
  }, [loadedManifest])

  return (
    <Layout className="main-container">
      <TopHeader onOpenModal={handleOpenModal} />
      <Layout>
        <LaunchModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} setApiKeyAndManifest={setApiKeyAndManifest}/>
        <Sider className="sider">
          <TreeStructure
                structureInfo={structureInfo}
                onChangeStructureInfo={handleChangeStructureInfo}
            />
        </Sider>
        <Content>
          <ImageCanvas canvasInfo={canvasInfo} selectedCanvasIds={selectedCanvasIds} onCanvasClick={handleCanvasClicked}/>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
