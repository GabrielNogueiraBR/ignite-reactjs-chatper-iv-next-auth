import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

// Hight Order Function
//    Quando uma função retorna outra função
//    Quando uma função usa uma outra função como parâmetro
export function withSSRAuth<P extends { [key: string]: any }>(
  fn: GetServerSideProps<P>
) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);

    if (!cookies["nextauth.token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false, // HTTP Code (301 ou 302): Informa se esse redirecionamento sempre vai acontecer, ou se apenas aconteceu por alguma condicao
        },
      };
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
