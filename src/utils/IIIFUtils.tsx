import { v4 as uuidv4 } from 'uuid';

export function extractIIIFLabel(obj: any, defaultValue: string = ""): string {
  if (!obj || !obj["label"]) {
    return defaultValue
  }
  let title = defaultValue;
  let label_props = Object.getOwnPropertyNames(obj["label"]);
  if (label_props.length > 0) {
    title = obj["label"][label_props[0]][0]
  }
  return title;
}

export type ManifestCanvasInfo = {
  label: string;
  imageId: string;
  canvasId: string;
  oid: string;
  thumbnail: string;
  index: number;
}

export type StructureInfoType = "Range" | "Canvas" | "Removing";

export type ManifestStructureInfo = {
  key: string;
  type: StructureInfoType;
  label: string;
  id: string;
  newItem: boolean;
  items: ManifestStructureInfo[];
}

export function canvasInfoFromManifest(manifestData: any): ManifestCanvasInfo[] | null {
  let canvasInfo: ManifestCanvasInfo[] | null = null;
  if (manifestData) {
    canvasInfo = [];
    let ix = 0;
    for (let item of manifestData["items"]) {
      let id = item["id"];
      let anno = item["items"]?.[0]?.["items"]?.[0];
      let body = anno?.["body"];
      if (body instanceof Array) {
        body = body[0];
      }
      let imageId = body["id"];
      let imageIdComponents = imageId.split("/");
      imageIdComponents[imageIdComponents.length - 3] = "!200,200";
      let thumbnail = imageIdComponents.join("/");
      let oid = id.split("/").pop();
      let label = extractIIIFLabel(item, "");
      if (label) {
        label = [label, "(" + oid + ")"].join(": ");
      } else {
        label = oid;
      }
      canvasInfo.push({
        label: label,
        imageId: imageId,
        canvasId: id,
        oid: oid,
        thumbnail: thumbnail,
        index: ix++,
      }
      );
    }
  }
  return canvasInfo;
}

export function structureInfoFromManifest(manifestData: any): ManifestStructureInfo[] | null {
  let structures: ManifestStructureInfo[] | null = null;
  if (manifestData && manifestData["structures"]) {
    let itemIdToLabelMap: any = {};
    for (let item of manifestData["items"]) {
      itemIdToLabelMap[item["id"]] = extractIIIFLabel(item);
    }
    structures = [];
    for (let structure of manifestData["structures"]) {
      structures.push(extractStructureInfoFromManifest(structure, itemIdToLabelMap))
    }
  }
  return structures;
}

export function manifestFromStructureInfo(structureInfo: ManifestStructureInfo[]): any[] | null {
  let structure = [];

  if (man && manifestData["structures"]) {
    let itemIdToLabelMap: any = {};
    for (let item of manifestData["items"]) {
      itemIdToLabelMap[item["id"]] = extractIIIFLabel(item);
    }
    structures = [];
    for (let structure of manifestData["structures"]) {
      structures.push(extractStructureInfoFromManifest(structure, itemIdToLabelMap))
    }
  }
  return structures;
}


function extractStructureInfoFromManifest(structure: any, itemIdToLabelMap: any): ManifestStructureInfo {
  let label = extractIIIFLabel(structure, "");
  let id = structure["id"];
  let type: StructureInfoType = (structure["type"] === "Canvas") ? "Canvas" : "Range";
  let items = [];
  if (type === "Range" && structure["items"]) {
    for (let item of structure["items"]) {
      items.push(extractStructureInfoFromManifest(item, itemIdToLabelMap));
    }
  }
  if (!label && type === "Canvas") {
    label = itemIdToLabelMap[id] || "";
    let idParts = id.split("/");
    label += ": (" + idParts[idParts.length - 1] + ")";
  }
  return { label, id, type, newItem: false, items, key: uuidv4() };
}

// recursively look trough the tree to find the structure by key
export function findStructureByKey(structureInfo: ManifestStructureInfo[],
  key: string,
  callback: (structure: ManifestStructureInfo, index: number, parentItems: ManifestStructureInfo[]) => void) {
  for (let index = 0; index < structureInfo.length; index++) {
    if (structureInfo[index].key === key) {
      return callback(structureInfo[index], index, structureInfo);
    }
    if (structureInfo[index].items) {
      findStructureByKey(structureInfo[index].items!, key, callback);
    }
  }
}

export function createNewRange(): ManifestStructureInfo {
  let id = uuidv4();
  return {
    label: "New Range",
    type: "Range",
    id: id,
    key: id,
    newItem: true,
    items: []
  };
}

export function addNewRange(structureInfo: ManifestStructureInfo[], id: string): ManifestStructureInfo[] {
  findStructureByKey(structureInfo, id, (structure) => {
    if (structure.type === "Range") {
      let newItems = [...structure.items, createNewRange()];
      structure.items = newItems;
    }
  });
  return [...structureInfo];
}

export function addCavasesToRange(structureInfo: ManifestStructureInfo[], id: string, canvasInfoSet: ManifestCanvasInfo[]): ManifestStructureInfo[] {
  findStructureByKey(structureInfo, id, (structure) => {
    if (structure.type === "Range") {
      let newItems = [...structure.items];
      canvasInfoSet.forEach((c) => {
        if (!newItems.find((item) => item.id === c.canvasId))
          newItems.push({ id: c.canvasId, label: c.label, type: "Canvas", items: [], newItem: true, key: uuidv4() })
      });
      structure.items = newItems;
    }
  });
  return [...structureInfo];
}

export function deleteItemsByKey(structureInfo: ManifestStructureInfo[], keys: string[]): ManifestStructureInfo[] {
  let initial: ManifestStructureInfo[] = [];
  return structureInfo.reduce((array, structure) => {
    if (!keys.includes(structure.key)) {
      array.push({ ...structure, items: deleteItemsByKey(structure.items, keys) });
    }
    return array;
  }, initial);
}

export function allStructureKeys(structureInfo: ManifestStructureInfo[] | null, ids: string[] = []) {
  if (!structureInfo)
    return [];
  for (let info of structureInfo) {
    ids.push(info.key);
    allStructureKeys(info.items, ids);
  }
  return ids;
}