import React from 'react';

const DescriptionControl = (props) => {
  const { control } = props;
  return (
    <div className="control">
      {control.description}
    </div>
  );
}

const SelectControl = (props) => {
  function onChange(event) {
    props.onChange(control, event.target.value);
  }
  const { control } = props;
  const options = [];
  for (let i = 0; i < control.options.length; i++) {
    options.push(
      (<option key={i} value={i}>{control.options[i]}</option>)
    );
  }
  return (
    <div className="control">
      <label htmlFor={control.name}>{control.name}</label>
      <select id={control.name} className="select-css" value={control.value} onChange={onChange}>
        {options}
      </select>
    </div>
  );
}

const BoolControl = (props) => {
  function onChange(event) {
    props.onChange(control, event.target.checked);
  }
  const { control } = props;
  return (
    <div className="control">
      <label className="clickable" htmlFor={control.name}><input className="clickable" id={control.name} type="checkbox" checked={control.value} onChange={onChange} />{control.name}</label>
    </div>
  );
}

const IntControl = (props) => {
  function onChange(event) {
    props.onChange(control, Number(event.target.value));
  }
  const { control } = props;
  return (
    <div className="control">
      <label htmlFor={control.name}>{control.name} {control.value}</label>
      <input id={control.name} className="clickable" type="range" min={control.min} max={control.max} value={control.value} onChange={onChange} />
    </div>
  );
}

const FloatControl = (props) => {
  const factor = 1000;
  function onChange(event) {
    props.onChange(control, Number(event.target.value) / factor);
  }
  const { control } = props;
  return (
    <div className="control">
      <label htmlFor={control.name}>{control.name} {control.value.toFixed(3)}</label>
      <input id={control.name} className="clickable" type="range" min={Math.floor(control.min * factor)} max={Math.floor(control.max * factor)} value={Math.floor(control.value * factor)} onChange={onChange} />
    </div>
  );
}

const FunctionControl = (props) => {
  function onClick(event) {
    control.function();
  }
  const { control } = props;
  return (
    <div className="control">
      <button onClick={onClick}>{control.name}</button>
    </div>
  );
}

const Controls = ({ show, title, onClickPrevious, onClickNext, onChange, options }) => {
  if (!show) {
    return null;
  }
  let controls
  if (options) {
    controls = options.map((option, index) => {
      switch (option.type) {
        case 'description':
          return <DescriptionControl key={index} control={option} />
        case 'select':
          return <SelectControl key={index} control={option} onChange={onChange} />
        case 'bool':
          return <BoolControl key={index} control={option} onChange={onChange} />
        case 'int':
          return <IntControl key={index} control={option} onChange={onChange} />
        case 'float':
          return <FloatControl key={index} control={option} onChange={onChange} />
        case 'function':
          return <FunctionControl key={index} control={option} />
        default:
          return (
            <div key={index} className="control">{option.type} is not supported</div>
          );
      }
    });
  }
  return (
    <div id="controls">
      <div className="none">
        <span className="left" onClick={onClickPrevious}>❮ PREV</span>
        <span className="right" onClick={onClickNext}>NEXT ❯</span>
        <div className="center title">{title}</div>
      </div>
      <div>
        {controls}
      </div>
    </div>
  );
}

export default Controls;
