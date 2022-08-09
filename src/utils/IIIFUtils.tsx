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
  oid: string;
  thumbnail: string;
  index: number;
}


export type RangeInfoType = "range" | "canvas";

export type ManifestRangeInfo = {
  type: RangeInfoType;
  label: string;
  id: string;
  new: boolean;
  contents: ManifestRangeInfo[];
}


export function canvasInfoFromManifest(manifestData: any): ManifestCanvasInfo[] | null {
  let canvasInfo: ManifestCanvasInfo[] | null = null;
  if (manifestData) {
    canvasInfo = [];
    let ix = 0;
    for (let item of manifestData["items"]) {
      let id = item["id"];
      let thumbnail = item["thumbnail"][0]["id"];
      let anno = item["items"]?.[0]?.["items"]?.[0];
      let body = anno?.["body"];
      if (body instanceof Array) {
        body = body[0];
      }
      let imageId = body["id"];
      let oid = id.split("/").pop()
      let label = extractIIIFLabel(item, "");
      if (label) {
        label = [label, "(" + oid + ")"].join(": ");
      } else {
        label = oid;
      }
      canvasInfo.push({
        label: label,
        imageId: imageId,
        oid: oid,
        thumbnail: thumbnail,
        index: ix++,
      }
      );
    }
  }
  return canvasInfo;
}

export function rangeInfoFromManifest(manifestData: any): ManifestRangeInfo[] | null {
  return null;
}