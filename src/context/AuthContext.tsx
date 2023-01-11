import Router, { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/api";

import { setCookie, parseCookies, destroyCookie } from "nookies";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  user?: User;
  isAuthenticated: boolean;
};

const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  Router.push("/");
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  const router = useRouter();

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      // Alternativas para manter token:
      //    sessionStorage (Desvantagem é na mudança de telas e no fechamento e reabertura de uma  página)
      //    localStorage (No SSR isso não funciona com NextJS porque não existe localStorage do lado do servidor)
      //    cookies (ESCOLHIDA)

      const cookieOptions = {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      };

      setCookie(undefined, "nextauth.token", token, cookieOptions);
      setCookie(
        undefined,
        "nextauth.refreshToken",
        refreshToken,
        cookieOptions
      );

      setUser({
        email,
        permissions,
        roles,
      });

      // used to update headers with new data of token
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          try {
            const { email, permissions, roles } = response.data;
            setUser({ email, permissions, roles });
          } catch (err) {
            console.error(err);
          }
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
