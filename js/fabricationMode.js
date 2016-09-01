// fabrication canvas

var fabCanvas = [];

var FabCanvas = function(p, width, height) {
	this.pos = p;
	this.w = width;
	this.h = height;
}

FabCanvas.prototype.display = function(appearance, appearanceShadow) {
	var shadowOffset = {'x':1, 'y': 1};
	var ptA = this.pos;
	var ptB = vecAdd([this.pos, {'x':this.w, 'y':0}]);
	var ptC = vecAdd([ptB, {'x':0, 'y':this.h}]);
	var ptD = vecAdd([ptC, {'x':-this.w, 'y':0}]);
	drawPolyline([vecAdd([ptA, shadowOffset]), vecAdd([ptB, shadowOffset]), vecAdd([ptC, shadowOffset]), vecAdd([ptD, shadowOffset])], appearanceShadow, true);
	drawPolyline([ptA, ptB, ptC, ptD], appearance, true);
}

var template = []; //contains one unfolded module starting from and aligned to origin
var folding = []; //contains mountain and valley folding sequence: 1=mountain, -1=valley

var segmentArray = [];

//caps and modules

var flatModule = [];
var topCap = {'pos':{'x':0, 'y':0}, 'rot':0, 'point':[]};
var bottomCap = {'pos':{'x':0, 'y':0}, 'rot':0, 'point':[]};

function calCap(dMP) {
	topCap.point = [];
	bottomCap.point = [];
	var rT = dist2Pt3D(dMP[0][0], {'x':0, 'y':dMP[0][0].y, 'z':0});
	var rB = dist2Pt3D(dMP[layerCount-1][0], {'x':0, 'y':dMP[layerCount-1][0].y, 'z':0});
	var pT = {'x':rT*scale2D, 'y':0};
	var pB = {'x':rB*scale2D, 'y':0};
	var angle = Math.PI*2/sideCount;
	for (var i=0; i<sideCount; i++) {
		var t = rotateAboutAxis(pT, origin, zAxis, topCap.rot+i*angle);
		var b = rotateAboutAxis(pB, origin, zAxis, bottomCap.rot+i*angle);
		topCap.point.push(vecAdd([t, topCap.pos]));
		bottomCap.point.push(vecAdd([b, bottomCap.pos]));
	}
}

function drawCap(appearanceFLM, appearanceFLV, appearanceCL, appearanceF, appearanceAL) {
	if (topCapBool) {
		drawPolyline(topCap.point, appearanceF, true);
		for (var i=0; i<topCap.point.length; i++) {
			drawFemaleJoint(topCap.point[(i+1)%sideCount], topCap.point[i], appearanceCL, appearanceFLM, appearanceF);
		}
		if (moduleSelection.indexOf('t')>-1 && mode=='arrange2D') {
			for (var i=0; i<topCap.point.length; i++) {
				drawPolyline([topCap.point[(i+1)%sideCount], topCap.point[i]], appearanceAL, false);
			}
		}
	}
	if (bottomCapBool) {
		drawPolyline(bottomCap.point, appearanceF, true);
		for (var i=0; i<bottomCap.point.length; i++) {
			drawFemaleJoint(bottomCap.point[(i+1)%sideCount], bottomCap.point[i], appearanceCL, appearanceFLM, appearanceF);
		}
		if (moduleSelection.indexOf('b')>-1 && mode=='arrange2D') {
			for (var i=0; i<bottomCap.point.length; i++) {
				drawPolyline([bottomCap.point[(i+1)%sideCount], bottomCap.point[i]], appearanceAL, false);
			}
		}
	}
}

var FlatModule = function(p, r, s) {
	this.pos = p;
	this.rot = r;
	this.segment = s;
	this.point = [];
}

FlatModule.prototype.calPoint = function(ptList, sA) {
	this.point = [];
	for (var i=sA[this.segment].s; i<sA[this.segment].e; i++) {
		var ptA = rotateAboutAxis(scaleOrigin2D(ptList[sA[this.segment].s], origin, scale2D, scale2D), origin, zAxis, this.rot);
		var ptB = rotateAboutAxis(scaleOrigin2D(ptList[i], origin, scale2D, scale2D), origin, zAxis, this.rot);
		var pt = vecAdd([vecSub(ptA, ptB), this.pos]);
		this.point.push(pt);
	}
}

FlatModule.prototype.display = function(appearanceFLM, appearanceFLV, appearanceCL, appearanceF, appearancePL, appearanceAL, index, sA) {
	var boundary = [];
	for (var i=0; i<this.point.length; i++) {
	//left boundary
		if (i%2==0) {
			boundary.push(this.point[i]);
		}
	}
	for (var i=this.point.length-1; i>-1; i--) {
		//right boundary
		if (i%2==1) {
			boundary.push(this.point[i]);
		}
	}
	//fill outline
	drawPolyline(boundary, appearanceF);
	
	for (var i=0; i<this.point.length; i++) {
		//top end
		if (i==0) {
			var ptA, ptB, ptA2, ptB2;
			ptA2 = this.point[i];
			ptB2 = this.point[i+1];
			var det = determinant(this.point[this.point.length-1], ptA2, ptB2);
			ptA = det<0 ? ptA2 : ptB2;
			ptB = det<0 ? ptB2 : ptA2;
			if (Math.floor(index/sideCount)>0) {
				drawFemaleJoint(ptA, ptB, appearanceCL, appearanceFLM, appearanceF);
			} else {
				if (topCapBool) {
					drawMaleJoint(this.point[i], this.point[i+1], appearanceCL, appearanceFLM, appearanceF);
				} else {
					drawPolyline([this.point[i], this.point[i+1]], appearanceCL);
				}
			}
			if (mode=='fuse2D' && Math.floor(index/sideCount)>0) {
				if (Math.floor(index/sideCount)==fuseFabricationPt.fM && fuseFabricationPt.i==0) {
					drawPolyline([this.point[i], this.point[i+1]], appearanceAL);
				} else {
					drawPolyline([this.point[i], this.point[i+1]], appearancePL);
				}
			}
			if (mode=='arrange2D' && moduleSelection.indexOf(index)>-1) {
				drawPolyline([this.point[i], this.point[i+1]], appearanceAL);
			}
		}
		//bottom end
		if (i==this.point.length-1) {
			var ptA, ptB, ptA2, ptB2;
			ptA2 = this.point[i];
			ptB2 = this.point[i-1];
			var det = determinant(this.point[0], ptA2, ptB2);
			ptA = det>0 ? ptA2 : ptB2;
			ptB = det>0 ? ptB2 : ptA2;
			if (Math.floor(index/sideCount)<sA.length-1) {
				drawMaleJoint(ptA, ptB, appearanceCL, appearanceFLM, appearanceF);
			} else {
				if (bottomCapBool) {
					drawMaleJoint(ptA, ptB, appearanceCL, appearanceFLM, appearanceF);
				} else {
					drawPolyline([this.point[this.point.length-2], this.point[this.point.length-1]], appearanceCL);
				}
			}
			if (mode=='fuse2D' && Math.floor(index/sideCount)<sA.length-1) {
				if (Math.floor(index/sideCount)==fuseFabricationPt.fM && fuseFabricationPt.i==1) {
					drawPolyline([this.point[i-1], this.point[i]], appearanceAL);
				} else {
					drawPolyline([this.point[i-1], this.point[i]], appearancePL);
				}
			}
			if (mode=='arrange2D' && moduleSelection.indexOf(index)>-1) {
				drawPolyline([this.point[this.point.length-2], this.point[this.point.length-1]], appearanceAL);
			}
		}
		//folding lines
		if (i>0 && i<this.point.length-2) {
			var foldAppearance = folding[i-1+sA[this.segment].s] < 0 ? appearanceFLV : appearanceFLM;
			drawPolyline([this.point[i], this.point[i+1]], foldAppearance);
			if (mode=='split2D') {
				if (Math.floor(index/sideCount)==splitFabricationPt.fM && i==splitFabricationPt.i) {
					drawPolyline([this.point[i], this.point[i+1]], appearanceAL);
				} else {
					drawPolyline([this.point[i], this.point[i+1]], appearancePL);
				}
			}
		}
		
		if (i%2==0 && i<this.point.length-2) {
			if (sA[this.segment].s%2==1) { //right side
				drawMaleJoint(this.point[i], this.point[i+2], appearanceCL, appearanceFLM, appearanceF);
			} else { //left side
				drawFemaleJoint(this.point[i], this.point[i+2], appearanceCL, appearanceFLM, appearanceF);
			}
			if (mode=='arrange2D' && moduleSelection.indexOf(index)>-1) {
				drawPolyline([this.point[i], this.point[i+2]], appearanceAL);
			}
		}
		
		if (i%2==1 && i<this.point.length-2) {
			if (sA[this.segment].s%2==1) { //left side
				drawFemaleJoint(this.point[i], this.point[i+2], appearanceCL, appearanceFLM, appearanceF);
			} else { //right side
				drawMaleJoint(this.point[i], this.point[i+2], appearanceCL, appearanceFLM, appearanceF);
			}
			if (mode=='arrange2D' && moduleSelection.indexOf(index)>-1) {
				drawPolyline([this.point[i], this.point[i+2]], appearanceAL);
			}
		}
	}
	
}

