import React, { useState, useEffect } from 'react';
import { Layout, Modal } from 'antd';
import { downloadManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import ImageCanvas from './components/ImageCanvas'
import LaunchModal from './components/LaunchModal';
import { canvasInfoFromManifest, ManifestCanvasInfo, Rectangle, ManifestStructureInfo, structureInfoFromManifest, addNewRange, allStructureKeys, createNewRange, addCavasesToRange, findStructureByKey, deleteItemsByKey, addPartialCavasesToRange } from './utils/IIIFUtils';
import './App.css';
import TreeStructure from './components/TreeStructure';
import PartialCanvasSelector from './components/PartialCanvasSelector';
const { Sider, Content } = Layout;


function App() {

  const [isOpenManifestModalVisible, setIsOpenManifestModalVisible] = useState(false);
  const [isPartialModalVisible, setIsPartialModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest] = useState<{ [key: string]: any } | null>(null);
  const [canvasInfo, setCanvasInfo] = useState<ManifestCanvasInfo[]>([]);
  const [structureInfo, setStructureInfo] = useState<ManifestStructureInfo[]>([]);
  const [selectedCanvasIds, setSelectedCanvasIds] = useState<string[]>([]);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectedStructureKeys, setSelectedStructureKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedImageRectangle, setSelectedImageRectangle] = useState<Rectangle | null>(null);

  useEffect(() => {
    let canvasInfo = canvasInfoFromManifest(loadedManifest);
    canvasInfo && setCanvasInfo(canvasInfo);
    setSelectStart(null);
    setSelectedCanvasIds([]);
    let structureInfo = structureInfoFromManifest(loadedManifest);
    setStructureInfo(structureInfo || []);
    setExpandedKeys(allStructureKeys(structureInfo))
    setSelectedStructureKeys([]);
  }, [loadedManifest])

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
    setIsOpenManifestModalVisible(true);
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
    setSelectedCanvasIds(newSelections);
  }

  const expandKey = (key: string) => {
    if (!expandedKeys.includes(key)) {
      setExpandedKeys([...expandedKeys, key]);
    }
  }

  const handleOnAddRange = () => {
    if (selectedStructureKeys.length === 1) {
      setStructureInfo(addNewRange(structureInfo, selectedStructureKeys[0]));
      expandKey(selectedStructureKeys[0]);
    } else if (selectedStructureKeys.length === 0) {
      setStructureInfo([...structureInfo, createNewRange()]);
    } else if (structureInfo.length === 0) {
      setStructureInfo([createNewRange()]);
    }
  }

  const handleOnAddCanvases = () => {
    let canvasInfoSet = canvasInfo.filter((o) => selectedCanvasIds.includes(o.canvasId));
    let newStructureInfo = addCavasesToRange(structureInfo, selectedStructureKeys[0], canvasInfoSet);
    setStructureInfo(newStructureInfo);
    expandKey(selectedStructureKeys[0]);
  }

  const handleDelete = () => {
    setStructureInfo(deleteItemsByKey(structureInfo, selectedStructureKeys));
    setExpandedKeys(expandedKeys.filter((keys) => !selectedStructureKeys.includes(keys)));
    setSelectedStructureKeys([]);
  }

  const isSingleRangeSelected = (): boolean => {
    if (selectedStructureKeys.length !== 1) {
      return false;
    } else {
      let selectedIsRange = false;
      findStructureByKey(structureInfo, selectedStructureKeys[0], (structure) => {
        selectedIsRange = structure.type === "Range";
      });
      return selectedIsRange;
    }
  }

  const handleOnAddPartialCanvas = () => {
    setIsPartialModalVisible(true);
  }

  const selectedCanvasImageId = () => {
    if (selectedCanvasIds.length > 0) {
      let canvas = canvasInfo.find((c) => c.canvasId === selectedCanvasIds[0]);
      if (canvas) {
        return canvas.imageId;
      }
    }
  }

  const handleAddPartialCanvas = () => {
    setIsPartialModalVisible(false);
    if (selectedImageRectangle) {
      let canvasInfos = canvasInfo.filter((o) => selectedCanvasIds.includes(o.canvasId));
      if (canvasInfos.length === 1) {
        let newStructureInfo = addPartialCavasesToRange(structureInfo, selectedStructureKeys[0], canvasInfos[0], selectedImageRectangle);
        setStructureInfo(newStructureInfo);
      }
    }
  }

  return (
    <Layout className="main-container">
      <TopHeader onOpenModal={handleOpenModal}
        onAddRange={handleOnAddRange} addRangeEnabled={selectedStructureKeys.length === 0 || isSingleRangeSelected() || structureInfo.length === 0}
        onAddCanvas={handleOnAddCanvases} addCanvasEnabled={isSingleRangeSelected() && selectedCanvasIds.length > 0}
        onAddPartialCanvas={handleOnAddPartialCanvas} addPartialCanvasEnabled={selectedCanvasIds.length === 1 && isSingleRangeSelected()}
        deleteEnabled={selectedStructureKeys.length > 0} onDelete={handleDelete} />
      <Layout>
        <LaunchModal isModalVisible={isOpenManifestModalVisible} setIsModalVisible={setIsOpenManifestModalVisible} setApiKeyAndManifest={setApiKeyAndManifest} />
        <Modal visible={isPartialModalVisible} onOk={handleAddPartialCanvas} onCancel={() => setIsPartialModalVisible(false)} width={600}>
          <PartialCanvasSelector imageId={selectedCanvasImageId()} onRectangleSelected={setSelectedImageRectangle} />
        </Modal>
        <Sider className="sider">
          <TreeStructure
            selectedKeys={selectedStructureKeys}
            structureInfo={structureInfo}
            expandedKeys={expandedKeys}
            canvasInfo={canvasInfo}
            onStructureInfoChange={setStructureInfo}
            onSelectedKeysChange={setSelectedStructureKeys}
            onExpandedKeysChange={setExpandedKeys}
          />
        </Sider>
        <Content>
          <ImageCanvas canvasInfo={canvasInfo} selectedCanvasIds={selectedCanvasIds} onCanvasClick={handleCanvasClicked} />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
