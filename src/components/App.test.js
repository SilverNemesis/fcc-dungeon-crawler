import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import pretty from "pretty";
import App from "./App";

let container = null;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it("renders correctly", () => {
  act(() => {
    render(<App />, container);
  });

  expect(pretty(container.innerHTML)).toMatchInlineSnapshot(
    `"<div id=\\"screen\\"><canvas id=\\"canvas\\" width=\\"0\\" height=\\"0\\"></canvas></div>"`
  );
});
