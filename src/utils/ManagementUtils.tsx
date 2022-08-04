
export class FetchError extends Error {

  status: number;
  response?: Promise<string>;

  constructor(message: string, status: number, json?: Promise<any>) {
      super(message);
      this.status = status;
      this.response = json;
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
  return fetch(uri, options).then(response => {
      if (response.ok) {
          return response.json();
      } else {
          throw new FetchError("Error Response From Server", response.status, response.json());
      }
  })
}

export function downloadManifest(manifestUrl: string): Promise<any> {
  return apiFetchJsonUri(apiKey, manifestUrl);
}