function calUnfold(dMP) {
	var vArray = [];
	var lengthArray = [];
	var angleArray = [];
	
	for (var i=0; i<dMP.length-1; i++) {
		vArray.push(vecSub3D(dMP[i][0], dMP[i][1]));
		vArray.push(vecSub3D(dMP[i][1], dMP[i+1][0]));
	}
	vArray.push(vecSub3D(dMP[dMP.length-1][0], dMP[dMP.length-1][1]));
	
	for (var i=0; i<vArray.length; i++) {
		if (i==0) {
			angleArray.push(0);
		} else {
			angleArray.push(angleBetweenVec3D(scalarMult3D(vArray[i-1], -1), vArray[i]));
		}
		lengthArray.push(vecMag3D(vArray[i]));
	}
	
	
	var unfoldPt = [];
	unfoldPt.push({'x':0, 'y':0});
	var dir = {'x':-1, 'y':0};
	for (var i=0; i<vArray.length; i++) {
		dir = rotateAboutAxis(dir, origin, zAxis, Math.pow(-1, (i+1)%2)*(Math.PI-angleArray[i]));
		var tV = scalarMult(dir, lengthArray[i]);
		unfoldPt.push(vecAdd([unfoldPt[i], tV]));
	}
	var spine = vecSub(scalarMult(vecAdd([unfoldPt[0], unfoldPt[1]]), 1/2), scalarMult(vecAdd([unfoldPt[unfoldPt.length-1], unfoldPt[unfoldPt.length-2]]), 1/2)); //mid point of top edge to mid point of bottom edge
	var angle = angleVec(yAxis, spine);
	for (var i=0; i<unfoldPt.length; i++) {
		unfoldPt[i] = rotateAboutAxis(unfoldPt[i], origin, zAxis, -angle);
	}
	return unfoldPt;
}

function calFolding(dMP) {
	
	// [0][0] 0  __  1 [0][1]
	//          | /|
	// [1][0] 2 |/_| 3 [1][1]
	//          | /|
	// [2][0] 4 |/_| 5 [2][1]
	//	
	
	var foldList = [];
	
	for (var i=1; i<dMP.length*2-2; i++) {
		var index = Math.floor(i/2);
		if (i%2==1) {
			var aN = norm3Pt(dMP[index][1], dMP[index+1][0], dMP[index][0]);
			var aRef = dMP[index][0];
			var bRef = dMP[index+1][1];
			var ab = vecSub3D(aRef, bRef);
			var dot = dotPdt3D(aN, ab);
			if (dot > 0) {
				foldList.push(-1);
			} else {
				foldList.push(1);
			}
		} else {
			var aN = norm3Pt(dMP[index][0], dMP[index-1][1], dMP[index][1]);
			var aRef = dMP[index-1][1];
			var bRef = dMP[index+1][0];
			var ab = vecSub3D(aRef, bRef);
			var dot = dotPdt3D(aN, ab);
			if (dot > 0) {
				foldList.push(-1);
			} else {
				foldList.push(1);
			}
		}
	}
		
	return foldList;
}

function calSizeDir(pos, dir, ptList) {
	var CP = [];
	var ptA = pos;
	var ptB = vecAdd([ptA, dir]);
	var dirNorm = unitVector(dir);
	var dirPerpNorm = rotateAboutAxis(dirNorm, origin, zAxis, Math.PI/2);
	var ptC = vecAdd([ptA, dirPerpNorm]);
	for (var i=0; i<ptList.length; i++) {
		var pt = lineCP(ptA, ptList[i], ptB);
		var dW = determinant(ptList[i], ptA, ptB) >= 0 ? 1 : -1;
		var dH = determinant(ptList[i], ptA, ptC) >= 0 ? 1 : -1;
		CP.push({'pt':pt, 'w':dW*dist2Pt(ptList[i].x, ptList[i].y, pt.x, pt.y), 'h':dH*dist2Pt(pos.x, pos.y, pt.x, pt.y)});
	}
	CP.sort(function (a, b) {
		return b.w - a.w;
	});
	var w = CP[0].w - CP[CP.length-1].w;
	var wMid = vecAdd([pos, scalarMult(dirPerpNorm, (CP[0].w + CP[CP.length-1].w)/2)]);
	CP.sort(function (a, b) {
		return b.h - a.h;
	});
	var h = CP[0].h - CP[CP.length-1].h;
	var mid = vecAdd([wMid, scalarMult(dirNorm, -(CP[0].h + CP[CP.length-1].h)/2)]);
	return {'w':w, 'h':h, 'center':mid};
}

// initialize fabrication drawing

function initFabrication() {
	template = calUnfold(designModel.point);
	folding = calFolding(designModel.point);
	scale2D = ($('#workspaceCanvas').innerHeight()/2)/canvasH;
	var templateSize = calSizeDir(origin, yAxis, template);
	var gap = (templateSize.w + initModuleGap)*scale2D;
	var startPos = {'x':($('#workspaceCanvas').innerWidth()-canvasW*scale2D)/2, 'y':($('#workspaceCanvas').innerHeight()-canvasH*scale2D)/2};
	fabCanvas.push(new FabCanvas(startPos, canvasW*scale2D, canvasH*scale2D));
	flatModule = [];
	segmentArray = [];
	segmentArray.push({'s':0, 'e':template.length});
	for (var i=0; i<sideCount; i++) {
		flatModule.push(new FlatModule(vecAdd([vecAdd([startPos, {'x':gap/4, 'y':gap/4}]), {'x':gap*i, 'y':0}]), 0, 0));
		flatModule[i].calPoint(template, segmentArray);
	}
	
	topCap.pos = {'x':fabCanvas[0].pos.x+fabCanvas[0].w, 'y':fabCanvas[0].pos.y};
	bottomCap.pos = {'x':fabCanvas[0].pos.x+fabCanvas[0].w, 'y':fabCanvas[0].pos.y+fabCanvas[0].h};
	calCap(designModel.point);
}

