//design model main line
var ML = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(50, 50, 50, 1.0)',
	'strokeW': 5,
	'dash': []
};

//design model main line circle passive
var MLCP = {
	'fill': 'rgba(255, 255, 255, 1.0)',
	'stroke': 'rgba(50, 50, 50, 1.0)',
	'strokeW': 3,
	'r': 6
};

//design model center line
var CL = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(255, 255, 255, 0.5)',
	'strokeW': 1,
	'dash': [10, 4]
};

//design model triangle
var TRI = {
	'fill': 'rgba(220, 220, 220, 0.5)',
	'stroke': 'rgba(255, 255, 255, 0.6)',
	'strokeW': 1,
	'dash': []
};

//design active line
var MLA = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 1.0)',
	'strokeW': 5,
	'dash': []
};

//design model main line circle active 1
var MLCA1 = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(255, 255, 255, 1.0)',
	'strokeW': 2,
	'r': 10
};

//design model main line circle active 2
var MLCA2 = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(50, 50, 50, 1.0)',
	'strokeW': 1,
	'r': 7
};


//guideline
var GL = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.5)',
	'strokeW': 2,
	'dash': []
};

//bounding box 3D
var BB = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 1.0)',
	'strokeW': 1,
	'dash': []
};

//bounding box 3D rect passive
var BBRP = {
	'fill': 'rgba(255, 255, 255, 1.0)',
	'stroke': 'rgba(0, 0, 0, 1.0)',
	'strokeW': 1,
	'w': 5,
	'h': 5
};

//bounding box 3D rect active
var BBRA = {
	'fill': 'rgba(255, 255, 255, 0.0)',
	'stroke': 'rgba(0, 0, 0, 1.0)',
	'strokeW': 3,
	'w': 8,
	'h': 8
};

//view 3D faces
var FP = {
	'fill': {'r':255, 'g':255, 'b':255, 'a':0.9},
	'stroke1': {'r':0, 'g':0, 'b':0, 'a':0.12},
	'stroke2': {'r':0, 'g':0, 'b':0, 'a':0.25},
	'strokeW1': 1,
	'strokeW2': 1
};

var FA = {
	'fill': {'r':170, 'g':170, 'b':170, 'a':0.9},
	'stroke1': {'r':0, 'g':0, 'b':0, 'a':0.4},
	'stroke2': {'r':0, 'g':0, 'b':0, 'a':0.4},
	'strokeW1': 1,
	'strokeW2': 1
};

var FCP = {
	'fill': {'r':255, 'g':255, 'b':255, 'a':0.0},
	'stroke1': {'r':0, 'g':0, 'b':0, 'a':0.0},
	'stroke2': {'r':0, 'g':0, 'b':0, 'a':0.0},
	'strokeW1': 0,
	'strokeW2': 0
};

var FCA = {
	'fill': {'r':255, 'g':255, 'b':255, 'a':0.9},
	'stroke1': {'r':0, 'g':0, 'b':0, 'a':0.0},
	'stroke2': {'r':0, 'g':0, 'b':0, 'a':0.0},
	'strokeW1': 0,
	'strokeW2': 0
};

//ground
var GND = {
	'fill': 'rgba(255, 255, 255, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.5)',
	'strokeW': 1
};


//flat modules
//fold line mountain
var FMFLM = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(50, 50, 50, 0.3)',
	'strokeW': 1,
	'dash': []
};
//fold line valley
var FMFLV = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(50, 50, 50, 0.3)',
	'strokeW': 1,
	'dash': [4]
};
//cut line
var FMCL = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(50, 50, 50, 0.55)',
	'strokeW': 1,
	'dash': []
};
//fill
var FMF = {
	'fill': 'rgba(245, 245, 245, 0.5)',
	'stroke': 'rgba(50, 50, 50, 0.0)',
	'strokeW': 1,
	'dash': []
};
//fold line mountain ghost
var FMFLMG = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.15)',
	'strokeW': 1,
	'dash': []
};
//fold line valley ghost
var FMFLVG = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.15)',
	'strokeW': 1,
	'dash': [4]
};
//cut line ghost
var FMCLG = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.3)',
	'strokeW': 1,
	'dash': []
};
//fill ghost
var FMFG = {
	'fill': 'rgba(245, 245, 245, 0.0)',
	'stroke': 'rgba(50, 50, 50, 0.0)',
	'strokeW': 1,
	'dash': []
};
//passive line
var FMPL = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.1)',
	'strokeW': 3,
	'dash': []
};
//active line
var FMAL = {
	'fill': 'rgba(0, 0, 0, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.3)',
	'strokeW': 3,
	'dash': []
};



//fab canvas
var FCC = {
	'fill': 'rgba(255, 255, 255, 1.0)',
	'stroke': 'rgba(0, 0, 0, 1.0)',
	'strokeW': 1,
	'dash': []
};
//fab canvas shadow
var FCS = {
	'fill': 'rgba(50, 50, 50, 1.0)',
	'stroke': 'rgba(0, 0, 0, 0.0)',
	'strokeW': 1,
	'dash': []
};
//fab canvas ghost
var FCCG = {
	'fill': 'rgba(255, 255, 255, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.2)',
	'strokeW': 1,
	'dash': []
};
//fab canvas shadow ghost
var FCSG = {
	'fill': 'rgba(50, 50, 50, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.0)',
	'strokeW': 1,
	'dash': []
};


//selection window
var SW = {
	'fill': 'rgba(0, 0, 0, 0.05)',
	'stroke': 'rgba(0, 0, 0, 0.5)',
	'strokeW': 1,
	'dash': []
};

//sel bounding box
var SBB = {
	'fill': 'rgba(0, 0, 0, 0.00)',
	'stroke': 'rgba(0, 0, 0, 1.0)',
	'strokeW': 1,
	'dash': []
};

//sel box circle
var SBBC = {
	'fill': 'rgba(255, 255, 255, 1.0)',
	'stroke': 'rgba(0, 0, 0, 1.0)',
	'strokeW': 1,
	'r': 4
};

//sel box rotation circle
var SBBCR = {
	'fill': 'rgba(255, 255, 255, 0.7)',
	'stroke': 'rgba(0, 0, 0, 0.7)',
	'strokeW': 1,
	'r': 15
};

//dimension points
var DIMP = {
	'fill': 'rgba(255, 255, 255, 0.9)',
	'stroke': 'rgba(0, 0, 0, 0.6)',
	'strokeW': 1,
	'r': 3
}

var DIMPA = {
	'fill': 'rgba(255, 255, 255, 0.0)',
	'stroke': 'rgba(0, 0, 0, 0.8)',
	'strokeW': 1,
	'r': 6
}

var DIM = {
	'fill': 'rgba(0, 0, 0, 1.0)',
	'stroke': 'rgba(75, 75, 75, 1.0)',
	'strokeT': 'rgba(255, 255, 255, 0.8)',
	'strokeW': 1,
	'strokeWT': 3,
	'dash': [],
	'r': 3
}

