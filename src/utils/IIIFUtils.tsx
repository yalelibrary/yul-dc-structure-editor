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

export function extractIIIFWidthHeight(item: any): { width: number, height: number } {
  let anno = item["items"]?.[0]?.["items"]?.[0];
  let body = anno?.["body"];
  let width = body["width"];
  let height = body["height"];
  return { width, height };
}

export type Position = {
  x: number;
  y: number;
}

export type Rectangle = {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ManifestCanvasInfo = {
  label: string;
  imageId: string;
  canvasId: string;
  oid: string;
  thumbnail: string;
  index: number;
  width: number;
  height: number;
}

export type StructureInfoType = "Range" | "Canvas" | "SpecificResource";

export type ManifestStructureInfo = {
  key: string;
  type: StructureInfoType;
  label: string;
  id: string;
  newItem: boolean;
  items: ManifestStructureInfo[];
  width?: number;
  height?: number;
  rectangle?: Rectangle;
  svg?: string;
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
      let width = body["width"];
      let height = body["height"];
      canvasInfo.push({
        label: label,
        imageId: imageId,
        canvasId: id,
        oid: oid,
        thumbnail: thumbnail,
        index: ix++,
        width,
        height
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
    let itemIdToWidthHeightMap: any = {};
    for (let item of manifestData["items"]) {
      itemIdToLabelMap[item["id"]] = extractIIIFLabel(item);
      itemIdToWidthHeightMap[item["id"]] = extractIIIFWidthHeight(item);
    }
    structures = [];
    for (let structure of manifestData["structures"]) {
      structures.push(extractStructureInfoFromManifest(structure, itemIdToLabelMap, itemIdToWidthHeightMap))
    }
  }
  return structures;
}

export function manifestFromStructureInfo(structureInfo: ManifestStructureInfo[]): any[] | null {
  let structure: any[] | null = [];

  if (structureInfo) {
    for (let s of structureInfo) {
      console.log(s);
      if (s.type === "Canvas") {
        structure.push({ type: "Canvas", id: s.id })
      } else if (s.type === "Range") {
        structure.push({ type: "Range", id: s.id, items: manifestFromStructureInfo(s.items), label: { 'en': [s.label] } })
      }
    }
  }
  return structure;
}

function extractStructureInfoFromManifest(structure: any, itemIdToLabelMap: any, itemIdToWidthHeightMap: any): ManifestStructureInfo {
  let label = extractIIIFLabel(structure, "");
  let id = structure["id"];
  let type: StructureInfoType;
  let rectangle: Rectangle | undefined = undefined;
  let width: number | undefined = undefined;
  let height: number | undefined = undefined;
  switch (structure["type"]) {
    case "Canvas":
      type = "Canvas";
      break;
    case "SpecificResource":
      type = "SpecificResource";
      break;
    default:
      type = "Range";
      break;
  }
  let items = [];
  if (type === "Range" && structure["items"]) {
    for (let item of structure["items"]) {
      items.push(extractStructureInfoFromManifest(item, itemIdToLabelMap, itemIdToWidthHeightMap));
    }
  }
  if (type === "SpecificResource") {
    id = structure["source"];
    let selector = structure["selector"];
    if (selector["type"] === "FragmentSelector" && selector["value"]) {
      let shape: string = selector["value"];
      if (shape.startsWith("xywh=")) {
        let rect = shape.substring("xywh=".length).split(",");
        if (rect.length === 4) {
          rectangle = { x: parseInt(rect[0]), y: parseInt(rect[1]), w: parseInt(rect[2]), h: parseInt(rect[3]) };
        }
      }
    } else if (selector["type"] === "SvgSelector") {
      let svg = selector["value"];
      let ix = svg.indexOf("<path d=");
      let s = svg.substring(ix);
      let del = s[0];
      s = s.substring(1);
      s = s.substring(0, s.indexOf(del)).trim();
      // split where letter and number meet, at commas, and at spaces
      svg = s;
    }


    // "selector": {
    //   "type": "SvgSelector",
    //   "value": "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><path d='M270.000000,1900.000000 L1530.000000,1900.000000 L1530.000000,1610.000000 L1315.000000,1300.000000 L1200.000000,986.000000 L904.000000,661.000000 L600.000000,986.000000 L500.000000,1300.000000 L270,1630 L270.000000,1900.000000' /></g></svg>"
    // }"
  }
  if (type !== "Range") {
    label = itemIdToLabelMap[id];
    let wh = itemIdToWidthHeightMap[id];
    width = wh.width;
    height = wh.height;
  }
  if (!label && type !== "Range") {
    label = itemIdToLabelMap[id] || "";
    let idParts = id.split("/");
    label += ": (" + idParts[idParts.length - 1] + ")";
  }
  let key = (type === "Canvas") ? uuidv4() : id;
  return { label, id, type, newItem: false, items, rectangle, height, width, key: key };
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
          newItems.push({ id: c.canvasId, label: c.label, type: "Canvas", items: [], newItem: true, width: c.width, height: c.height, key: uuidv4() })
      });
      structure.items = newItems;
    }
  });
  return [...structureInfo];
}


export function addPartialCavasToRange(structureInfo: ManifestStructureInfo[], id: string, canvasInfo: ManifestCanvasInfo, rectangle: Rectangle): ManifestStructureInfo[] {
  findStructureByKey(structureInfo, id, (structure) => {
    if (structure.type === "Range") {
      rectangle.x = Math.round(rectangle.x);
      rectangle.y = Math.round(rectangle.y);
      rectangle.w = Math.round(rectangle.w);
      rectangle.h = Math.round(rectangle.h);
      let newItem: ManifestStructureInfo = { id: canvasInfo.canvasId, label: canvasInfo.label, type: "SpecificResource", items: [], newItem: true, key: uuidv4(), rectangle: rectangle, width: canvasInfo.width, height: canvasInfo.height }
      let newItems = [...structure.items, newItem];
      structure.items = newItems;
    }
  });
  return [...structureInfo];
}

export function addPartialSVGCavasToRange(structureInfo: ManifestStructureInfo[], key: string, canvasInfo: ManifestCanvasInfo, positions: Position[][]): ManifestStructureInfo[] {
  if (!positions?.find((p) => p.length > 0)) {
    return structureInfo;
  }
  findStructureByKey(structureInfo, key, (structure) => {
    if (structure.type === "Range") {
      let newItem: ManifestStructureInfo = { id: canvasInfo.canvasId, label: canvasInfo.label, type: "SpecificResource", items: [], newItem: true, key: uuidv4(), rectangle: undefined, svg: positionsToSvgPath(positions), width: canvasInfo.width, height: canvasInfo.height }
      let newItems = [...structure.items, newItem];
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

export function imageToInfo(url: string) {
  let imageIdComponents = url.split("/");
  imageIdComponents = imageIdComponents.slice(0, imageIdComponents.length - 4);
  imageIdComponents.push("info.json")
  return imageIdComponents.join("/");
}

function positionsToSvgPath(positions: Position[][]): string | undefined {
  let s = "";
  for (let polygon of positions) {
    for (let point of polygon) {
      let b = (point === polygon[0]) ? "M " : "L "
      b += `${point.x} ${point.y} `;
      s += b;
    }
  }
  return s;
}
