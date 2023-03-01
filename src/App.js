import React from 'react';
import { useEffect } from 'react';
import { components } from "react-select";
import CreatableSelect from 'react-select/creatable';
import { EditText, EditTextarea } from 'react-edit-text';
import { confirmAlert } from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Graphviz } from 'graphviz-react';
import { zoom as d3_zoom, select as d3_select, zoomIdentity } from 'd3';
import './App.css';
import './EditText.css';

const startItemId = 'start';

var optionArray = [];
var currentItem;
var refresh = false;
var flowData = [{ "id":"start", "description":"Start", "depth":0 }];
var consoleItem = [];

function generateDot(highlightCurrent, useRank = false, useEdgeColors = true) {
	const edgeColors = [
												'black',
												'#880000',
												'#008800',
												'#000088',
												'#666600',
												'#660066',
												'#006666'
											]

	var edgeColorIndex = 0;
	var rank = [];

	let dot = 'digraph {\nrankdir="TB"\nnode [shape=rect style="rounded,filled" fillcolor="#ECECFF" color="#9370DB" margin=0.2]\n'
				+flowData.map((data) => {    
					var s = data.id + '[id="'+data.id+'"][label="'+data.description+'"]'
					if(data.id === startItemId) {
						s += '[shape=diamond style="filled" width=1 height=1 margin=0]'
					}
					if(data.id === currentItem.id && highlightCurrent) {
						s += '[fillcolor="yellow"]'
					} else if(data.children.length < 1) {
						s += '[fillcolor="pink"]'						
					}

					if(rank[data.depth]) {
						rank[data.depth].push(data.id);
					} else {
						rank[data.depth] = [data.id];
					}

					if(data.children && data.children.length > 0) {
						data.children.forEach((child) => {
							s += '\n'+data.id + ' -> ' + child+'[penwidth=2.0]';
							if(useEdgeColors) {
								s+= '[color="'+edgeColors[edgeColorIndex]+'"]';
								edgeColorIndex++; edgeColorIndex%=edgeColors.length;
							}
						});
					}
					return (s);
				}).join(';\n');

				if(useRank) {

					/*
					// early attempt at getting ranking to work better by creating
					// an invisible ranked list of nodes, and then rank=same-ing 
					// them with nodes of their same rank.
					// 
					// this ended up uncovering a problem with the depth ranking system,
					// and after I fixed that this became superfluous.
					// 
					// but keeping this code for future reference --rhg

					const rankPrefix = "__r";
					var rankList = rankPrefix + "0";
					for(var i=1;i<rank.length;i++) {
						rankList += " -> " + rankPrefix + i;
					}
					dot += '\n{ node [style=invis]; edge [style=invis]; '+rankList+';}';
					*/

					dot += "\n" + rank.map((data, index) =>
					{
						return (
//							'{rank=same; ' + rankPrefix + index + ';' + data.join("; ") + '};'
							'{rank=same; ' + data.join("; ") + '};'
						)
					}).join("\n");
				}

				dot += '\n}';

	return dot;
}

