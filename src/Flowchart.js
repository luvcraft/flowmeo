import React from 'react';
import mermaid from "mermaid"
import { startItemId, currentItem, flowData, SelectItemById } from './App'

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

export function Flowchart() {
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