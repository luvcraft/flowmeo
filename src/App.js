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

  return (
    <div className="item">
      <table border="0">
        <td>
        ⬆️: {/*parents*/} 
        </td><td width="100%">
        <Select
          className="inline"
          isMulti
          name="parents"
          defaultValue={parentOptions}
          options={optionArray}
        />
        </td>
      </table>
      (<i>{i.id}</i>) <b>{i.description}</b><br/>
      <table border="0">
        <td>
        ⬇️: {/*children*/} 
        </td><td width="100%">
        <Select
          isMulti
          name="children"
          defaultValue={childOptions}
          options={optionArray}
        />
        </td>
      </table>
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
