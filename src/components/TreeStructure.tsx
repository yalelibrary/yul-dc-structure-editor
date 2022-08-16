import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React, { useState } from 'react';
import { ManifestCanvasInfo, ManifestStructureInfo } from '../utils/IIIFUtils';
import EditableText from './EditableText';
import { FolderOutlined, FolderOpenOutlined, FileImageOutlined } from '@ant-design/icons';
import { Key } from 'antd/lib/table/interface';

class TreeStructureProps {
  structureInfo!: ManifestStructureInfo[];
  canvasInfo?: ManifestCanvasInfo[];
  selectedIds!: string[];
  expandedIds!: string[];
  onChangeStructureInfo!: ((structureInfo: ManifestStructureInfo[]) => void);
  onChangeSelectedIds!: ((ids: string[]) => void);
  onChangeExpandedIds!: ((ids: string[]) => void);
}

function TreeStructure({ structureInfo, selectedIds, expandedIds, canvasInfo, onChangeSelectedIds, onChangeStructureInfo, onChangeExpandedIds }: TreeStructureProps) {

  const [selectionStart, setSelectionStart] = useState<string | null>(null);

  const changeStructureLabel = (structures: ManifestStructureInfo[], id: string, value: string): ManifestStructureInfo[] => {
    return structures.map((structure) => {
      if (structure.id === id) {
        return { ...structure, label: value }
      } else {
        return { ...structure, items: changeStructureLabel(structure.items, id, value) }
      }
    })
  }

  const handleOnSave = (value: string, id: string) => {
    let newStructureInfo = changeStructureLabel(structureInfo, id, value);
    onChangeStructureInfo(newStructureInfo);
  };

  const recursiveGetIds = (structureInfo: ManifestStructureInfo[], id1: string, id2: string, selecting = false, selectedIds: string[] = []): { ids: string[], selecting: boolean } => {
    for (let structure of structureInfo) {
      if (structure.id === id1 || structure.id === id2) {
        if (!selecting) {
          selecting = true;
          selectedIds.push(structure.id);
          selecting = recursiveGetIds(structure.items, id1, id2, selecting, selectedIds).selecting;
        } else {
          selecting = false;
          selectedIds.push(structure.id);
          return { ids: selectedIds, selecting: false };
        }
      } else {
        if (selecting) {
          selectedIds.push(structure.id);
        }
        selecting = recursiveGetIds(structure.items, id1, id2, selecting, selectedIds).selecting;
      }
    }
    return { ids: selectedIds, selecting };
  }

  const handleExpand = (expandedKeys: Key[]) => {
    onChangeExpandedIds(expandedKeys.map((key) => key as string))
  }

  const handleNodeClicked = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, id: string, allowClosing: boolean) => {
    if (event.metaKey) {
      if (selectedIds.includes(id)) {
        let newSelectedIds = selectedIds.filter((value) => value !== id);
        onChangeSelectedIds(newSelectedIds);
        setSelectionStart(null);
      } else {
        onChangeSelectedIds([...selectedIds, id]);
        setSelectionStart(id);
      }
    } else if (event.shiftKey) {
      if (id === selectionStart) {
        // do nothing
      } else if (selectionStart) {
        let newSelectedIds = [...selectedIds, ...recursiveGetIds(structureInfo, selectionStart, id).ids.filter((value) => !selectedIds.includes(value))];
        onChangeSelectedIds(newSelectedIds);
        setSelectionStart(id);
      } else {
        onChangeSelectedIds([id]);
        setSelectionStart(id);
      }
    } else {
      onChangeSelectedIds([id]);
      setSelectionStart(id);
    }
    if (!expandedIds.includes(id)) {
      onChangeExpandedIds([...expandedIds, id]);
    } else if (allowClosing) {
      onChangeExpandedIds(expandedIds.filter((nodeId) => nodeId !== id));
    }
  }

  const lookupCanvasThumbnail = (id: string): string | null => {
    if (canvasInfo) {
      for (let canvas of canvasInfo) {
        if (canvas.canvasId === id) {
          let imageIdComponents = canvas.imageId.split("/");
          imageIdComponents[imageIdComponents.length - 3] = "!20,20";
          return imageIdComponents.join("/");
        }
      }
    }
    return null;
  }

  const mapStructureToDataNodes = (structureInfo: ManifestStructureInfo[]): DataNode[] => {
    return structureInfo.map((info) => {
      let imageThumb = null;
      let key = info.id;
      let title: React.ReactNode = info.label;
      if (info.type === "Range") {
        title = <EditableText defaultValue={info.label} onSave={(v) => handleOnSave(v, key)} />
      } else {
        let imageIconSrc = lookupCanvasThumbnail(info.id);
        if (imageIconSrc) {
          imageThumb = <img src={imageIconSrc} alt={info.id} loading="lazy" />
        }
      }
      let icon: any = info.type === "Canvas" ? (imageThumb || <FileImageOutlined />) : ((expandedIds.includes(key) && info.items.length > 0) ? <FolderOpenOutlined /> : <FolderOutlined />)
      title = <span><span onClick={(e) => { handleNodeClicked(e, key, true) }}>{icon}</span> <span onClick={(e) => { handleNodeClicked(e, key, false) }}>{title}</span></span>
      let children = info.items && mapStructureToDataNodes(info.items);
      return {
        key, title, children
      }
    })
  }

  return (
    <Tree
      multiple={true}
      treeData={mapStructureToDataNodes(structureInfo)}
      selectedKeys={selectedIds}
      onExpand={handleExpand}
      expandedKeys={expandedIds}
      defaultExpandAll={true}
    />);
}

export default TreeStructure;