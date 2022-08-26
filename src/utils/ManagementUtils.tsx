
export class FetchError extends Error {

  status: number;
  response?: any;

  constructor(message: string, status: number, response?: any) {
    super(message);
    this.status = status;
    this.response = response;
  }
}

let apiKey = "";
export function setApiKeyGlobal(value: string) {
  apiKey = value;
}

export function apiFetchJsonUri(token: string, uri: string): Promise<any> {
  let options: any = {
    "cache": "no-cache",
    "mode": "cors",
  };
  if (token) {
    let headers = { "Authorization": "Bearer " + token };
    options["headers"] = headers;
    options["credentials"] = "include";
  }
  return fetch(uri, options).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      let json = await response.json();
      throw new FetchError("Error Response From Server", response.status, json);
    }
  })
}


export function apiPostJsonUri(token: string, uri: string, data: any): Promise<any> {
  let options: any = {
    "method": "post",
    "cache": "no-cache",
    "mode": "cors",
    "body": JSON.stringify(data)
  };
  if (token) {
    let headers = { "Authorization": "Bearer " + token };
    options["headers"] = headers;
    options["credentials"] = "include";
  }
  return fetch(uri, options).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      let json = await response.json();
      throw new FetchError("Error Response From Server", response.status, json);
    }
  })
}



export function downloadManifest(manifestUrl: string): Promise<any> {
  return apiFetchJsonUri(apiKey, manifestUrl);
}

export function saveManifest(manifestUrl: string, manifest: any): Promise<any> {
  return apiPostJsonUri(apiKey, manifestUrl, manifest);
}