import React from 'react';
import { useEffect } from 'react';
import { Graphviz } from 'graphviz-react';
import { zoom as d3_zoom, select as d3_select, zoomTransform, zoomIdentity } from 'd3';
import { startItemId, currentItem, flowData, SelectItemById } from './App'

export function Flowchart() {
	useEffect(() => {
		const flowchartElement = document.querySelector('div.flowchart');
		const graphElement = flowchartElement.querySelector('g.graph');
		var textElement;

		let svg = d3_select('svg');

		svg.attr('width', '100%');
		svg.attr('height', '100%');
		svg.attr('viewBox', null);

		flowData.forEach((item) => {
			const e = graphElement.querySelector('#' + item.id);
			if (e) {
				e.onclick = function () {
					SelectItemById(item.id);
				};
				if (item === currentItem) {
					textElement = e.querySelector('text');
				}
			}
		});

		// TODO: figure out why textElement is undefined 
		// the first time this happens after a reload,
		// but only when running locally --rhg

		if (textElement) {
			recenter(
				flowchartElement,
				parseInt(textElement.getAttribute('x')),
				parseInt(textElement.getAttribute('y'))
			);
		}
	});

	const recenter = (f, x, y) => {
		let svg = d3_select('svg');
		let bbox = svg.node().getBBox();

		let gx = -x + (f.clientWidth / 2);
		let gy = -y + (f.clientHeight / 2);

		const top = bbox.height / zoomTransform(svg.node()).k;

		// clamp gy to the height of the graph
		if (gy > top) {
			gy = top;
		}

		let g = d3_select('g');

		g.transition()
			.duration(500)
			.attr("transform", "translate(" + gx + "," + gy + ")scale(1)")
			.on("end", function (event) {
				svg.call(zoom.transform, zoomIdentity
					.translate(gx, gy)
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
					useWorker: false,
					tweenShapes: false,
					tweenPaths: false
				}
			}
		/>
	);
}

// split the provided string into \n separated strings of maxLength or less characters
function WrapByLength(str, maxLength = 25) {
	const list = str.split(' ');

	let curline = '';
	let outlines = [];
	let firstWord = true;

	list.forEach((word) => {
		if ((curline.length + word.length + 1) > maxLength) {
			outlines.push(curline);
			curline = '';
		} else if (!firstWord) {
			curline += ' ';
		}
		curline += word;
		firstWord = false;
	});
	outlines.push(curline);

	return outlines.join('\n');
}

export function generateDot(highlightCurrent, useRank = false, useEdgeColors = true) {
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

	let dot = 'digraph {\nrankdir="TB"\nranksep=0.75\n'
		+ 'node [shape=rect style="rounded,filled" fillcolor="#ECECFF" color="#9370DB" margin=0.2]\n'
		+ 'edge [penwidth=2.0]\n'
		+ flowData.map((data) => {
			var s = data.id + '[id="' + data.id + '"][label="' + WrapByLength(data.description) + '"]'
			if (data.id === startItemId) {
				s += '[shape=diamond style="filled" width=1 height=1 margin=0]'
			}
			if (data.id === currentItem.id && highlightCurrent) {
				s += '[fillcolor="yellow"]'
			} else if (data.children.length < 1) {
				s += '[fillcolor="pink"]'
			}

			if (rank[data.depth]) {
				rank[data.depth].push(data.id);
			} else {
				rank[data.depth] = [data.id];
			}

			if (data.children && data.children.length > 0) {
				data.children.forEach((child) => {
					s += '\n' + data.id + ' -> ' + child;
					if (useEdgeColors) {
						s += '[color="' + edgeColors[edgeColorIndex] + '"]';
						edgeColorIndex++; edgeColorIndex %= edgeColors.length;
					}
				});
			}
			return (s);
		}).join(';\n');

	if (useRank) {

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

		dot += "\n" + rank.map((data, index) => {
			return (
				//							'{rank=same; ' + rankPrefix + index + ';' + data.join("; ") + '};'
				'{rank=same; ' + data.join("; ") + '};'
			)
		}).join("\n");
	}

	dot += '\n}';

	return dot;
}