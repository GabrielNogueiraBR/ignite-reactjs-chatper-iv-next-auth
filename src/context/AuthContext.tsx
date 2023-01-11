import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useState } from "react";
import { api } from "../services/api";

import { setCookie } from "nookies";

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

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
