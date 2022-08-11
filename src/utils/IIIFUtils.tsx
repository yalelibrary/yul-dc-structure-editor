import type { DataNode } from 'antd/es/tree';


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


export type RangeInfoType = "Range" | "Canvas";

export type ManifestRangeInfo = {
  type: RangeInfoType;
  label: string;
  id: string;
  newItem: boolean;
  items: ManifestRangeInfo[];
}

export type ManifestRangeInfoTree = ManifestRangeInfo & DataNode


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

export function rangeInfoFromManifest(manifestData: any): ManifestRangeInfoTree[] | null {
  let ranges: ManifestRangeInfoTree[] | null = null;
  if (manifestData && manifestData["structures"]) {
    let itemIdToLabelMap: any = {};
    for (let item of manifestData["items"]) {
      let id: string = item["id"];
      let label = extractIIIFLabel(item);
      itemIdToLabelMap[id] = label;
    }
    ranges = [];
    for (let structure of manifestData["structures"]) {
      ranges.push(recursiveExtractStructure(structure, itemIdToLabelMap))
    }
  }
  return ranges;
}

function recursiveExtractStructure(structure: any, itemIdToLabelMap: any): ManifestRangeInfoTree {
  let label = extractIIIFLabel(structure, "");
  let id = structure["id"];
  let type: RangeInfoType = (structure["type"] === "Canvas") ? "Canvas" : "Range";
  let newItem = false;
  let items = [];
  if (type === "Range" && structure["items"]) {
    for (let item of structure["items"]) {
      items.push(recursiveExtractStructure(item, itemIdToLabelMap));
    }
  }
  if (!label && type === "Canvas") {
    label = itemIdToLabelMap[id] || "";
    let idParts = id.split("/");
    label += ": (" + idParts[idParts.length -1] + ")";
  }
  return {key: id, title: label, children: items, label, id, type, newItem, items};
}
