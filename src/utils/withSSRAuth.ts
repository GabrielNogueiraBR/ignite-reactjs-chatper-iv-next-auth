import jwtDecode from "jwt-decode";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
};

// Hight Order Function
//    Quando uma função retorna outra função
//    Quando uma função usa uma outra função como parâmetro
export function withSSRAuth<P extends { [key: string]: any }>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);
    const token = cookies["nextauth.token"];

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false, // HTTP Code (301 ou 302): Informa se esse redirecionamento sempre vai acontecer, ou se apenas aconteceu por alguma condicao
        },
      };
    }

    if (!options) {
      //  encriptado é != de encriptografado
      // decodificar é != de descriptografar
      const user = jwtDecode<{ permissions: string[]; roles: string[] }>(token);
      const { permissions, roles } = options || ({} as WithSSRAuthOptions);

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: "/dashboard", // nesse caso sabemos que dashboard é livre para todos os usuarios, por isso redirecionamos para la
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(context);
    } catch (err) {
      destroyCookie(context, "nextauth.token");
      destroyCookie(context, "nextauth.refreshToken");

      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  };
}