function Flowchart() {
	useEffect(() => {
		const flowchartElement = document.querySelector('div.flowchart');
		const graphElement = flowchartElement.querySelector('g.graph');
		var textElement;

		let svg = d3_select('svg');

		svg.attr('width','100%');
		svg.attr('height','100%');
		svg.attr('viewBox',null);

		flowData.forEach((item) => {
			const e = graphElement.querySelector('#'+item.id);
			if(e) {
				e.onclick = function() { 
					SelectItemById(item.id); 
				};
				if(item === currentItem) {
					textElement = e.querySelector('text');
				}
			}
		});

		// TODO: figure out why textElement is undefined 
		// the first time this happens after a reload --rhg

		if(textElement) {
			recenter(
				flowchartElement,
				parseInt(textElement.getAttribute('x')),
				parseInt(textElement.getAttribute('y'))
			);
		}		
	});

	const recenter = (f,x,y) => {
		let svg = d3_select('svg');
		let bbox = svg.node().getBBox();

		let gx = -x + (f.clientWidth/2);
		let gy = -y + (f.clientHeight/2);

		// clamp gy to the height of the graph
		if(gy > bbox.height) {
			gy = bbox.height;
		}

		let g = d3_select('g');
		g.transition()
		  .duration(500)
		  .attr("transform", "translate(" + gx+ "," + gy + ")scale(1)")
			.on("end", function(event) { 
				svg.call(zoom.transform, zoomIdentity
													.translate(gx,gy)
													.scale(1)
				);
			});
	};

	var useRank = true;
	var useEdgeColors = true;

	const zoom = d3_zoom();
	const dot = generateDot(true, useRank, useEdgeColors);

//	 console.log(dot);

	return (
		<Graphviz 
			className={'flowchart'}
			dot={dot} 
			options={
				{
					zoom: true,
					width: null,
					height: null,
				}
			}
		/>
	);
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
	if(currentItem && currentItem.id === id) {
		LogAction('⚠️ currentItem is already set to: ' + currentItem.id);
		return;
	}
	currentItem = flowData.find((item) => item.id === id);
	localStorage.setItem('currentItemId', currentItem?.id);
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

function CreateIfNew(i, addStartParent = true) {
	if(!flowData.find((item) => item.id === i)) {
		LogAction(i + " doesn't exist! creating!");
		flowData.push({id:i, description:i, parents:addStartParent ? ['start'] : []})
		refresh = true;
	}
}

function LogAction(action){
	console.log(action);
	consoleItem.push(action);
}

class Item extends React.Component {
	handleParentChange(event) {
		let invalid = false;
		event.forEach((data) => {

			// strip whitespace and non alphanumeric characters out of string
			data.value = data.value.replace(/[^A-Z0-9]/ig, "_");

			if(data.value === currentItem.id) {
				LogAction("🚫 Can't make "+data.value+" a parent of itself!");
				invalid = true;
			}
			CreateIfNew(data.value);
			if(AncestorsOf(data.value).includes(currentItem.id)) {
				LogAction("🚫 Can't make "+data.value+" a parent of "+currentItem.id+"! "+currentItem.id+" is an ancestor of "+data.value+"!");
				invalid = true;
			}
		});
		
		if(!invalid) {
			currentItem.parents = event.map((data) => {return data.value});   
			refresh = true;
		}
	};

	handleChildChange(event) {
		// if a child has been removed, remove this parent from all children
		if(event.length < currentItem.children.length) {
			currentItem.children.forEach((c) => {
				var childItem = flowData.find((i) => i.id === c);
				if(childItem) {
					let index = childItem.parents.indexOf(currentItem.id);
					if(index > -1) {
						childItem.parents.splice(index,1);
					}
				}
			});
		}

		let invalid = false;
		event.forEach((data) => { 
			// strip whitespace and non alphanumeric characters out of string
			data.value = data.value.replace(/[^A-Z0-9]/ig, "_");

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
		} else if(name === 'id') {
			if(previousValue === startItemId) {
				LogAction("⚠️ Can't rename start item!");
				return;
			} else if(flowData.find((item) => item.id === value)) {
				LogAction("⚠️ An item named "+value+" already exists!");
				return;
			} else {
				currentItem.id = value;
				flowData.forEach((item) => {
					let index = item.parents?.indexOf(previousValue) ?? -1;
					if(index > -1){
						item.parents[index] = value;
					}
				});
				LogAction("renamed item id " + previousValue + " to " + value);
			}      
		}
		refresh = true;
	}

	confirmDelete = () => {
		const item = currentItem;
		if(item.id === startItemId) {
			return;
		}

		confirmAlert({
			title: "Confirm Deleting Item",
			message: "Are you sure you want to delete "+item.id+"?",
			buttons: [
				{
					label: "Yes",
					onClick: () => this.deleteItem(item)
				},
				{
					label: "No"
				}
			]
		});
	}

	deleteItem(item) {
		LogAction(item.id + " deleted!");
		if(currentItem.id === item.id) {
			SelectItemById(startItemId);
		}

		flowData.forEach((i) => {
			var index = i.parents?.indexOf(item.id) ?? -1;
			if(index > -1) {
				i.parents.splice(index,1);
				if(i.parents.length < 1) {
					i.parents.push(startItemId);
				}
			}
		});

		flowData.splice(flowData.indexOf(item),1);
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

	deleteButton(item) {
		if(item.id !== startItemId) {
			return (
				<button className="deleteItemButton" onClick={this.confirmDelete}>
					Delete
				</button>
			);
		} else {
			return null;
		}
	}

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
				</b><br/>
				{this.deleteButton(i)}        
				<i>
				 <EditText
					name="id"
					defaultValue={i.id}
					onSave={this.handleTextChange}
				/>
				</i>
				(<i>Depth: {i.depth}</i>)<br/>
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
		// strip whitespace and non alphanumeric characters out of string
		event.value = event.value.replace(/[^A-Z0-9]/ig, "_");

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

function ConsoleOutput() {
	return (
		<div className="console">
			<b>Console:</b><br/>
			{
				consoleItem.map((c, key) => {
					return (
						<div key={key} className='consoleItem'>
						{c}
						</div>
					)
				})
			}
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

function LoadDataLocal() {
	let loadedData = JSON.parse(localStorage.getItem('flowData'));
	let currentItemId = localStorage.getItem('currentItemId');
	if(loadedData != null) {
		flowData = loadedData;
	}
	SelectItemById(currentItemId ?? startItemId);
}

function SaveDataLocal() {
	let data = flowData.slice();
	localStorage.setItem('flowData', JSON.stringify(data));
	localStorage.setItem('currentItemId', currentItem.id);
}

class App extends React.Component {
	constructor(props){
		super(props);

		LoadDataLocal();

		this.state = { 
			prevItem: currentItem, 
			prevConsoleLength: 0
		};

		const startItem = flowData.find(i => i.id === startItemId);
		startItem.depth = 0;

		this.refreshData();
	}

	refreshData() {
		optionArray = [];
		flowData.forEach((data) => {
			if(data.id !== startItemId) {
				data.depth = null
			}
		});
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
		if(this.state.prevItem !== currentItem) {
			this.setState({ prevItem: currentItem });
		}

		if(this.state.prevConsoleLength !== consoleItem.length) {
			this.setState({prevConsoleLength: consoleItem.length });
		}

		if(refresh) {
			refresh = false;
			this.refreshData();
			this.setState(this.state);

			SaveDataLocal();
		}
	}

	setDepth(nodeId, depth) {
		var node = flowData.find(i => i.id === nodeId);
		if(node == null || node.children == null) {
			return;
		}
		if(node.id === startItemId || node.depth < depth) {
			node.depth = depth;
			node.children.forEach((i) => {
				this.setDepth(i,depth+1);
			});
		}
	}

	setChildrenAndDepth(i) {
		i.children = [];
		flowData.forEach((data) => {
			if(data.parents && data.parents.includes(i.id)) {
				i.children.push(data.id);
			}
		});
		this.setDepth(startItemId, 0);
	}

	dataForDownload() {
		var downloadData = [];
		flowData.forEach((item) => {
			let ditem = {...item};

			delete ditem['depth'];
			delete ditem['children'];
			if(ditem['notes'] === '') {
				delete ditem['notes'];
			}

			downloadData.push(ditem);
		});
		downloadData.sort((a,b) => a.id.localeCompare(b.id));
		return downloadData;
	}

	handleUpload = (e) => {
		const fileReader = new FileReader();
		fileReader.readAsText(e.target.files[0], "UTF-8");
		fileReader.onload = e => {
			let loadedData = JSON.parse(e.target.result);
			if(loadedData != null) {
				this.clearData();
				loadedData.forEach((d) => {
					if(flowData.find((item) => item.id === d.id)) {
						if(d.id !== startItemId) {
							LogAction("data already contains an item with id '" + d.id + "'. skipping!");
						}
					}
					else {
						flowData.push(d);
					}
				});
			}
			SelectItemById(startItemId);
			refresh = true;
		};
	};

	confirmClear = () => {
		confirmAlert({
			title: "Confirm Clearing Data",
			message: "Are you sure you want to clear all data?",
			buttons: [
				{
					label: "Yes",
					onClick: () => this.clearData()
				},
				{
					label: "No"
				}
			]
		});
	};

	clearData() {
		flowData =  [{ "id":"start", "description":"Start", "depth":0 }];
		currentItem = flowData[0];
		refresh = true;
	}

	render() {
		return (
			<div className="App">
				<Flowchart />
				<div className="rightSide">
					<div className="infoPanel">
						<Toc />
						<Item
							data={currentItem}
						/>
						<a
							type="button"
							href={`data:text/json;charset=utf-8,${encodeURIComponent(
							 JSON.stringify(this.dataForDownload(),null,'\t')
							)}`}
							download="flowmeo.json"
						>
							<button>
								Download Json
							</button>
						</a>
						<a
							type="button"
							href={`data:text/json;charset=utf-8,${encodeURIComponent(
							 generateDot(false)
							)}`}
							download="flowmeo.dot"
						>
							<button>
								Download DOT
							</button>
						</a>
						<button onClick={() => document.getElementById('file-upload').click()}>
							Upload Json
						</button>
						<input id="file-upload" type="file" accept=".json" onChange={this.handleUpload} style={{display:'none'}} />
						<button className="clearDataButton" onClick={this.confirmClear}>
							Clear Data
						</button>
					</div>
					<ConsoleOutput />
				</div>
			</div>  
		);
	}
}

export default App;
