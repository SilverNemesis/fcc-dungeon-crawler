import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import pretty from "pretty";
import Controls from "./Controls";

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
  const show = true;
  const title = "Test Menu";
  const onClickPrevious = () => { };
  const onClickNext = () => { };
  const onChange = () => { };
  const options = [
    {
      type: "description",
      description: "This is a test"
    },
    {
      name: "Select Test",
      type: "select",
      options: ["gold", "silver", "platinum"]
    },
    {
      name: "Bool Test",
      id: "boolTest",
      type: "bool"
    },
    {
      name: "Int test",
      id: "intTest",
      type: "int",
      min: 0,
      max: 32,
      value: 0
    },
    {
      name: "Float Test",
      id: "floatTest",
      type: "float",
      min: 0.0,
      max: 1.0,
      value: 0.0
    },
    {
      name: "Function Test",
      type: "function",
      function: null
    }
  ];

  act(() => {
    render(
      <Controls
        show={show}
        title={title}
        onClickPrevious={onClickPrevious}
        onClickNext={onClickNext}
        onChange={onChange}
        options={options}
      />,
      container
    );
  });

  expect(pretty(container.innerHTML)).toMatchInlineSnapshot(`
    "<div id=\\"controls\\">
      <div class=\\"none\\"><span class=\\"left\\">❮ PREV</span><span class=\\"right\\">NEXT ❯</span>
        <div class=\\"center title\\">Test Menu</div>
      </div>
      <div>
        <div class=\\"control\\">This is a test</div>
        <div class=\\"control\\"><label for=\\"Select Test\\">Select Test</label><select id=\\"Select Test\\" class=\\"select-css\\">
            <option value=\\"0\\">gold</option>
            <option value=\\"1\\">silver</option>
            <option value=\\"2\\">platinum</option>
          </select></div>
        <div class=\\"control\\"><label class=\\"clickable\\" for=\\"Bool Test\\"><input class=\\"clickable\\" id=\\"Bool Test\\" type=\\"checkbox\\">Bool Test</label></div>
        <div class=\\"control\\"><label for=\\"Int test\\">Int test 0</label><input id=\\"Int test\\" class=\\"clickable\\" type=\\"range\\" min=\\"0\\" max=\\"32\\" value=\\"0\\"></div>
        <div class=\\"control\\"><label for=\\"Float Test\\">Float Test 0.000</label><input id=\\"Float Test\\" class=\\"clickable\\" type=\\"range\\" min=\\"0\\" max=\\"1000\\" value=\\"0\\"></div>
        <div class=\\"control\\"><button>Function Test</button></div>
      </div>
    </div>"
  `);
});
