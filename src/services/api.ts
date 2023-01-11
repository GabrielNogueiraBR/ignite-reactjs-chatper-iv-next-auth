import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies();

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (resonse) => resonse,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === "token.expired") {
        // renovar o token
        cookies = parseCookies();
        const { "nextauth.refreshToken": refreshToken } = cookies;
        api
          .post("/refresh", {
            refreshToken,
          })
          .then((response) => {
            const { token } = response.data;

            const cookieOptions = {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: "/",
            };

            setCookie(undefined, "nextauth.token", token, cookieOptions);
            setCookie(
              undefined,
              "nextauth.refreshToken",
              response.data.refreshToken,
              cookieOptions
            );

            // used to update headers with new data of token
            api.defaults.headers["Authorization"] = `Bearer ${token}`;
          });
      } else {
        // deslogar o usuario
      }
    }
  }
);
