import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Layout, Modal } from 'antd';
import { downloadManifest, saveManifest, setApiKeyGlobal, updateToken } from './utils/ManagementUtils';
import TopHeader from './components/TopHeader'
import ImageCanvases from './components/ImageCanvases'
import LaunchModal from './components/LaunchModal';
import { canvasInfoFromManifest, ManifestCanvasInfo, ManifestStructureInfo, structureInfoFromManifest, manifestFromStructureInfo, addNewRange, createNewRange, addCavasesToRange, findStructureByKey, deleteItemsByKey, allStructureKeys, extractIIIFLabel, imageToInfo, Rectangle, addPartialCavasToRange, addPartialSVGCavasToRange, Position } from './utils/IIIFUtils';
import './App.css';
import TreeStructure from './components/TreeStructure';
import OpenSeadragonViewer from './components/OpenSeadragonViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import PartialCanvasSelector from './components/PartialCanvasSelector';
import PartialCanvasSVGSelector from './components/PartialCanvasSVGSelector';
const { Sider, Content } = Layout;


function App() {

  const [isOpenManifestModalVisible, setIsOpenManifestModalVisible] = useState(false);
  const [isPartialModalVisible, setIsPartialModalVisible] = useState(false);
  const [isPartialSVGModalVisible, setIsPartialSVGModalVisible] = useState(false);
  const [loadedManifest, setLoadedManifest] = useState<{ [key: string]: any } | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [canvasInfo, setCanvasInfo] = useState<ManifestCanvasInfo[]>([]);
  const [structureInfo, setStructureInfo] = useState<ManifestStructureInfo[]>([]);
  const [selectedCanvasIds, setSelectedCanvasIds] = useState<string[]>([]);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [iiifUrl, setIiifUrl] = useState<string | undefined>(undefined);
  const [selectedStructureKeys, setSelectedStructureKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedImageRectangle, setSelectedImageRectangle] = useState<Rectangle | null>(null);
  const [selectedImageSvg, setSelectedImageSvg] = useState<Position[][] | null>(null);
  const partialSelectorMaxSize = 500;
  const [showOpenManifest, setShowOpenManifest] = useState<boolean>(true);


  const componentLoaded = useRef(false);

  useEffect(() => {
    if (!componentLoaded.current) {
      componentLoaded.current = true;
      let params = new URLSearchParams(window.location.search);
      if (params.get("manifest") && params.get("token")) {
        setApiKeyAndManifest(params.get("token"), params.get("manifest") || "");
        setShowOpenManifest(false);
        params.delete("token");
        let url = new URL(window.location.href);
        url.search = params.toString();
        window.history.replaceState({ path: url.href }, "", url.href);
      } else {
        let storage: any = localStorage.getItem("manifest-info")
        if (storage && (storage = JSON.parse(storage))) {
          if (new Date().getTime() - new Date(storage["stored"]).getTime() < 1000 * 60 * 60 * 3) {
            setApiKeyAndManifest(storage["apiKey"], storage["manifest"]);
            setShowOpenManifest(false);
          }
        }
      }
    }
  }, []);


  const timer: { current: NodeJS.Timeout | null } = useRef(null);

  // update the token periodically
  React.useEffect(() => {
    if (manifestUrl) {
      timer.current = setInterval(() => {
        if (manifestUrl) updateToken(manifestUrl);
      }, 30000);
    }
    return () => {
      clearInterval(timer.current as NodeJS.Timeout);
    }
  }, [manifestUrl]);

  const setApiKeyAndManifest = (apiKey: string | null, manifestUrl: string) => {
    setApiKeyGlobal(apiKey);
    manifestLoaded(null);
    downloadManifest(manifestUrl).then((manifest) => {
      manifestLoaded(manifest);
      setManifestUrl(manifestUrl);
      // set the apiKey and manifest URL somewhere
      localStorage.setItem("manifest-info", JSON.stringify({ manifest: manifestUrl, apiKey: apiKey, stored: new Date() }))
      showInfo("Success", <div><h3>Manifest Downloaded: {extractIIIFLabel(manifest, "No Label")}</h3><div className='sub-info'>From: {manifestUrl}</div></div>);
    }).catch((error) => {
      showError("Unable to download", error.response?.message || "Error Downloading Manifest");
    });
  }

  const showError = (title: string, content: string) => {
    Modal.error({
      title: title,
      content: content,
    });
  };

  const showInfo = (title: string, content: ReactNode) => {
    Modal.info({
      title: title,
      content: content,
    });
  };

  const handleSelectedImageRectangle = (r: Rectangle) => {
    setSelectedImageRectangle(r);
  }

  const handleSelectedImageSvg = (svg: Position[][]) => {
    setSelectedImageSvg(svg);

  }

  const handleOpenModal = () => {
    setIsOpenManifestModalVisible(true);
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

  const handleShowCanvas = (image: string) => {
    setIiifUrl(imageToInfo(image));
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

  const showAddPartialCanvasImageDialog = () => {
    setIsPartialModalVisible(true);
  }

  const showAddPartialCanvasSVGImageDiagloe = () => {
    setIsPartialSVGModalVisible(true);

  }

  const selectedCanvasImage = () => {
    if (selectedCanvasIds.length > 0) {
      return canvasInfo.find((c) => c.canvasId === selectedCanvasIds[0]);
    }
  }

  const handleAddPartialCanvas = () => {
    setIsPartialModalVisible(false);
    if (selectedImageRectangle) {
      let selectedCanvas = selectedCanvasImage();
      if (selectedCanvas) {
        // dialog uses !partialSelectorMaxSize,partialSelectorMaxSize, so adjust based on natural image size
        let ratio = Math.max(selectedCanvas.width!, selectedCanvas.height!) / partialSelectorMaxSize;
        let r: Rectangle = {
          x: selectedImageRectangle.x * ratio,
          y: selectedImageRectangle.y * ratio,
          w: selectedImageRectangle.w * ratio,
          h: selectedImageRectangle.h * ratio,
        };
        let newStructureInfo = addPartialCavasToRange(structureInfo, selectedStructureKeys[0], selectedCanvas, r);
        setStructureInfo(newStructureInfo);
      }
    }
  }

  const handleAddPartialSVGCanvas = () => {
    setIsPartialSVGModalVisible(false);
    if (selectedImageSvg) {
      let selectedCanvas = selectedCanvasImage();
      if (selectedCanvas) {
        let ratio = Math.max(selectedCanvas.width!, selectedCanvas.height!) / partialSelectorMaxSize;
        let newPositions: Position[][] = [];
        for (let polygon of selectedImageSvg) {
          for (let pos of polygon) {
            pos.x = pos.x * ratio;
            pos.y = pos.y * ratio;
          }
          newPositions.push(polygon);
        }
        let newStructureInfo = addPartialSVGCavasToRange(structureInfo, selectedStructureKeys[0], selectedCanvas, newPositions);
        setStructureInfo(newStructureInfo);
      }
    }
  }

  const manifestLoaded = (manifest: any) => {
    setLoadedManifest(manifest);
    let canvasInfo = canvasInfoFromManifest(manifest);
    setCanvasInfo(canvasInfo || []);
    setSelectStart(null);
    let structureInfo = structureInfoFromManifest(manifest);
    setStructureInfo(structureInfo || []);
    let allKeys = allStructureKeys(structureInfo);
    setExpandedKeys(expandedKeys.filter((e) => allKeys.includes(e)));
    setSelectedStructureKeys(selectedStructureKeys.filter((e) => allKeys.includes(e)));
  }

  const handleSubmit = () => {
    if (manifestUrl) {
      let manifest = { ...loadedManifest }
      manifest['structures'] = manifestFromStructureInfo(structureInfo);
      saveManifest(manifestUrl, manifest).then((manifest) => {
        manifestLoaded(manifest);
        showInfo("Success", "Manifest Saved");
      }).catch((error) => {
        showError("Unable to save", error.response?.message || "Error Saving Manifest");
      })
    }
  }

  return (
    <Layout className="main-container">
      <TopHeader onOpenModal={handleOpenModal} showOpenManifest={showOpenManifest}
        manifestUrl={manifestUrl || ""}
        onAddRange={handleOnAddRange} addRangeEnabled={selectedStructureKeys.length === 0 || isSingleRangeSelected() || structureInfo.length === 0}
        onAddCanvas={handleOnAddCanvases} addCanvasEnabled={isSingleRangeSelected() && selectedCanvasIds.length > 0}
        onAddPartialCanvas={showAddPartialCanvasImageDialog} addPartialCanvasEnabled={selectedCanvasIds.length === 1 && isSingleRangeSelected()}
        onAddPartialSVGCanvas={showAddPartialCanvasSVGImageDiagloe}
        deleteEnabled={selectedStructureKeys.length > 0} onDelete={handleDelete}
        saveManifest={true}
        onSubmit={handleSubmit} />
      <Layout>
        <LaunchModal isModalVisible={isOpenManifestModalVisible} setIsModalVisible={setIsOpenManifestModalVisible} setApiKeyAndManifest={setApiKeyAndManifest} />
        <Modal visible={isPartialModalVisible} onOk={handleAddPartialCanvas} onCancel={() => setIsPartialModalVisible(false)} width={partialSelectorMaxSize + 150} className="no-select">
          <PartialCanvasSelector imageId={selectedCanvasImage()?.imageId} onRectangleSelected={handleSelectedImageRectangle} maxWidthHeight={partialSelectorMaxSize} />
        </Modal>
        <Modal visible={isPartialSVGModalVisible} onOk={handleAddPartialSVGCanvas} onCancel={() => setIsPartialSVGModalVisible(false)} width={partialSelectorMaxSize + 150} className="no-select">
          <PartialCanvasSVGSelector imageId={selectedCanvasImage()?.imageId} onSvgSelected={handleSelectedImageSvg} maxWidthHeight={partialSelectorMaxSize} />
        </Modal>

        <Layout>
          <LaunchModal isModalVisible={isOpenManifestModalVisible} setIsModalVisible={setIsOpenManifestModalVisible} setApiKeyAndManifest={setApiKeyAndManifest} />
          <Modal
            maskClosable={true}
            visible={iiifUrl !== undefined}
            okText={"Close"}
            onOk={() => setIiifUrl(undefined)}
            onCancel={() => setIiifUrl(undefined)}
            closable={true}
            closeIcon={<span className='close-btn'><FontAwesomeIcon icon={faClose}></FontAwesomeIcon></span>}
            cancelButtonProps={{ style: { display: 'none' } }}
          >
            {iiifUrl && <OpenSeadragonViewer imageUrl={iiifUrl} elementId="OpenSeaDragonViewer" />}
          </Modal>
          <Sider className="sider">
            <TreeStructure
              selectedKeys={selectedStructureKeys}
              structureInfo={structureInfo}
              expandedKeys={expandedKeys}
              canvasInfo={canvasInfo}
              onShowCanvas={handleShowCanvas}
              onStructureInfoChange={setStructureInfo}
              onSelectedKeysChange={setSelectedStructureKeys}
              onExpandedKeysChange={setExpandedKeys}
            />
          </Sider>
          <Content>
            <ImageCanvases canvasInfo={canvasInfo} selectedCanvasIds={selectedCanvasIds} maxWidthHeight={200} onCanvasClick={handleCanvasClicked}
              onShowCanvas={handleShowCanvas}
            />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
export default App;

