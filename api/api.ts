import Constants from "expo-constants";
import { store } from "@/store";

class Api {
  uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  protected request(
    method: string,
    path = "",
    data?: object,
    headers: Record<string, string> = {}
  ) {
    const url = `${Constants.expoConfig?.extra?.API_NETWORK}/${this.uri}${path}`;
    console.log("API URL:", url);
    console.log("API Data:", data);

    // Lấy token từ Redux store
    const token = store.getState().auth.user?.token;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      } as HeadersInit,
      ...(method === "GET"
        ? { body: undefined }
        : { body: JSON.stringify(data) }),
    };

    return fetch(url, options)
      .then(async (response) => {
        const responseData = await response.json();
        console.log("API Response:", responseData);
        return responseData;
      })
      .catch((error) => {
        console.error("API request error:", error);
        throw error;
      });
  }

  get(query: object) {
    return this.request("GET", "", query);
  }

  getById(id: string | number) {
    return this.request("GET", `/${id}`);
  }

  create(resource: object) {
    return this.request("POST", "", resource);
  }

  update(id: string | number, resource: object) {
    return this.request("PUT", `/${id}`, resource);
  }

  destroy(id: string | number) {
    return this.request("DELETE", `/${id}`);
  }
}

export default Api;
