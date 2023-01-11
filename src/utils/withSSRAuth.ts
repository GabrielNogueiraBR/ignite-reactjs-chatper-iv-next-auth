import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";

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

    return await fn(context);
  };
}
