import React from 'react';
import Select, { components } from "react-select";
import Split from 'react-split'
import mermaid from "mermaid"
import './App.css';
import {flowData} from './data';

const startItemId = 'start';

var optionArray = [];

mermaid.initialize({
  startOnLoad: true
});

class Mermaid extends React.Component {
  componentDidMount() {
    mermaid.contentLoaded();
  }
  render() {
    return <div className="mermaid">{this.props.chart}</div>;
  }
}

const MultiValueLabel = props => {
  return (
    <components.MultiValueLabel
      {...props}
      innerProps={{
        ...props.innerProps,
        onClick: e => {
          e.stopPropagation(); // doesn't do anything, sadly
          e.preventDefault(); // doesn't do anything, sadly
          // still unsure how to preven the menu from opening
          alert(props.data.label);
        }
      }}
    />
  );
};

function Flowchart() {
  const chart = 'graph TD\n'+flowData.map((data) => {    
          var s = data.id
          if(data.id === startItemId){
            s += '{'+data.description+'}'
          } else {
            s += '('+data.description+')'
          }
          if(data.children.length > 0) {
            s +=' --> '+data.children.join(' & ');
          }

          return (s);
        }).join('\n');

  console.log(chart);

  return (
   <Mermaid chart={chart} />
  );
}

function Item(props) {
  const i=props.data;

  const parentOptions = i.parents ? 
                          i.parents.sort().map((data) => {return {value:data,label:data}}) : [];
  const childOptions = i.children ?
                          i.children.sort().map((data) => {return {value:data,label:data}}) : [];

  var parentSection = (
    <table border="0"><tbody><tr>
      <td>
      <span role="img" aria-label="parents">⬆️</span>
      </td>
      <td width="100%">
      <Select
        isMulti
        name="parents"
        defaultValue={parentOptions}
        options={optionArray}
        placeholder="Add parent..."
        components={{ MultiValueLabel }}
      />
      </td>
    </tr></tbody></table>
  );

  if(i.id === startItemId) {
    parentSection=null;
  }

  return (
    <div className="item">
      {parentSection}
      <b>{i.description}</b> (<i>{i.id}</i>) (D: {i.depth})<br/>
      <table border="0"><tbody><tr>
        <td>
        <span role="img" aria-label="children">⬇️</span>
        </td>
        <td width="100%">
        <Select
          isMulti
          name="children"
          defaultValue={childOptions}
          options={optionArray}
          placeholder="Add child..."
          components={{ MultiValueLabel }}
        />
        </td>
      </tr></tbody></table>
    </div>
  );
}

class AllItems extends React.Component {
  render() {
    const items = flowData.map((data, key) => {
      return(
        <li key={key}>
          <Item
            data={data}
          />
        </li>
      );
    });

    return (
      <ol>{items}</ol>
    );
  }
}

class App extends React.Component {
  setChildrenAndDepth(i) {
    i.children = [];
    flowData.forEach((data) => {
      if(data.parents && data.parents.includes(i.id)) {
        i.children.push(data.id);
        if(i.depth != null) {
          if(data.depth == null || data.depth <= i.depth) {
            data.depth = i.depth+1;
          }
        }
      }
    });
  }

  render() {
    const startItem = flowData.find(i => i.id === startItemId);
    startItem.depth = 0;

    optionArray = [];
    flowData.forEach((data) => {
      optionArray.push({value:data.id,label:data.id});
      this.setChildrenAndDepth(data);
    });

    flowData.sort((a,b) => a.id > b.id ? 1 : -1).sort((a,b) => a.depth - b.depth);

    return (
      <div className="App">
        <Split className="wrap">
          <Flowchart />
          <AllItems />
        </Split>
      </div>  
    );
  }
}

export default App;