// update fabrication drawing

function updateFabrication() {
	template = calUnfold(designModel.point);
	folding = calFolding(designModel.point);
	for (var i=0; i<flatModule.length; i++) {
		flatModule[i].calPoint(template, segmentArray);
	}
	calCap(designModel.point);
	selBoundingBox();
}

// highlight part

var activeFaceList = [];
function highlightPart() {
	var bool = false;
	activeFaceList = [];
	if (!selWindow.bool) {
		for (var i=0; i<flatModule.length; i++) {
			for (var j=0; j<flatModule[i].point.length-2; j++) {
				if (pt_in_triangle(canvasPoint, flatModule[i].point[j], flatModule[i].point[j+1], flatModule[i].point[j+2])) {
					var sideIndex = i%sideCount;
					for (var k = segmentArray[flatModule[i].segment].s; k < segmentArray[flatModule[i].segment].e-2; k++) {
						var layerIndex = Math.floor(k/2);
						activeFaceList.push(layerIndex*sideCount*2 + sideIndex*2 + k%2);
					}
					bool = true;
					break;
				}
			}
		}
		if (!bool && topCapBool) {
			var ptA = topCap.point[0];
			for (var i=0; i<topCap.point.length-2; i++) {
				var ptB = topCap.point[i+1];
				var ptC = topCap.point[i+2];
				if (pt_in_triangle(canvasPoint, ptA, ptB, ptC)) {
					for (var j=0; j<sideCount-2; j++) {
						activeFaceList.push(viewModel.face.length-(sideCount-2)-j-1);
					}
					activeFaceList.push();
					bool = true;
					break;
				}
			}
		}
		if (!bool && bottomCapBool) {
			var ptA = bottomCap.point[0];
			for (var i=0; i<bottomCap.point.length-2; i++) {
				var ptB = bottomCap.point[i+1];
				var ptC = bottomCap.point[i+2];
				if (pt_in_triangle(canvasPoint, ptA, ptB, ptC)) {
					for (var j=0; j<sideCount-2; j++) {
						activeFaceList.push(viewModel.face.length-j-1);
					}
					activeFaceList.push();
					bool = true;
					break;
				}
			}
		}
	}
}

// update fabrication after add point

function addPointFabrication(i) {
	template = calUnfold(designModel.point);
	folding = calFolding(designModel.point);
	var indexA = i*2;
	var addI = 0;
	for (var i=0; i<segmentArray.length; i++) {
		if (indexA < segmentArray[i].e) {
			segmentArray[i].e = segmentArray[i].e + 2;
			addI = i;
			break;
		}
	}
	for (var i=(addI+1); i<segmentArray.length; i++) {
		segmentArray[i].s = segmentArray[i].s + 2;
		segmentArray[i].e = segmentArray[i].e + 2;
	}
	for (var i=0; i<flatModule.length; i++) {
		flatModule[i].calPoint(template, segmentArray);
	}
	calCap(designModel.point);
}

// update fabrication after subtract point

function subtractPointFabrication(len) {
	template = calUnfold(designModel.point);
	folding = calFolding(designModel.point);
	var size = len*2;
	var partBool = false;
	var index = segmentArray.length-1;
	
	segmentArray[index].e = segmentArray[index].e - 2;
	
	if (segmentArray[index].e - segmentArray[index].s <= 2) {
		segmentArray.splice(index, 1);
		flatModule.splice(index*sideCount, sideCount);
	}
	
	for (var i=0; i<flatModule.length; i++) {
		flatModule[i].calPoint(template, segmentArray);
	}
	calCap(designModel.point);
}


// split modules

var splitFabricationPt = {'fM':-1, 'i':-1};

function selSplitLine() {
	var bool = false;
	for (var i=0; i<flatModule.length; i++) {
		for (var j=1; j<flatModule[i].point.length-2; j++) {
			var CP = lineCP(flatModule[i].point[j], canvasPoint, flatModule[i].point[j+1]);
			var d = dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y);
			if (d < tolerance && CP.t > 0 && CP.t < 1) {
				splitFabricationPt = {'fM':Math.floor(i/sideCount), 'i':j};
				bool = true;
			}
		}
	}
	if (!bool) {
		splitFabricationPt = {'fM':-1, 'i':-1};
	}
}

var splitPushDist = 10;

function splitLine() {
	if (splitFabricationPt.i != -1) {
		var fM = splitFabricationPt.fM;
		var index = splitFabricationPt.i;
		var end = segmentArray[fM].e;
		var prevIndex = segmentArray[fM].s;
		segmentArray[fM].e = prevIndex+index+2;
		segmentArray.splice(fM+1, 0, {'s':index+prevIndex, 'e':end});
		for (var i=0; i<flatModule.length; i++) {
			if (flatModule[i].segment > fM) {
				flatModule[i].segment++;
			}
		}
		for (var i=sideCount-1; i>-1; i--) {
			var ptA = flatModule[fM*sideCount+i].point[index];
			var rotA = flatModule[fM*sideCount+i].rot;
			ptA = vecAdd([ptA, scalarMult(rotateAboutAxis(yAxis, origin, zAxis, rotA), splitPushDist*scale2D)]);
			flatModule.splice((fM+1)*sideCount, 0, new FlatModule(ptA, rotA, fM+1));
		}
		for (var i=0; i<flatModule.length; i++) {
			flatModule[i].calPoint(template, segmentArray);
		}
	}
	moduleSelection = [];
	selBox.bool = false;
	recordBool = true;
}

// fuse split modules

var fuseFabricationPt = {'fM':-1, 'i':-1}; //i: -1=no selection, 0=top edge selected, 1=bottom edge selected

function selFuseLine() {
	var bool = false;
	for (var i=0; i<flatModule.length; i++) {
		if (Math.floor(i/sideCount) > 0) {
			var CP = lineCP(flatModule[i].point[0], canvasPoint, flatModule[i].point[1]);
			var d = dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y);
			if (d < tolerance && CP.t > 0 && CP.t < 1) {
				fuseFabricationPt = {'fM':Math.floor(i/sideCount), 'i':0};
				bool = true;
				break;
			}
		}
		if (Math.floor(i/sideCount) < segmentArray.length-1) {
			var CP = lineCP(flatModule[i].point[flatModule[i].point.length-2], canvasPoint, flatModule[i].point[flatModule[i].point.length-1]);
			var d = dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y);
			if (d < tolerance && CP.t > 0 && CP.t < 1) {
				fuseFabricationPt = {'fM':Math.floor(i/sideCount), 'i':1};
				bool = true;
				break;
			}
		}
	}
	if (!bool) {
		fuseFabricationPt = {'fM':-1, 'i':-1};
	}
}

function fuseLine() {
	var fM = -1;
	if (fuseFabricationPt.i == 0) {
		fM = fuseFabricationPt.fM - 1;
	}
	if (fuseFabricationPt.i == 1) {
		fM = fuseFabricationPt.fM;
	}
	if (fM != -1) {
		segmentArray[fM].e = segmentArray[fM+1].e;
		segmentArray.splice(fM+1, 1);
		flatModule.splice((fM+1)*sideCount, sideCount);
		for (var i=0; i<flatModule.length; i++) {
			if (flatModule[i].segment > fM) {
				flatModule[i].segment--;
			}
		}
	}
	for (var i=0; i<flatModule.length; i++) {
		flatModule[i].calPoint(template, segmentArray);
	}
	moduleSelection = [];
	selBox.bool = false;
	recordBool = true;
}

