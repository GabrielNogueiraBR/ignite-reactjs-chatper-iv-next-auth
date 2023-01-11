import React from "react";
import { useAuth } from "../context/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return <h1>Dashboard: {user?.email}</h1>;
};

export default Dashboard;

export const getServerSideProps = withSSRAuth(async (context) => {
  return {
    props: {},
  };
});
