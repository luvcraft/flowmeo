[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Flowmeo
Flowmeo is a web tool to quickly make one-way, "dependency" flowcharts (aka "[directed acyclic graphs](https://en.wikipedia.org/wiki/Directed_acyclic_graph)"), like you might need for designing an adventure game, or a tech tree, or a skill tree. I made it primarily as an aid for designing video games, but it could be useful for a planning a variety of different kinds of projects or systems.

You can try it out here: https://luvcraft.github.io/flowmeo/

![Flowmeo Screen Shot](images/screenshot.png)

Here's an overview video:

[![Flowmeo Overview Video](https://img.youtube.com/vi/52JzFivuCLo/0.jpg)](https://www.youtube.com/watch?v=52JzFivuCLo)

I built it using React (https://reactjs.org/) with Graphviz-React (https://www.npmjs.com/package/graphviz-react)

There is also a branch that uses mermaid.js (https://mermaid-js.github.io/), but it has rendering issues when graphs start getting big. You're welcome to clone this repo and run that version from the `mermaid` branch.

You can download the data from it as either JSON or DOT (Graphviz markup), and upload data as JSON. It's designed to be used as a planning tool rather than to generate scripts that you can use directly for game logic, although there's no reason you couldn't use the data for game logic with a suitable system.
