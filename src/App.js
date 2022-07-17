import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import {flowData} from './data';

class Items extends React.Component {
  renderItem(i) {
    this.childArray = [];
    flowData.map((data) => {
      if(data.parents && data.parents.includes(i.id)){
        this.childArray.push(data.id);
      }
    });

    this.parents = i.parents ? i.parents.sort().join(" ") : "";
    this.children = (this.childArray && this.childArray.length > 0) ? this.childArray.sort().join(" ") : ""

    return (
      <div className="item">
        parents: {this.parents}<br />
        ({i.id}) <b>{i.description}</b><br/>
        children: {this.children}
      </div>
    );
  }

  render() {
    const items = flowData.map((data, key) => {
      return(
        <li key={key}>
          {this.renderItem(data)}
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
      <Items />
    </div>
  );
}

export default App;
