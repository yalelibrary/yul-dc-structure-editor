import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React from 'react';
import { EditText, onSaveProps } from 'react-edit-text';
import { ManifestStructureInfo } from '../utils/IIIFUtils';

class TreeStructureProps {
  structureInfo!: ManifestStructureInfo[];
  onChangeStructureInfo!: ((structureInfo: ManifestStructureInfo[]) => void);
}

function TreeStructure({ structureInfo, onChangeStructureInfo }: TreeStructureProps) {

  const changeStructureLabel = (structures: ManifestStructureInfo[], id: string, value: string): ManifestStructureInfo[] => {
    return structures.map((structure) => {
      if (structure.id === id) {
        return { ...structure, label: value }
      } else {
        return { ...structure, items: changeStructureLabel(structure.items, id, value) }
      }
    })
  }

  const handleOnSave = ({ name, value }: onSaveProps) => {
    let newStructureInfo = changeStructureLabel(structureInfo, name, value);
    onChangeStructureInfo(newStructureInfo);
  };

  const mapStructureToDataNodes = (structureInfo: ManifestStructureInfo[]): DataNode[] => {
    return structureInfo.map((info) => {
      let key = info.id;
      let title: React.ReactNode = info.label;
      if (info.type === "Range") {
        title = <EditText defaultValue={info.label} onSave={handleOnSave} name={info.id} />
      }
      let children = info.items && mapStructureToDataNodes(info.items);
      return {
        key, title, children
      }
    })
  }


  return (<Tree
    treeData={mapStructureToDataNodes(structureInfo)}
  />);
}

export default TreeStructure;