class API {
  fetch = async (uri, parameters = null) => {
      let uriVal =
        parameters !== null ? uri + "?" + new URLSearchParams(parameters) : uri;

      let meta = { method: "GET" };
      const response = await fetch(uriVal, meta);

      if (response.ok) {
        return response;
      } else {
        const data = await response.json();
        throw {
          message: data.message ? data.message : "Failed to perform post",
        };
      }

  };

  post = async (uri, parameters = null) => {
      const response = await fetch(uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      });
      if (response.ok) {
        return response;
      } else {
        const data = await response.json();
        throw {
          message: data.message ? data.message : "Failed to perform post",
        };
      }
  };
  put = async (uri, parameters = null) => {
      const response = await fetch(uri, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      });
      if (response.ok) {
        return response;
      } else {
        const data = await response.json();
        throw {
          message: data.message ? data.message : "Failed to perform post",
        };
      }
  };

  delete = async (uri, parameters = null) => {
      const response = await fetch(uri, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      });
      if (response.ok) {
        return response;
      } else {
        const data = await response.json();
        throw {
          message: data.message ? data.message : "Failed to perform post",
        };
      }
  };
}

export const API = new API();
