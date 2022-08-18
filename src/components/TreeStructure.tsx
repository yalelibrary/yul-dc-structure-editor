import { Tree } from 'antd';
import { DataNode, TreeProps } from 'antd/lib/tree';
import React, { useState } from 'react';
import { ManifestCanvasInfo, ManifestStructureInfo, findStructureByKey } from '../utils/IIIFUtils';
import EditableText from './EditableText';
import { Key } from 'antd/lib/table/interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFolderOpen, faImage } from '@fortawesome/free-solid-svg-icons';

class TreeStructureProps {
  structureInfo!: ManifestStructureInfo[];
  canvasInfo?: ManifestCanvasInfo[];
  selectedKeys!: string[];
  expandedKeys!: string[];
  onStructureInfoChange!: ((structureInfo: ManifestStructureInfo[]) => void);
  onSelectedKeysChange!: ((keys: string[]) => void);
  onExpandedKeysChange!: ((keys: string[]) => void);
}

function TreeStructure({ structureInfo, selectedKeys, expandedKeys, canvasInfo, onSelectedKeysChange, onStructureInfoChange, onExpandedKeysChange }: TreeStructureProps) {

  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [dragStructure, setDragStructure] = useState<ManifestStructureInfo | null>(null);

  const changeStructureLabel = (key: string, value: string): ManifestStructureInfo[] => {
    findStructureByKey(structureInfo, key, (structure) => {
      structure.label = value;
    });
    return [...structureInfo]
  }

  const handleOnSave = (value: string, key: string) => {
    let newStructureInfo = changeStructureLabel(key, value);
    onStructureInfoChange(newStructureInfo);
  };

  const findKeysBetweenKeysInclusive = (structureInfo: ManifestStructureInfo[], key1: string, key2: string, selecting = false, selectedKeys: string[] = []): { keys: string[], selecting: boolean } => {
    for (let structure of structureInfo) {
      if (structure.key === key1 || structure.key === key2) {
        if (!selecting) {
          selecting = true;
          selectedKeys.push(structure.key);
          selecting = findKeysBetweenKeysInclusive(structure.items, key1, key2, selecting, selectedKeys).selecting;
        } else {
          selecting = false;
          selectedKeys.push(structure.key);
          return { keys: selectedKeys, selecting: false };
        }
      } else {
        if (selecting) {
          selectedKeys.push(structure.key);
        }
        selecting = findKeysBetweenKeysInclusive(structure.items, key1, key2, selecting, selectedKeys).selecting;
      }
    }
    return { keys: selectedKeys, selecting };
  }

  const handleExpand = (expandedKeys: Key[]) => {
    onExpandedKeysChange(expandedKeys.map((key) => key as string))
  }

  const handleNodeClicked = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, key: string, allowClosing: boolean) => {
    if (event.metaKey) {
      if (selectedKeys.includes(key)) {
        let newSelectedKeys = selectedKeys.filter((value) => value !== key);
        onSelectedKeysChange(newSelectedKeys);
        setSelectionStart(null);
      } else {
        onSelectedKeysChange([...selectedKeys, key]);
        setSelectionStart(key);
      }
    } else if (event.shiftKey) {
      if (key === selectionStart) {
        // do nothing
      } else if (selectionStart) {
        let newSelectedKeys = [...selectedKeys, ...findKeysBetweenKeysInclusive(structureInfo, selectionStart, key).keys.filter((value) => !selectedKeys.includes(value))];
        onSelectedKeysChange(newSelectedKeys);
        setSelectionStart(key);
      } else {
        onSelectedKeysChange([key]);
        setSelectionStart(key);
      }
    } else {
      onSelectedKeysChange([key]);
      setSelectionStart(key);
    }
    if (!expandedKeys.includes(key)) {
      onExpandedKeysChange([...expandedKeys, key]);
    } else if (allowClosing) {
      onExpandedKeysChange(expandedKeys.filter((nodeId) => nodeId !== key));
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
      let title: React.ReactNode = info.label;
      let key = info.key;
      if (info.type === "Range") {
        title = <EditableText defaultValue={info.label} onSave={(v) => handleOnSave(v, info.key)} />
      } else {
        let imageIconSrc = lookupCanvasThumbnail(info.id);
        if (imageIconSrc) {
          imageThumb = <img src={imageIconSrc} alt={info.id} loading="lazy" />
        }
      }
      let icon: any = info.type === "Canvas" ? (imageThumb || <FontAwesomeIcon icon={faImage} />) : ((expandedKeys.includes(info.key) && info.items.length > 0) ? <FontAwesomeIcon icon={faFolderOpen} /> : <FontAwesomeIcon icon={faFolder} />)
      title = <span><span onClick={(e) => { handleNodeClicked(e, info.key, true) }}>{icon}</span> <span onClick={(e) => { handleNodeClicked(e, info.key, false) }}>{title}</span></span>
      let children = info.items && mapStructureToDataNodes(info.items);
      return {
        key, title, children
      }
    })
  }

  const handleDragStart: TreeProps['onDragStart'] = ({event, node}) => {
    findStructureByKey(structureInfo, node.key as string, (structure) => {
      setDragStructure(structure)
    })
  }

  const allowDrop: TreeProps['allowDrop'] = ({ dropNode, dropPosition }) => {
    let allow = true;
    findStructureByKey(structureInfo, dropNode.key as string, (structure, index, items) => {
      if ((structure.type === "Canvas" && dropPosition === 0) || 
          (dropPosition === 0 && dragStructure!.type === "Canvas" && structure.items.find((item) => item.id === dragStructure!.id) && !structure.items.find((item) => item.key === dragStructure!.key)) || 
          (dropPosition === 1 && dragStructure!.type === "Canvas" && items.find((item) => item.id === dragStructure!.id) && !items.find((item) => item.key === dragStructure!.key)))
      {
        allow = false
      } 
    });
    return allow;
  };

  const onDrop: TreeProps['onDrop'] = (info: any) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const parentItems = [...structureInfo];
    //return;


    // Find dragObject
    let dragObj: ManifestStructureInfo;

    // hack to keep indexes in canvas paths the same until move is complete
    findStructureByKey(parentItems, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      findStructureByKey(parentItems, dropKey, item => {
        item.items = item.items || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.items.unshift(dragObj);
      });
    } else if (
      ((info.node as any).items || []).length > 0 && // Has items
      (info.node as any).expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      findStructureByKey(parentItems, dropKey, item => {
        item.items = item.items || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.items.unshift(dragObj);
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      });
    } else {
      let ar: ManifestStructureInfo[] = [];
      let i: number;
      findStructureByKey(parentItems, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i!, 0, dragObj!);
      } else {
        ar.splice(i! + 1, 0, dragObj!);
      }
    }
    onStructureInfoChange(parentItems);
  };


  return (
    <Tree
      className="draggable-tree"
      draggable
      blockNode
      allowDrop={allowDrop}
      onDragStart={handleDragStart}
      onDrop={onDrop}
      multiple={true}
      treeData={mapStructureToDataNodes(structureInfo)}
      selectedKeys={selectedKeys}
      onExpand={handleExpand}
      expandedKeys={expandedKeys}
      defaultExpandAll={true}
    />);
}

export default TreeStructure;