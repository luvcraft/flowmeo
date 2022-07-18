import React from 'react';
import Select from 'react-select';
import './App.css';
import {flowData} from './data';

function Item(props) {
  var childArray = [];
  var optionArray = [];
  const i=props.data
  flowData.forEach((data) => {
    optionArray.push({value:data.id,label:data.id})
    if(data.parents && data.parents.includes(i.id)){
      childArray.push(data.id);
    }
  });

  /*
  const parents = i.parents ? i.parents.sort().join(" ") : null;
  const children = (childArray && childArray.length > 0) ? childArray.sort().join(" ") : null;
  */

  const parentOptions = i.parents ? 
                          i.parents.sort().map((data) => {return {value:data,label:data}}) : [];
  const childOptions = childArray.sort().map((data) => {return {value:data,label:data}});

  var parentSection = (
      <table border="0"><tbody><tr>
        <td>
        <span role="img" aria-label="parents">⬆️</span> {/*parents*/} 
        </td>
        <td width="100%">
        <Select
          isMulti
          name="parents"
          defaultValue={parentOptions}
          options={optionArray}
          placeholder="Add parent..."
        />
        </td>
      </tr></tbody></table>
    )

  if(i.id === 'start') {
    parentSection=null;
  }

  return (
    <div className="item">
      {parentSection}
      <b>{i.description}</b> (<i>{i.id}</i>)<br/>
      <table border="0"><tbody><tr>
        <td>
        <span role="img" aria-label="children">⬇️</span> {/*children*/} 
        </td>
        <td width="100%">
        <Select
          isMulti
          name="children"
          defaultValue={childOptions}
          options={optionArray}
          placeholder="Add child..."
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

function App() {
  return (
    <div className="App">
      <AllItems />
    </div>
  );
}

export default App;
