import React from 'react';
import Select, { components } from "react-select";
import Split from 'react-split'
import mermaid from "mermaid"
import './App.css';
import {flowData} from './data';

const startItemId = 'start';

var optionArray = [];
var currentItem = flowData[0];
var refresh = false;

class Mermaid extends React.Component {
  componentDidMount() {
    mermaid.contentLoaded();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.chart !== this.props.chart) {
      document
        .getElementById("mermaid")
        .removeAttribute("data-processed");
      mermaid.contentLoaded();
    }
  }

  render() {
    return <div id="mermaid" className="mermaid">{this.props.chart}</div>;
  }
}

function SelectItemById(id) {
  if(currentItem.id === id) {
    console.log('currentItem is already set to: ' + currentItem.id);
    return;
  }
  currentItem = flowData.find((item) => item.id === id);
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
          SelectItemById(props.data.label);
        }
      }}
    />
  );
};

function Flowchart() {
  window.flowchartClick = async function(e) {
    if (e && e != '') {
      SelectItemById(e);
    }
  }

  const chart = 'graph TD\n'
        +'classDef highlight fill:#ff0\n'
        +flowData.map((data) => {    
          var s = data.id
          if(data.id === startItemId){
            s += '{'+data.description+'}'
          } else {
            s += '('+data.description+')'
          }
          if(data.id === currentItem.id) {
            s += ':::highlight'
          }

          if(data.children.length > 0) {
            s +=' --> '+data.children.join(' & ');
          }
          s += '\n\tclick '+data.id+' flowchartClick'

          return (s);
        }).join('\n');

  return (
   <Mermaid chart={chart} />
  );
}

class Item extends React.Component {
  handleParentChange(event) {
    currentItem.parents = event.map((data) => {return data.value});   
    refresh = true;
  };

  handleChildChange(event) {
    event.forEach((data) => {
      var childItem = flowData.find((i) => i.id === data.value);
      if(childItem && !childItem.parents.includes(currentItem.id)) {
        childItem.parents.push(currentItem.id);
      }
    });
    refresh = true;
  };                        

  parentSection(i) { 
    if(i.id === startItemId) {
      return null;
    }

    const parentOptions = i.parents ? 
                          i.parents.sort().map((data) => {return {value:data,label:data}}) : [];

    return (
      <table border="0"><tbody><tr>
        <td>
        <span role="img" aria-label="parents">⬆️</span>
        </td>
        <td width="100%">
        <Select
          isMulti
          name="parents"
          value={parentOptions}
          onChange={this.handleParentChange}
          options={optionArray}
          placeholder="Add parent..."
          components={{ MultiValueLabel }}
        />
        </td>
      </tr></tbody></table>
    );
  }

  childSection(i) {
    const childOptions = i.children ?
                          i.children.sort().map((data) => {return {value:data,label:data}}) : [];

    return (
      <table border="0"><tbody><tr>
        <td>
        <span role="img" aria-label="children">⬇️</span>
        </td>
        <td width="100%">
        <Select
          isMulti
          name="children"
          value={childOptions}
          onChange={this.handleChildChange}
          options={optionArray}
          placeholder="Add child..."
          components={{ MultiValueLabel }}
        />
        </td>
      </tr></tbody></table>
    );
  };

  render() {
    const i = this.props.data;

    return (
      <div className="item">
        {this.parentSection(i)}
        <b>{i.description}</b> (<i>{i.id}</i>) (D: {i.depth})<br/>
        {this.childSection(i)}
      </div>
    );
  }
}

function Toc() {
  const handleChange = event => {
    SelectItemById(event.value);
  }

  return (
    <Select
      options={optionArray}
      value={optionArray.find((item) => item.value === currentItem.id)}
      hideSelectedOptions="true"
      onChange={handleChange}
    />
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
  constructor(props){
    super(props);
    this.state = { prevItem: currentItem };
    mermaid.initialize({
          startOnLoad: true,
      securityLevel: 'loose',
    });

    const startItem = flowData.find(i => i.id === startItemId);
    startItem.depth = 0;

    this.refreshData();
  }

  refreshData() {
    optionArray = [];
    flowData.forEach((data) => {
      optionArray.push({value:data.id,label:data.description + ' (' + data.id + ')'});
      this.setChildrenAndDepth(data);
    });

    flowData.sort((a,b) => a.id.localeCompare(b.id)).sort((a,b) => a.depth - b.depth);
    optionArray.sort((a,b) => a.label.localeCompare(b.label));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.refreshCheck(), 100);
  }

  refreshCheck() {
    if(this.state.prevItem != currentItem) {
      this.setState({ prevItem: currentItem });
    }

    if(refresh){
      refresh = false;
      this.refreshData();
      this.setState(this.state);
    }
  }

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
    return (
      <div className="App">
        <Split className="wrap">
          <Flowchart />
          <div>
            <Toc />
            <Item
              data={currentItem}
            />
          </div>
        </Split>
      </div>  
    );
  }
}

export default App;