// add sides

function addModule() {
	template = calUnfold(designModel.point);
	folding = calFolding(designModel.point);
	var remPosRot = [];
	if (removedModulePosRot.length > 0) {
		for (var i=0; i<removedModulePosRot[0].length; i++) {
			remPosRot.push(removedModulePosRot[0][i]);
		}
		removedModulePosRot.splice(0, 1);
	}
	for (var i=0; i<segmentArray.length; i++) {
		var insertI = sideCount*(i+1)-1;
		var pos, rot;
		if (remPosRot.length > 0) {
			var index = i>=remPosRot.length ? remPosRot.length-1 : i;
			pos = remPosRot[index].pos;
			rot = remPosRot[index].rot;
		} else {
			rot = 0;
			if (i==0) {
				pos = {'x':fabCanvas[0].pos.x+fabCanvas[0].w, 'y':fabCanvas[0].pos.y};
			} else {
				var h = calSizeDir(flatModule[sideCount*i-1].pos, yAxis, flatModule[sideCount*i-1].point).h;
				pos = {'x':fabCanvas[0].pos.x+fabCanvas[0].w, 'y':flatModule[sideCount*i-1].pos.y+h+splitPushDist*scale2D};
			}
		}
		flatModule.splice(insertI, 0, new FlatModule(pos, rot, i));
		flatModule[insertI].calPoint(template, segmentArray);
	}
	for (var i=0; i<flatModule.length; i++) {
		flatModule[i].calPoint(template, segmentArray);
	}
	calCap(designModel.point);
	selBox.bool = false;
	moduleSelection = [];
	highlightPart();
}

// remove sides

var removedModulePosRot = [];

function removeModule() {
	template = calUnfold(designModel.point);
	folding = calFolding(designModel.point);
	var remPosRot = [];
	for (var i=segmentArray.length-1; i>-1; i--) {
		var removeI = (sideCount+1)*(i+1)-1;
		remPosRot.splice(0, 0, {'pos':flatModule[removeI].pos, 'rot':flatModule[removeI].rot});
		flatModule.splice(removeI, 1);
	}
	removedModulePosRot.splice(0, 0, remPosRot);
	for (var i=0; i<flatModule.length; i++) {
		flatModule[i].calPoint(template, segmentArray);
	}
	calCap(designModel.point);
	selBox.bool = false;
	moduleSelection = [];
	highlightPart();
}

// pan fabrication drawing

function panFabrication() {
	if (isMouseDown) {
		var tV = vecSub(pcanvasPoint, canvasPoint);
		for (var i=0; i<fabCanvas.length; i++) {
			fabCanvas[i].pos = vecAdd([fabCanvas[i].pos, tV]);
		}
		for (var i=0; i<flatModule.length; i++) {
			flatModule[i].pos = vecAdd([flatModule[i].pos, tV]);
			flatModule[i].calPoint(template, segmentArray);
		}
		for (var i=0; i<selBox.point.length; i++) {
			selBox.point[i] = vecAdd([selBox.point[i], tV]);
		}
		topCap.pos = vecAdd([topCap.pos, tV]);
		bottomCap.pos = vecAdd([bottomCap.pos, tV]);
		calCap(designModel.point);
	}
}

// zoom fabrication drawing

function zoomFabrication(scaleFactor) {
	for (var i=0; i<fabCanvas.length; i++) {
		fabCanvas[i].pos = scaleOrigin2D(fabCanvas[i].pos, canvasPoint, scaleFactor, scaleFactor);
		fabCanvas[i].w = fabCanvas[i].w * scaleFactor;
		fabCanvas[i].h = fabCanvas[i].h * scaleFactor;
	}
	for (var i=0; i<flatModule.length; i++) {
		flatModule[i].pos = scaleOrigin2D(flatModule[i].pos, canvasPoint, scaleFactor, scaleFactor);
		flatModule[i].calPoint(template, segmentArray);
	}
	for (var i=0; i<selBox.point.length; i++) {
		selBox.point[i] = scaleOrigin2D(selBox.point[i], canvasPoint, scaleFactor, scaleFactor);
	}
	topCap.pos = scaleOrigin2D(topCap.pos, canvasPoint, scaleFactor, scaleFactor);
	bottomCap.pos = scaleOrigin2D(bottomCap.pos, canvasPoint, scaleFactor, scaleFactor);
	calCap(designModel.point);
}

// arrange modules

var moduleSelection = [];
var insideModule = -1;

function selArrange() {
	var bool = false;
	for (var i=0; i<flatModule.length; i++) {
		for (var j=0; j<flatModule[i].point.length-2; j++) {
			if (pt_in_triangle(canvasPoint, flatModule[i].point[j], flatModule[i].point[j+1], flatModule[i].point[j+2])) {
				insideModule = i;
				bool = true;
				break;
			}
		}
	}
	if (!bool && topCapBool) {
		var ptA = topCap.point[0];
		for (var i=0; i<topCap.point.length-2; i++) {
			var ptB = topCap.point[i+1];
			var ptC = topCap.point[i+2];
			if (pt_in_triangle(canvasPoint, ptA, ptB, ptC)) {
				insideModule = 't';
				bool = true;
				break;
			}
		}
	}
	if (!bool && bottomCapBool) {
		var ptA = bottomCap.point[0];
		for (var i=0; i<bottomCap.point.length-2; i++) {
			var ptB = bottomCap.point[i+1];
			var ptC = bottomCap.point[i+2];
			if (pt_in_triangle(canvasPoint, ptA, ptB, ptC)) {
				insideModule = 'b';
				bool = true;
				break;
			}
		}
	}
	if (!bool) {
		insideModule = -1;
	}
}

var selClick = false;
function selModuleClick() {
	if (shiftDown) {
		if (insideModule != -1) {
			var i = moduleSelection.indexOf(insideModule);
			if (i == -1) {
				moduleSelection.push(insideModule);
			} else {
				moduleSelection.splice(i, 1);
			}
		}
	} else if (!checkMouseBox()) {
		moduleSelection = [];
		if (insideModule != -1) {
			moduleSelection.push(insideModule);
		}
	}
	selBoundingBox();
	selClick = true;
}

var selWindow = {'bool':false, 'corner':[]};

function drawSelWindow(appearance) {
	if (selWindow.bool) {
		drawPolyline(selWindow.corner, appearance, true);
	}
}

function selModuleWindow() {
	if (selClick) {
		selClick = false;
		selWindow.bool = false;
	} else {
		if (isMouseDown && !selWindow.bool && !moving) {
			if (insideModule==-1) {
				selWindow.bool = true;
			}
		}
		if (isMouseDown && selWindow.bool) {
			selWindow.corner = [];
			selWindow.corner.push({'x':rememberPoint.x, 'y':rememberPoint.y});
			selWindow.corner.push({'x':rememberPoint.x, 'y':canvasPoint.y});
			selWindow.corner.push({'x':canvasPoint.x, 'y':canvasPoint.y});
			selWindow.corner.push({'x':canvasPoint.x, 'y':rememberPoint.y});
		}
		if (!isMouseDown && selWindow.bool) {
			selWindow.bool = false;
			var moduleList = [];
			for (var i=0; i<flatModule.length; i++) {
				for (var j=0; j<flatModule[i].point.length; j++) {
					if (pt_in_quad(flatModule[i].point[j], selWindow.corner[0], selWindow.corner[1], selWindow.corner[2], selWindow.corner[3])) {
						moduleList.push(i);
						break;
					}
				}
			}
			if (topCapBool) {
				for (var i=0; i<topCap.point.length; i++) {
					if (pt_in_quad(topCap.point[i], selWindow.corner[0], selWindow.corner[1], selWindow.corner[2], selWindow.corner[3])) {
						moduleList.push('t');
						break;
					}
				}
			}
			if (bottomCapBool) {
				for (var i=0; i<bottomCap.point.length; i++) {
					if (pt_in_quad(bottomCap.point[i], selWindow.corner[0], selWindow.corner[1], selWindow.corner[2], selWindow.corner[3])) {
						moduleList.push('b');
						break;
					}
				}
			}
			
			if (shiftDown) {
				for (var i=0; i<moduleList.length; i++) {
					if (moduleSelection.indexOf(moduleList[i]) == -1) {
						moduleSelection.push(moduleList[i]);
					}
				}
			} else {
				moduleSelection = [];
				for (var i=0; i<moduleList.length; i++) {
					moduleSelection.push(moduleList[i]);
				}
			}
			selBoundingBox();
		}
	}
}

