import { Key } from 'antd/lib/table/interface';
import { DataNode } from 'antd/lib/tree';
import DirectoryTree from 'antd/lib/tree/DirectoryTree';
import React from 'react';
import { ManifestStructureInfo } from '../utils/IIIFUtils';
import EditableText from './EditableText';

class TreeStructureProps {
  structureInfo!: ManifestStructureInfo[];
  selectedIds!: string[];
  onChangeStructureInfo!: ((structureInfo: ManifestStructureInfo[]) => void);
  onChangeSelectedIds!: ((ids: string[]) => void);
}

function TreeStructure({ structureInfo, selectedIds, onChangeSelectedIds, onChangeStructureInfo }: TreeStructureProps) {

  const changeStructureLabel = (structures: ManifestStructureInfo[], id: string, value: string): ManifestStructureInfo[] => {
    return structures.map((structure) => {
      if (structure.id === id) {
        return { ...structure, label: value }
      } else {
        return { ...structure, items: changeStructureLabel(structure.items, id, value) }
      }
    })
  }

  const handleOnSave = ( value : string, id: string) => {
    let newStructureInfo = changeStructureLabel(structureInfo, id, value);
    onChangeStructureInfo(newStructureInfo);
  };

  const handleOnSelect = ( selectedKeys: Key[], info: any ) => {
    onChangeSelectedIds(selectedKeys.map(key=>key as string));
  }

  const mapStructureToDataNodes = (structureInfo: ManifestStructureInfo[]): DataNode[] => {
    return structureInfo.map((info) => {
      let key = info.id;
      let title: React.ReactNode = info.label;
      if (info.type === "Range") {
        title = <EditableText defaultValue={info.label} onSave={(v)=>handleOnSave(v, key)} />
      }
      let children = info.items && mapStructureToDataNodes(info.items);
      let isLeaf = info.type === "Canvas";
      return {
        key, title, children, isLeaf
      }
    })
  }

  return (
  <DirectoryTree
    multiple={true}
    treeData={mapStructureToDataNodes(structureInfo)}
    onSelect={handleOnSelect}
    selectedKeys={selectedIds}
    defaultExpandAll={true}
  />);
}

export default TreeStructure;