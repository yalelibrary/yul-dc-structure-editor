import React, { useState, useEffect } from 'react';
import { Layout, Modal } from 'antd';
import { downloadManifest, saveManifest, setApiKeyGlobal } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import ImageCanvases from './components/ImageCanvases'
import LaunchModal from './components/LaunchModal';
import { canvasInfoFromManifest, ManifestCanvasInfo, ManifestStructureInfo, structureInfoFromManifest, manifestFromStructureInfo, addNewRange, allStructureKeys, createNewRange, addCavasesToRange, findStructureByKey, deleteItemsByKey } from './utils/IIIFUtils';
import './App.css';
import TreeStructure from './components/TreeStructure';
const { Sider, Content } = Layout;


function App() {

  const [isOpenManifestModalVisible, setIsOpenManifestModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest] = useState<{ [key: string]: any } | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [canvasInfo, setCanvasInfo] = useState<ManifestCanvasInfo[]>([]);
  const [structureInfo, setStructureInfo] = useState<ManifestStructureInfo[]>([]);
  const [selectedCanvasIds, setSelectedCanvasIds] = useState<string[]>([]);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectedStructureKeys, setSelectedStructureKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

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
      setManifestUrl(manifestUrl);
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

  const handleSubmit = () => {
    if (manifestUrl) {
      let manifest = { ...loadedManifest }
      manifest['structures'] = manifestFromStructureInfo(structureInfo);
      saveManifest(manifestUrl, manifest).then((manifest) => {
        setLoadedManifest(manifest);
        showInfo("Success", "Manifest Saved");
      }).catch((error) => {
        showError("Unable to save", error.response?.message || "Error Saving Manifest");
      })
    }
  }

  return (
    <Layout className="main-container">
      <TopHeader onOpenModal={handleOpenModal}
        onAddRange={handleOnAddRange} addRangeEnabled={selectedStructureKeys.length === 0 || isSingleRangeSelected() || structureInfo.length === 0}
        onAddCanvas={handleOnAddCanvases} addCanvasEnabled={isSingleRangeSelected() && selectedCanvasIds.length > 0}
        deleteEnabled={selectedStructureKeys.length > 0} onDelete={handleDelete}
        saveManifest={true} onSubmit={handleSubmit} />

      <Layout>
        <LaunchModal isModalVisible={isOpenManifestModalVisible} setIsModalVisible={setIsOpenManifestModalVisible} setApiKeyAndManifest={setApiKeyAndManifest} />
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
          <ImageCanvases canvasInfo={canvasInfo} selectedCanvasIds={selectedCanvasIds} maxWidthHeight={200} onCanvasClick={handleCanvasClicked} />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