var selBox = {'bool': false, 'point':[], 'cO':{'x':0, 'y':0}, 'cR':0};
var selBoxOffset = 20;

function selBoundingBox() {
	if (moduleSelection.length > 0) {
		selBox.bool = true;
	} else {
		selBox.bool = false;
	}
	if (moduleSelection.length==1) {
		if (moduleSelection[0]=='t') {
			var r = dist2Pt(topCap.pos.x, topCap.pos.y, topCap.point[0].x, topCap.point[0].y);
			selBox.point = [];
			selBox.point.push({'x':topCap.pos.x-r-selBoxOffset*scale2D, 'y':topCap.pos.y-r-selBoxOffset*scale2D});
			selBox.point.push({'x':topCap.pos.x+r+selBoxOffset*scale2D, 'y':topCap.pos.y-r-selBoxOffset*scale2D});
			selBox.point.push({'x':topCap.pos.x+r+selBoxOffset*scale2D, 'y':topCap.pos.y+r+selBoxOffset*scale2D});
			selBox.point.push({'x':topCap.pos.x-r-selBoxOffset*scale2D, 'y':topCap.pos.y+r+selBoxOffset*scale2D});
			for (var i=0; i<selBox.point.length; i++) {
				selBox.point[i] = rotateAboutAxis(selBox.point[i], topCap.pos, zAxis, topCap.rot);
			}
		} else if (moduleSelection[0]=='b') {
			var r = dist2Pt(bottomCap.pos.x, bottomCap.pos.y, bottomCap.point[0].x, bottomCap.point[0].y);
			selBox.point = [];
			selBox.point.push({'x':bottomCap.pos.x-r-selBoxOffset*scale2D, 'y':bottomCap.pos.y-r-selBoxOffset*scale2D});
			selBox.point.push({'x':bottomCap.pos.x+r+selBoxOffset*scale2D, 'y':bottomCap.pos.y-r-selBoxOffset*scale2D});
			selBox.point.push({'x':bottomCap.pos.x+r+selBoxOffset*scale2D, 'y':bottomCap.pos.y+r+selBoxOffset*scale2D});
			selBox.point.push({'x':bottomCap.pos.x-r-selBoxOffset*scale2D, 'y':bottomCap.pos.y+r+selBoxOffset*scale2D});
			for (var i=0; i<selBox.point.length; i++) {
				selBox.point[i] = rotateAboutAxis(selBox.point[i], bottomCap.pos, zAxis, bottomCap.rot);
			}
		} else {
			var fM = $.extend(true,{},flatModule[moduleSelection[0]]);
			var wh = calSizeDir(fM.pos, rotateAboutAxis(yAxis, origin, zAxis, fM.rot), fM.point);
			selBox.point = [];
			selBox.point.push({'x':wh.center.x-wh.w/2-selBoxOffset*scale2D, 'y':wh.center.y-wh.h/2-selBoxOffset*scale2D});
			selBox.point.push({'x':wh.center.x+wh.w/2+selBoxOffset*scale2D, 'y':wh.center.y-wh.h/2-selBoxOffset*scale2D});
			selBox.point.push({'x':wh.center.x+wh.w/2+selBoxOffset*scale2D, 'y':wh.center.y+wh.h/2+selBoxOffset*scale2D});
			selBox.point.push({'x':wh.center.x-wh.w/2-selBoxOffset*scale2D, 'y':wh.center.y+wh.h/2+selBoxOffset*scale2D});
			for (var i=0; i<selBox.point.length; i++) {
				selBox.point[i] = rotateAboutAxis(selBox.point[i], wh.center, zAxis, fM.rot);
			}
		}
	} else if (moduleSelection.length > 1) {
		var ptList = [];
		for (var i=0; i<moduleSelection.length; i++) {
			if (moduleSelection[i]=='t') {
				for (var j=0; j<topCap.point.length; j++) {
					ptList.push(topCap.point[j]);
				}
			} else if (moduleSelection[i]=='b') {
				for (var j=0; j<bottomCap.point.length; j++) {
					ptList.push(bottomCap.point[j]);
				}
			} else {
				var fM = flatModule[moduleSelection[i]];
				for (var j=0; j<fM.point.length; j++) {
					ptList.push(fM.point[j]);
				}
			}
		}
		var xMin, xMax;
		var yMin, yMax;
		ptList.sort(function(a, b){
			return a.x - b.x;
		});
		xMin = ptList[0].x;
		xMax = ptList[ptList.length-1].x;
		ptList.sort(function(a, b){
			return a.y - b.y;
		});
		yMin = ptList[0].y;
		yMax = ptList[ptList.length-1].y;
		selBox.point = [];
		selBox.point.push({'x':xMin-selBoxOffset*scale2D, 'y':yMin-selBoxOffset*scale2D});
		selBox.point.push({'x':xMax+selBoxOffset*scale2D, 'y':yMin-selBoxOffset*scale2D});
		selBox.point.push({'x':xMax+selBoxOffset*scale2D, 'y':yMax+selBoxOffset*scale2D});
		selBox.point.push({'x':xMin-selBoxOffset*scale2D, 'y':yMax+selBoxOffset*scale2D});
	}
}

function drawSelBox(appearance, appearanceC, appearanceCR) {
	if (selBox.bool) {
		drawPolyline(selBox.point, appearance, true);
		for (var i=0; i<selBox.point.length; i++) {
			drawCircle(selBox.point[i].x, selBox.point[i].y, appearanceC);
		}
		var dir = unitVector(vecSub(selBox.point[0], selBox.point[1]));
		var mid = vecAdd([selBox.point[1], scalarMult(vecSub(selBox.point[1], selBox.point[2]), 1/2)]);
		var cirO = vecAdd([mid, scalarMult(dir, appearanceCR.r*2)]);
		var hookEnd = vecAdd([cirO, scalarMult(yAxis, appearanceCR.r*0.5), scalarMult(xAxis, 2), scalarMult(yAxis, -3)]);
		selBox.cO = cirO;
		selBox.cR = appearanceCR.r;
		wctx.strokeStyle = appearanceCR.stroke;
		wctx.fillStyle = appearanceCR.fill;
		wctx.beginPath();
		if (checkMouseBox()=='circle') {
			wctx.lineWidth = 2;
		} else {
			wctx.lineWidth = 1;
		}
		wctx.arc(Math.round(cirO.x), Math.round(cirO.y), appearanceCR.r, 0, 2*Math.PI);
		wctx.fill();
		wctx.stroke();
		wctx.beginPath();
		wctx.lineWidth = 2;
		wctx.arc(Math.round(cirO.x), Math.round(cirO.y), appearanceCR.r*0.5, Math.PI, 0.5*Math.PI);
		wctx.lineTo(hookEnd.x, hookEnd.y);
		wctx.stroke();
	}
}

