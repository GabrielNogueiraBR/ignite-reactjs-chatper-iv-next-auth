import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../context/AuthContext";

type FailedRequestType = {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
};

let isRefreshing = false;
let failedRequestQueue: FailedRequestType[] = [];

export function setupApiClient(context?: GetServerSidePropsContext) {
  let cookies = parseCookies(context);

  const api = axios.create({
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
          cookies = parseCookies(context);

          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config!;

          if (!isRefreshing) {
            isRefreshing = true;

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

                failedRequestQueue.forEach((request) =>
                  request.onSuccess(token)
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];

                if (typeof window) signOut();
              })
              .finally(() => (isRefreshing = false));
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"]! = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (typeof window) signOut();
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
