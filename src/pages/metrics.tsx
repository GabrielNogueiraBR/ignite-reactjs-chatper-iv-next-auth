import React from "react";

import { setupApiClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

import jwtDecode from "jwt-decode";

const Metrics = () => {
  return (
    <>
      <h1>Metrics:</h1>
    </>
  );
};

export default Metrics;

export const getServerSideProps = withSSRAuth(
  async (context) => {
    const apiClient = setupApiClient(context);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