var rotationTolerance = 30;

function checkMouseBox() {
	if (selBox.bool) {
		var d = [];
		for (var i=0; i<selBox.point.length; i++) {
			d.push(dist2Pt(canvasPoint.x, canvasPoint.y, selBox.point[i].x, selBox.point[i].y));
		}
		d.sort(function (a, b) {
			return a-b;
		});
		if (pt_in_quad(canvasPoint, selBox.point[0], selBox.point[1], selBox.point[2], selBox.point[3])) {
			return 'inside';
		} else if (d[0] < rotationTolerance) {
			return 'corner';
		} else if (dist2Pt(canvasPoint.x, canvasPoint.y, selBox.cO.x, selBox.cO.y) < selBox.cR) {
			return 'circle';
		}
	} else {
		return false;
	}
}

var moving = false;
var moveType = 'move';
function initArrangeModules() {
	var bool = false;
	if (isMouseDown) {
		if (!shiftDown && insideModule != -1 && !checkMouseBox()) {
			selModuleClick();
			moveType = 'move';
			bool = true;
		} else {
			switch(checkMouseBox()) {
				case 'inside':
					moveType = 'move';
					$('body').css('cursor', 'move');
					bool = true;
					break;
				case 'corner':
					moveType = 'rotate';
					bool = true;
					break;
			}
		}
	}
	if (bool) {
		moving = true;
	} else {
		moving = false;
	}
}

function checkArrangeCursor() {
	if (!isMouseDown) {
		switch(checkMouseBox()) {
			case 'inside':
				$('body').css('cursor', 'move');
				break;
			case 'corner':
				$('body').css('cursor', 'url("css/rotateCursor.ico") 10 9, auto');
				break;
			case 'circle':
				$('body').css('cursor', 'pointer');
				break;
			default:
				$('body').css('cursor', 'default');
				break;
		}
	}
}

function arrangeModules() {
	if (moving) {
		switch(moveType) {
		
			case 'move':
				var tV = vecSub(pcanvasPoint, canvasPoint);
				for (var i=0; i<moduleSelection.length; i++) {
					var index = moduleSelection[i];
					if (index=='t') {
						topCap.pos = vecAdd([topCap.pos, tV]);
						for (var j=0; j<topCap.point.length; j++) {
							topCap.point[j] = vecAdd([topCap.point[j], tV]);
						}
					} else if (index=='b') {
						bottomCap.pos = vecAdd([bottomCap.pos, tV]);
						for (var j=0; j<bottomCap.point.length; j++) {
							bottomCap.point[j] = vecAdd([bottomCap.point[j], tV]);
						}
					} else {
						flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
						for (var j=0; j<flatModule[index].point.length; j++) {
							flatModule[index].point[j] = vecAdd([flatModule[index].point[j], tV]);
						}
					}
				}
				for (var i=0; i<selBox.point.length; i++) {
					selBox.point[i] = vecAdd([selBox.point[i], tV]);
				}
				break;
				
			case 'rotate':
				var boxC = scalarMult(vecAdd(selBox.point), 1/4);
				var angle = angleBetween(pcanvasPoint, boxC, canvasPoint);
				for (var i=0; i<moduleSelection.length; i++) {
					var index = moduleSelection[i];
					if (index=='t') {
						topCap.pos = rotateAboutAxis(topCap.pos, boxC, zAxis, angle);
						topCap.rot = (topCap.rot+angle)%(Math.PI*2);
						for (var j=0; j<topCap.point.length; j++) {
							topCap.point[j] = rotateAboutAxis(topCap.point[j], boxC, zAxis, angle);
						}
					} else if (index=='b') {
						bottomCap.pos = rotateAboutAxis(bottomCap.pos, boxC, zAxis, angle);
						bottomCap.rot = (bottomCap.rot+angle)%(Math.PI*2);
						for (var j=0; j<bottomCap.point.length; j++) {
							bottomCap.point[j] = rotateAboutAxis(bottomCap.point[j], boxC, zAxis, angle);
						}
					} else {
						flatModule[index].pos = rotateAboutAxis(flatModule[index].pos, boxC, zAxis, angle);
						flatModule[index].rot = (flatModule[index].rot+angle)%(Math.PI*2);
						for (var j=0; j<flatModule[index].point.length; j++) {
							flatModule[index].point[j] = rotateAboutAxis(flatModule[index].point[j], boxC, zAxis, angle);
						}
					}
				}
				for (var i=0; i<selBox.point.length; i++) {
					selBox.point[i] = rotateAboutAxis(selBox.point[i], boxC, zAxis, angle);
				}
				break;
		}
		recordBool = true;
	}
}

function rotateSelOrtho() {
	if (checkMouseBox()=='circle') {
		var v1 = vecSub(selBox.point[0], selBox.point[3]);
		var angleR = angleVec(v1, yAxis);
		var angle = (angleR+Math.PI/2)%(Math.PI/2);
		angle = angle < 0 ? Math.PI/2+angle : angle;
		angle = angle==0 ? Math.PI/2 : angle;
		var boxC = scalarMult(vecAdd(selBox.point), 1/4);
		for (var i=0; i<moduleSelection.length; i++) {
			var index = moduleSelection[i];
			if (index=='t') {
				topCap.pos = rotateAboutAxis(topCap.pos, boxC, zAxis, angle);
				topCap.rot = (topCap.rot+angle)%(Math.PI*2);
				for (var j=0; j<topCap.point.length; j++) {
					topCap.point[j] = rotateAboutAxis(topCap.point[j], boxC, zAxis, angle);
				}
			} else if (index=='b') {
				bottomCap.pos = rotateAboutAxis(bottomCap.pos, boxC, zAxis, angle);
				bottomCap.rot = (bottomCap.rot+angle)%(Math.PI*2);
				for (var j=0; j<bottomCap.point.length; j++) {
					bottomCap.point[j] = rotateAboutAxis(bottomCap.point[j], boxC, zAxis, angle);
				}
			} else {
				flatModule[index].pos = rotateAboutAxis(flatModule[index].pos, boxC, zAxis, angle);
				flatModule[index].rot = (flatModule[index].rot+angle)%(Math.PI*2);
				for (var j=0; j<flatModule[index].point.length; j++) {
					flatModule[index].point[j] = rotateAboutAxis(flatModule[index].point[j], boxC, zAxis, angle);
				}
			}
		}
		for (var i=0; i<selBox.point.length; i++) {
			selBox.point[i] = rotateAboutAxis(selBox.point[i], boxC, zAxis, angle);
		}
		recordBool = true;
	}
}

var nudgeMag = 5;

