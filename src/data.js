export const flowData = [
	{
		"id":"start",
		"description":"Start"
	},
	{
		"id":"arrive",
		"description":"Arrive in Town",
		"parents":[
			"start"
		]
	},
	{
		"id":"meetTater",
		"description":"Meet Dick Tater",
		"parents":[
			"arrive"
		]
	},
	{
		"id":"firstDay",
		"description":"Sleep in the Town Hall",
		"parents":[
			"meetTater"
		]
	},
	{
		"id":"getDeed",
		"description":"Get the Deed",
		"parents":[
			"firstDay"
		]
	},
	{
		"id":"meetGclock",
		"description":"Meet Grandfather Clock",
		"parents":[
			"firstDay"
		]
	},
	{
		"id":"getCrank",
		"description":"Get the Crank",
		"parents":[
			"firstDay"
		]
	},
	{
		"id":"openWorkshop",
		"description":"Open the Workshop",
		"parents":[
			"meetGclock"
		]
	},
	{
		"id":"fixRecycler",
		"description":"Fix the Recycler",
		"parents":[
			"openWorkshop",
			"getCrank"
		]
	},
	{
		"id":"meetReel",
		"description":"Meet Reel McKoi",
		"parents":[
			"firstDay"
		]
	},
	{
		"id":"meetBeaverly",
		"description":"Meet Beaverly",
		"parents":[
			"firstDay"
		]
	},
	{
		"id":"meetPastrami",
		"description":"Meet Madame Pastrami",
		"parents":[
			"firstDay"
		]
	},
];