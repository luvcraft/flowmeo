import React from 'react';
import Select, { components } from "react-select";
import CreatableSelect from 'react-select/creatable';
import { EditText, EditTextarea } from 'react-edit-text';
import Split from 'react-split'
import mermaid from "mermaid"
import './App.css';
import './EditText.css';

const startItemId = 'start';

var optionArray = [];
var currentItem;
var refresh = false;
var flowData =  [{ "id":"start", "description":"Start" }];

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

function AncestorsOf(id) {
  const item = flowData.find((i) => i.id === id);
  if(!item || !item.parents || item.parents.length < 1) {
    return [];
  } else {
    var ancestors = [];
    item.parents.forEach((p) => {
      if(!ancestors.includes(p)) {
          ancestors.push(p);
      }
      var parentAncestors = AncestorsOf(p);
      if(parentAncestors.length > 0) {
        parentAncestors.forEach((pa) => {
          if(!ancestors.includes(pa)){
            ancestors.push(pa);
          }
        });
      }
    })
    return ancestors;
  }
}

function SelectItemById(id) {
  if(currentItem.id === id) {
    LogAction('⚠️ currentItem is already set to: ' + currentItem.id);
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
        onMouseDown: e => {
          e.stopPropagation()
        },
        onClick: e => {
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

          if(data.children && data.children.length > 0) {
            s +=' --> '+data.children.join(' & ');
          }
          s += '\n\tclick '+data.id+' flowchartClick'

          return (s);
        }).join('\n');

  return (
   <Mermaid chart={chart} />
  );
}

function CreateIfNew(i, addStartParent = true) {
  if(!flowData.find((item) => item.id === i)) {
    LogAction(i + " doesn't exist! creating!");
    flowData.push({id:i, description:i, parents:addStartParent ? ['start'] : []})
    refresh = true;
  }
}

function LogAction(action){
  console.log(action);
}

class Item extends React.Component {
  handleParentChange(event) {
    let invalid = false;
    event.forEach((data) => {
      if(data.value === currentItem.id) {
        LogAction("🚫 Can't make "+data.value+" a parent of itself!");
        invalid=true;
      }
      CreateIfNew(data.value);
      if(AncestorsOf(data.value).includes(currentItem.id)) {
        LogAction("🚫 Can't make "+data.value+" a parent of "+currentItem.id+"! "+currentItem.id+" is an ancestor of "+data.value+"!");
        invalid=true;
      }
    });
    
    if(!invalid) {
      currentItem.parents = event.map((data) => {return data.value});   
      refresh = true;
    }
  };

  handleChildChange(event) {
    let invalid = false;
    event.forEach((data) => { 
      if(data.value === currentItem.id) {
        LogAction("🚫 Can't make "+data.value+" a parent of itself!");
        invalid=true;
      }
      CreateIfNew(data.value, false);
      if(AncestorsOf(currentItem.id).includes(data.value)) {
        LogAction("🚫 Can't make "+currentItem.id+" a parent of "+data.value+"! "+data.value+" is an ancestor of "+currentItem.id+"!");
        invalid=true;
      }
    });

    if(!invalid) {
      event.forEach((data) => {
        var childItem = flowData.find((i) => i.id === data.value);
        if(childItem && !childItem.parents.includes(currentItem.id)) {
          childItem.parents.push(currentItem.id);
        }
      });
      refresh = true;
    }
  };                        

  handleTextChange({name, value, previousValue}) {
    if(name === 'description') {
      currentItem.description = value;
    } else if(name === 'notes') {
      currentItem.notes = value;
    }
    refresh = true;
  }

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
        <CreatableSelect
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
        <CreatableSelect
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
    const notes = i.notes ?? null;

    return (
      <div className="item">
        {this.parentSection(i)}
        <b>
        <EditText
          name="description"
          defaultValue={i.description}
          onSave={this.handleTextChange}
        />
        </b> (<i>{i.id}</i>) (<i>Depth: {i.depth}</i>)<br/>
        <EditTextarea
          name="notes"
          placeholder='Notes...'
          defaultValue={notes}
          onSave={this.handleTextChange}
          style={{ border: '1px solid #ccc' }}
        />
        {this.childSection(i)}
      </div>
    );
  }
}

function Toc() {
  const handleChange = event => {
    CreateIfNew(event.value);
    SelectItemById(event.value);
  }

  return (
    <CreatableSelect
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

function LoadDataLocal() {
  let loadedData = JSON.parse(localStorage.getItem('flowData'));
  if(loadedData != null) {
    flowData = loadedData;
  }
  currentItem = flowData[0];
}

function SaveDataLocal() {
  let data = flowData.slice();
  localStorage.setItem('flowData', JSON.stringify(data));
}

class App extends React.Component {
  constructor(props){
    super(props);

    LoadDataLocal();

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

      SaveDataLocal();
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

  dataForDownload() {
    var downloadData = [];
    flowData.forEach((item) => {
      let ditem = {...item};

      delete ditem['depth'];
      delete ditem['children'];

      downloadData.push(ditem);
    });
    return downloadData;
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
            <a
              type="button"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(
               JSON.stringify(this.dataForDownload(),null,'\t')
              )}`}
              download="flowData.json"
            >
              <button>
                {`Download Json`}
              </button>
            </a>
          </div>
        </Split>
      </div>  
    );
  }
}

export default App;