function moveModule(vec) {
	for (var i=0; i<moduleSelection.length; i++) {
		var index = moduleSelection[i];
		var tV = vec;
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

//alignment

function calAlignPos() {
	var pos = [];
	for (var i=0; i<moduleSelection.length; i++) {
		var mod = [];
		if (moduleSelection[i]=='t') {
			for (j in topCap.point) {
				mod.push(topCap.point[j]);
			}
		} else if (moduleSelection[i]=='b') {
			for (j in bottomCap.point) {
				mod.push(bottomCap.point[j]);
			}
		} else {
			for (j in flatModule[moduleSelection[i]].point) {
				mod.push(flatModule[moduleSelection[i]].point[j]);
			}
		}
		mod.sort(function(a, b){
			return a.x - b.x;
		});
		var minX = mod[0].x;
		var maxX = mod[mod.length-1].x;
		mod.sort(function(a, b){
			return a.y - b.y;
		});
		var minY = mod[0].y;
		var maxY = mod[mod.length-1].y;
		pos.push({'minX':minX, 'maxX':maxX, 'midX':(minX+maxX)/2, 'minY':minY, 'maxY':maxY, 'midY':(minY+maxY)/2, 'i':i});
	}
	return pos;
}

function alignTop() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return a.minY - b.minY;
	});
	var topPos = pos[0].minY;
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var tV = scalarMult(yAxis, -(pos[i].minY-topPos));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

function alignLeft() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return a.minX - b.minX;
	});
	var leftPos = pos[0].minX;
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var tV = scalarMult(xAxis, -(pos[i].minX-leftPos));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

function alignHoriCenter() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return a.minY - b.minY;
	});
	var topPos = pos[0].minY;
	pos.sort(function(a, b) {
		return b.maxY - a.maxY;
	});
	var bottomPos = pos[0].maxY;
	var centerPos = (topPos+bottomPos)/2;
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var tV = scalarMult(yAxis, -(pos[i].midY-centerPos));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

function alignVertCenter() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return a.minX - b.minX;
	});
	var leftPos = pos[0].minX;
	pos.sort(function(a, b) {
		return b.maxX - a.maxX;
	});
	var rightPos = pos[0].maxX;
	var centerPos = (leftPos+rightPos)/2;
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var tV = scalarMult(xAxis, -(pos[i].midX-centerPos));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

function alignBottom() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return b.maxY - a.maxY;
	});
	var bottomPos = pos[0].maxY;
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var tV = scalarMult(yAxis, -(pos[i].maxY-bottomPos));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

function alignRight() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return b.maxX - a.maxX;
	});
	var rightPos = pos[0].maxX;
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var tV = scalarMult(xAxis, -(pos[i].maxX-rightPos));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

function distributeHori() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return a.midX - b.midX;
	});
	var leftPos = pos[0].midX;
	var rightPos = pos[pos.length-1].midX;
	var gap = (rightPos-leftPos)/(pos.length-1);
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var target = leftPos + i*gap;
		var tV = scalarMult(xAxis, -(pos[i].midX-target));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

function distributeVert() {
	var pos = calAlignPos();
	pos.sort(function(a, b) {
		return a.midY - b.midY;
	});
	var topPos = pos[0].midY;
	var bottomPos = pos[pos.length-1].midY;
	var gap = (bottomPos-topPos)/(pos.length-1);
	for (var i=0; i<pos.length; i++) {
		var index = moduleSelection[pos[i].i];
		var target = topPos + i*gap;
		var tV = scalarMult(yAxis, -(pos[i].midY-target));
		if (index=='t') {
			topCap.pos = vecAdd([topCap.pos, tV]);
			calCap(designModel.point);
		} else if (index=='b') {
			bottomCap.pos = vecAdd([bottomCap.pos, tV]);
			calCap(designModel.point);
		} else {
			flatModule[index].pos = vecAdd([flatModule[index].pos, tV]);
			flatModule[index].calPoint(template, segmentArray);
		}
	}
	selBoundingBox();
	recordBool = true;
}

// scale fabrication drawing

var boundingBox2D = [{'x':0, 'y':0},{'x':0, 'y':0},{'x':0, 'y':0},{'x':0, 'y':0}];
var boundingBox2DPt = -1;
var insideBoundingBox2D = false;

function calBoundingBox2D() {
	var ptList = [];
	for (var i=0; i<flatModule.length; i++) {
		for (var j=0; j<flatModule[i].point.length; j++) {
			ptList.push(flatModule[i].point[j]);
		}
	}
	if (topCapBool) {
		for (var i=0; i<topCap.point.length; i++) {
			ptList.push(topCap.point[i]);
		}
	}
	if (bottomCapBool) {
		for (var i=0; i<bottomCap.point.length; i++) {
			ptList.push(bottomCap.point[i]);
		}
	}
	ptList.sort(function(a, b) {
		return a.x - b.x;
	});
	var xMin = ptList[0].x;
	var xMax = ptList[ptList.length-1].x;
	ptList.sort(function(a, b) {
		return a.y - b.y;
	});
	var yMin = ptList[0].y;
	var yMax = ptList[ptList.length-1].y;
	
	boundingBox2D[0] = {'x':xMin-bbOffset, 'y':yMin-bbOffset};
	boundingBox2D[1] = {'x':xMax+bbOffset, 'y':yMin-bbOffset};
	boundingBox2D[2] = {'x':xMax+bbOffset, 'y':yMax+bbOffset};
	boundingBox2D[3] = {'x':xMin-bbOffset, 'y':yMax+bbOffset};
}

function drawBoundingBox2D(rectAppearance, cornerAppearance, cornerAppearanceActive) {
	drawPolyline(boundingBox2D, rectAppearance, true);
	for (var i=0; i<boundingBox2D.length; i++) {
		drawRect(boundingBox2D[i].x, boundingBox2D[i].y, cornerAppearance);
		if (boundingBox2DPt==i) {
			drawRect(boundingBox2D[i].x, boundingBox2D[i].y, cornerAppearanceActive);
		}
	}
}

function scaleFabrication() {
	if (!isMouseDown) {
		var bool = false;
		for (var i=0; i<boundingBox2D.length; i++) {
			if (dist2Pt(boundingBox2D[i].x, boundingBox2D[i].y, canvasPoint.x, canvasPoint.y) < tolerance) {
				boundingBox2DPt = i;
				$('body').css('cursor', 'default');
				bool = true;
				insideBoundingBox2D = false;
				break;
			}
		}
		if (!bool) {
			boundingBox2DPt = -1;
			if (pt_in_quad(canvasPoint, boundingBox2D[0], boundingBox2D[1], boundingBox2D[2], boundingBox2D[3])) {
				insideBoundingBox2D = true;
				$('body').css('cursor', 'move');
			} else {
				insideBoundingBox2D = false;
				$('body').css('cursor', 'default');
			}
		}
	} else {
		if (insideBoundingBox2D) {
			var tV = vecSub(pcanvasPoint, canvasPoint);
			for (var i=0; i<flatModule.length; i++) {
				flatModule[i].pos = vecAdd([flatModule[i].pos, tV]);
				for (var j=0; j<flatModule[i].point.length; j++) {
					flatModule[i].point[j] = vecAdd([flatModule[i].point[j], tV]);
				}
			}
			if (topCapBool) {
				topCap.pos = vecAdd([topCap.pos, tV]);
				for (var i=0; i<topCap.point.length; i++) {
					topCap.point[i] = vecAdd([topCap.point[i], tV]);
				}
			}
			if (bottomCapBool) {
				bottomCap.pos = vecAdd([bottomCap.pos, tV]);
				for (var i=0; i<bottomCap.point.length; i++) {
					bottomCap.point[i] = vecAdd([bottomCap.point[i], tV]);
				}
			}
		} else if (boundingBox2DPt != -1) {
			var bbCenter = scalarMult(vecAdd(boundingBox2D), 1/4);
			var sV = dist2Pt(bbCenter.x, bbCenter.y, canvasPoint.x, canvasPoint.y)/dist2Pt(bbCenter.x, bbCenter.y, pcanvasPoint.x, pcanvasPoint.y);
			for (var i=0; i<flatModule.length; i++) {
				flatModule[i].pos = scaleOrigin2D(flatModule[i].pos, bbCenter, sV, sV);
				for (var j=0; j<flatModule[i].point.length; j++) {
					flatModule[i].point[j] = scaleOrigin2D(flatModule[i].point[j], bbCenter, sV, sV);
				}
			}
			if (topCapBool) {
				topCap.pos = scaleOrigin2D(topCap.pos, bbCenter, sV, sV);
				for (var i=0; i<topCap.point.length; i++) {
					topCap.point[i] = scaleOrigin2D(topCap.point[i], bbCenter, sV, sV);
				}
			}
			if (bottomCapBool) {
				bottomCap.pos = scaleOrigin2D(bottomCap.pos, bbCenter, sV, sV);
				for (var i=0; i<bottomCap.point.length; i++) {
					bottomCap.point[i] = scaleOrigin2D(bottomCap.point[i], bbCenter, sV, sV);
				}
			}
			scale3D = scale3D/sV;
			designModel.calPoint(designModel.editPoint);
			viewModel.update(designModel);
			updateFabrication();
		}
		recordBool = true;
	}
}


