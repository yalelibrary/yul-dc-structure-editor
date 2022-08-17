import React, { useState, useEffect } from 'react';
import { Layout, Modal } from 'antd';
import { downloadManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import ImageCanvas from './components/ImageCanvas'
import LaunchModal from './components/LaunchModal';
import { canvasInfoFromManifest, ManifestCanvasInfo, ManifestStructureInfo, structureInfoFromManifest, addNewRange, allStructureIds, createNewRange, addNewCanvas, findManifestStructureInfo, deleteItemsById } from './utils/IIIFUtils';
import './App.css';
import TreeStructure from './components/TreeStructure';
const { Sider, Content } = Layout;


function App() {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest] = useState<{ [key: string]: any } | null>(null);
  const [canvasInfo, setCanvasInfo] = useState<ManifestCanvasInfo[]>([]);
  const [structureInfo, setStructureInfo] = useState<ManifestStructureInfo[]>([]);
  const [selectedCanvasIds, setSelectedCanvasIds] = useState<string[]>([]);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectedStructureIds, setSelectedStructureIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    let canvasInfo = canvasInfoFromManifest(loadedManifest);
    canvasInfo && setCanvasInfo(canvasInfo);
    setSelectStart(null);
    setSelectedCanvasIds([]);
    let structureInfo = structureInfoFromManifest(loadedManifest);
    setStructureInfo(structureInfo || []);
    setExpandedIds(allStructureIds(structureInfo))
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
    setSelectedCanvasIds(newSelections);
  }

  const handleChangeStructureInfo = (structureInfo: ManifestStructureInfo[]) => {
    setStructureInfo(structureInfo);
  }

  const handleOnAddRange = () => {
    if (selectedStructureIds.length === 1) {
      let newStructureInfo = addNewRange(structureInfo, selectedStructureIds[0]);
      setStructureInfo(newStructureInfo);
      if (!expandedIds.includes(selectedStructureIds[0])) {
        setExpandedIds([...expandedIds, selectedStructureIds[0]]);
      }
    } else if (selectedStructureIds.length === 0) {
      let newStructureInfo: ManifestStructureInfo[] = [...structureInfo, createNewRange()];
      setStructureInfo(newStructureInfo); 
    } else if (structureInfo.length === 0) {
      setStructureInfo([createNewRange()]);
    }
  }

  const handleOnAddCanvas = () => {
    let canvasInfoSet = canvasInfo.filter((o) => selectedCanvasIds.includes(o.canvasId));
    let newStructureInfo = addNewCanvas(structureInfo, selectedStructureIds[0], canvasInfoSet);
    setStructureInfo(newStructureInfo);
  }

  const handleOnSelectedIdsChange = (ids: string[]) => {
    setSelectedStructureIds(ids);
  }

  const handleDelete = () => {
    setStructureInfo(deleteItemsById(structureInfo, selectedStructureIds));
    setExpandedIds(expandedIds.filter((id)=>!selectedStructureIds.includes(id)));
    setSelectedStructureIds([]);
  }

  const isRangeSelected = (): boolean => {
    if (selectedStructureIds.length !== 1) {
      return false;
    } else {
      let selectedItem = findManifestStructureInfo(structureInfo, selectedStructureIds[0]);
      return (selectedItem && selectedItem.type === "Range") || false;
    }
  }

  return (
    <Layout className="main-container">
      <TopHeader onOpenModal={handleOpenModal}
        onAddRange={handleOnAddRange} addRangeEnabled={selectedStructureIds.length === 0 || isRangeSelected() || structureInfo.length === 0}
        onAddCanvas={handleOnAddCanvas} addCanvasEnabled={isRangeSelected() && selectedCanvasIds.length > 0}
        deleteEnabled={selectedStructureIds.length > 0} onDelete={handleDelete} />
      <Layout>
        <LaunchModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} setApiKeyAndManifest={setApiKeyAndManifest} />
        <Sider className="sider">
          <TreeStructure
            selectedIds={selectedStructureIds}
            structureInfo={structureInfo}
            expandedIds={expandedIds}
            canvasInfo={canvasInfo}
            onChangeStructureInfo={handleChangeStructureInfo}
            onChangeSelectedIds={handleOnSelectedIdsChange}
            onChangeExpandedIds={setExpandedIds}
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
