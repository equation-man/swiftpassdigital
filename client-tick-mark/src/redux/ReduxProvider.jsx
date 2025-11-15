// Redux provider to make store available to the entire
// react component tree.
"use client";
import React from "react";
import { Provider } from "react-redux";
import store from "./store";

export const ReduxProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