// dimension 2D

var dimPoint2D = [];
var dimPoint2DSel = -1;

function drawDimPoint2D(appearanceDP, appearanceDPA, appearanceD) {
	dimPoint2D = [];
	for (var i=0; i<flatModule.length; i++) {
		for (var j=0; j<flatModule[i].point.length; j++) {
			dimPoint2D.push({'pt':flatModule[i].point[j], 'type':'fm', 'i':i, 'j':j});
		}
	}
	if (topCapBool) {
		for (var i=0; i<topCap.point.length; i++) {
			dimPoint2D.push({'pt':topCap.point[i], 'type':'tc', 'i':0, 'j':i});
		}
	}
	if (bottomCapBool) {
		for (var i=0; i<bottomCap.point.length; i++) {
			dimPoint2D.push({'pt':bottomCap.point[i], 'type':'bc', 'i':0, 'j':i});
		}
	}
	var bool = false;
	for (var i=0; i<dimPoint2D.length; i++) {
		drawCircle(dimPoint2D[i].pt.x, dimPoint2D[i].pt.y, appearanceDP);
		if (dist2Pt(canvasPoint.x, canvasPoint.y, dimPoint2D[i].pt.x, dimPoint2D[i].pt.y) < tolerance) {
			dimPoint2DSel = i;
			drawCircle(dimPoint2D[i].pt.x, dimPoint2D[i].pt.y, appearanceDPA);
			bool = true;
		}
	}
	if (!bool) {
		dimPoint2DSel = -1;
	}
	if (dim2DClickCount==1) {
		drawCircle(dimPoint2D[dim2DHolder.ptA].pt.x, dimPoint2D[dim2DHolder.ptA].pt.y, appearanceD);
		drawPolyline([dimPoint2D[dim2DHolder.ptA].pt, canvasPoint], appearanceD);
	}
}

var dim2D = [];
var dim2DClickCount = 0;
var dim2DHolder = {'ptA':-1, 'ptB':-1};

function initDim2D() {
	dim2DClickCount = 0;
	dim2DHolder = {'ptA':-1, 'ptB':-1};
}

function dim2DClick() {
	if (dimPoint2DSel != -1) {
		if (dim2DClickCount==0) {
			dim2DHolder.ptA = dimPoint2DSel;
			dim2DClickCount++;
		} else if (dim2DClickCount==1) {
			dim2DHolder.ptB = dimPoint2DSel;
			dim2D.push({'ptA':dimPoint2D[dim2DHolder.ptA], 'ptB':dimPoint2D[dim2DHolder.ptB]});
			dim2DClickCount = 0;
			recordBool = true;
		}
	} else if (dim2DClickCount==1 && dimPoint2DSel == -1) {
		dim2DClickCount = 0;
		dim2DHolder = {'ptA':-1, 'ptB':-1};
	} else if (dim2DClickCount==0 && dim2DDelete != -1) {
		dim2D.splice(dim2DDelete, 1);
		recordBool = true;
	}
}

var dim2DDelete = -1;

function drawDim2D(appearanceD) {
	var bool = false;
	for (var i=0; i<dim2D.length; i++) {
		var ptA;
		switch (dim2D[i].ptA.type) {
			case 'fm':
				ptA = flatModule[dim2D[i].ptA.i].point[dim2D[i].ptA.j];
				break;
			case 'tc':
				ptA = topCap.point[dim2D[i].ptA.j];
				break;
			case 'bc':
				ptA = bottomCap.point[dim2D[i].ptA.j];
				break;
		}
		var ptB;
		switch (dim2D[i].ptB.type) {
			case 'fm':
				ptB = flatModule[dim2D[i].ptB.i].point[dim2D[i].ptB.j];
				break;
			case 'tc':
				ptB = topCap.point[dim2D[i].ptB.j];
				break;
			case 'bc':
				ptB = bottomCap.point[dim2D[i].ptB.j];
				break;
		}
		var CP = lineCP(ptA, canvasPoint, ptB);
		var d = dist2Pt(ptA.x, ptA.y, ptB.x, ptB.y) / scale2D;
		var dString = units=='mm' ? (d).toFixed(2) : (d/mmToInch).toFixed(2);
		var dirPerp = rotateAboutAxis(unitVector(vecSub(ptA, ptB)), origin, zAxis, Math.PI/2);
		var drawDim = true;
		if ((dim2D[i].ptA.type=='tc' || dim2D[i].ptB.type=='tc') && !topCapBool) {
			drawDim = false;
		}
		if ((dim2D[i].ptA.type=='bc' || dim2D[i].ptB.type=='bc') && !bottomCapBool) {
			drawDim = false;
		}
		if (drawDim) {
			drawPolyline([ptA, ptB], appearanceD, false);
			drawPolyline([vecAdd([ptA, scalarMult(dirPerp, appearanceD.r)]), vecAdd([ptA, scalarMult(dirPerp, -appearanceD.r)])], appearanceD, false);
			drawPolyline([vecAdd([ptB, scalarMult(dirPerp, appearanceD.r)]), vecAdd([ptB, scalarMult(dirPerp, -appearanceD.r)])], appearanceD, false);		
			wctx.lineWidth = 3.0;
			wctx.textAlign = 'center';
			wctx.textBaseline = 'middle';
			wctx.font = 'normal 12px sans-serif';
			wctx.fillStyle = appearanceD.fill;
			wctx.strokeStyle = appearanceD.strokeT;
			wctx.lineWidth = appearanceD.strokeWT;
			wctx.strokeText(dString, (ptA.x+ptB.x)/2, (ptA.y+ptB.y)/2);
			wctx.fillText(dString, (ptA.x+ptB.x)/2, (ptA.y+ptB.y)/2);
		}
		
		if (drawDim && mode=='dim2D' && dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y) < tolerance && CP.t > 0.1 && CP.t < 0.9) {
			drawPolyline([vecAdd([canvasPoint, scalarMult(xAxis, -10), scalarMult(yAxis, 10)]), vecAdd([canvasPoint, scalarMult(xAxis, 10), scalarMult(yAxis, -10)])], appearanceD, false);
			drawPolyline([vecAdd([canvasPoint, scalarMult(xAxis, -10), scalarMult(yAxis, -10)]), vecAdd([canvasPoint, scalarMult(xAxis, 10), scalarMult(yAxis, 10)])], appearanceD, false);
			dim2DDelete = i;
			bool = true;
		}
	}
	if (!bool) {
		dim2DDelete = -1;
	}
}











