[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# flowmeo
Flowmeo is a web tool for making monodirectional flowcharts (i.e. ones where the flow can never go "backwards").

I created it to help me plan and design video games where, for example, you have to do A before B and B before C, and then you have to do C and D before you can do E.

You can try it out here: https://luvcraft.github.io/flowmeo/

I built it using React (https://reactjs.org/) and Mermaid.js (https://mermaid-js.github.io/mermaid/)

You can download the data from it as either JSON or mmd (mermaid markup), and upload data as JSON. It's designed to be used as a planning tool rather than to generate scripts that you can use directly for game logic, although there's no reason you couldn't use the data for game logic with a suitable system.
