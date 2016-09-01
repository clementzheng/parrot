var designModel;

var DesignModel = function(pointList, topCenterPt) {
	this.editPoint = [];
	for (var i=0; i<pointList.length; i++) {
		this.editPoint.push(pointList[i]);
	}
	this.topCenter = {'x': topCenterPt.x, 'y': topCenterPt.y};
	this.point = [];
	this.minScaleX = 0.5;
	this.minScaleY = 0.5;
}

DesignModel.prototype.calPoint = function(ptList) {
	tempLayerCount = ptList.length;
	var sortPt = [];
	for (var i=0; i<ptList.length; i++) {
		sortPt.push(ptList[i]);
	}
	sortPt.sort(function(a, b){
		return a.y - b.y;
	});
	this.minScaleY = (parseFloat($('#workspaceCanvasDiv').css('height'))/3)/((sortPt[sortPt.length-1].y-sortPt[0].y)/scale3D);
	sortPt.sort(function(a, b){
		return a.x - b.x;
	});
	this.minScaleX = (parseFloat($('#workspaceCanvasDiv').css('width'))/8)/((sortPt[sortPt.length-1].x-this.topCenter.x)/scale3D);
	this.point = [];
	for (var i=0; i<ptList.length; i++) {
		this.point.push([]);
		var startPt = {'x':(ptList[i].x-this.topCenter.x)/scale3D, 'y':(ptList[i].y-this.topCenter.y)/scale3D, 'z':0};
		var startPtRot = rotateAboutAxis(startPt, origin, yAxis, i*(Math.PI/sideCount)+Math.PI/2+i*twist*(2*Math.PI/sideCount));
		for (var j=0; j<sideCount; j++) {
			var pt = rotateAboutAxis(startPtRot, origin, yAxis, j*(2*Math.PI/sideCount));
			this.point[i].push(pt);
		}
	}
	calBoundingBox3D();
}

function calModelSize(DM) {
	var point = [];
	for (i in DM.point) {
		for (j in DM.point[i]) {
			point.push(DM.point[i][j]);
		}
	}
	point.sort(function(a, b) {
		return a.x - b.x;
	});
	var minX = point[0].x;
	var maxX = point[point.length-1].x;
	
	point.sort(function(a, b) {
		return a.y - b.y;
	});
	var minY = point[0].y;
	var maxY = point[point.length-1].y;
	
	point.sort(function(a, b) {
		return a.z - b.z;
	});
	var minZ = point[0].z;
	var maxZ = point[point.length-1].z;
	
	return {'minX':minX, 'maxX':maxX, 'sizeX':maxX-minX, 'minY':minY, 'maxY':maxY, 'sizeY':maxY-minY, 'minZ':minZ, 'maxZ':maxZ, 'sizeZ':maxZ-minZ};
}

DesignModel.prototype.display = function(lineAppearance, circleAppearance, centerLineAppearance, triangleAppearance, lineActiveAppearance, circleActiveAppearance, guidelineAppearance) {
	
	var pt = [];
	for (var i=0; i<layerCount; i++) {
		pt.push({'x':this.editPoint[i].x, 'y':this.editPoint[i].y})
	}
	
	pt.sort(function (a, b) {
		return a.y - b.y;
	});
	
	//draw center line
	drawPolyline([{'x': this.topCenter.x, 'y':pt[0].y-50}, {'x': this.topCenter.x, 'y':pt[pt.length-1].y+50}], centerLineAppearance, false);
	
	//draw triangles
	var triangleList = [];
	
	for (var i=0; i<tempLayerCount-1; i++) {
		for (var j=0; j<sideCount; j++) {
			var ptA = vecAdd3D([scalarMult3D(this.point[i][j], scale3D), {'x':this.topCenter.x, 'y':this.topCenter.y, 'z':0}]);
			var ptB = vecAdd3D([scalarMult3D(this.point[i][(j+1)%sideCount], scale3D), {'x':this.topCenter.x, 'y':this.topCenter.y, 'z':0}]);
			var ptC = vecAdd3D([scalarMult3D(this.point[i+1][j], scale3D), {'x':this.topCenter.x, 'y':this.topCenter.y, 'z':0}]);
			triangleList.push({'a':ptA, 'b':ptB, 'c':ptC, 'z':(this.point[i][j].z+this.point[i][(j+1)%sideCount].z+this.point[i+1][j].z)/3});
			var ptD = vecAdd3D([scalarMult3D(this.point[i+1][j], scale3D), {'x':this.topCenter.x, 'y':this.topCenter.y, 'z':0}]);
			var ptE = vecAdd3D([scalarMult3D(this.point[i+1][(j+1)%sideCount], scale3D), {'x':this.topCenter.x, 'y':this.topCenter.y, 'z':0}]);
			var ptF = vecAdd3D([scalarMult3D(this.point[i][(j+1)%sideCount], scale3D), {'x':this.topCenter.x, 'y':this.topCenter.y, 'z':0}]);
			triangleList.push({'a':ptD, 'b':ptE, 'c':ptF, 'z':(this.point[i+1][j].z+this.point[i+1][(j+1)%sideCount].z+this.point[i][(j+1)%sideCount].z)/3});
		}
	}
	
	triangleList.sort(function(a, b) {
		return a.z - b.z;
	});
	
	for (var i=0; i<triangleList.length; i++) {
		drawPolyline([triangleList[i].a, triangleList[i].b, triangleList[i].c], triangleAppearance, true);
	}
	
	//draw main line
	if (mode=='edit3D' || mode=='add3D' || mode=='subtract3D') {
		drawPolyline(this.editPoint, lineAppearance, false);
	}
	
	//draw line segment selection
	if (mode=='edit3D' && editDesignModelPt != -1 && editDesignModelPt%1 != 0) {
		drawPolyline([this.editPoint[Math.floor(editDesignModelPt)], this.editPoint[Math.ceil(editDesignModelPt)]], lineActiveAppearance, false);
	}
	
	//draw control points
	for (var i=0; i<this.editPoint.length; i++) {
		if (mode=='edit3D' || mode=='add3D' || mode=='subtract3D') {
			drawCircle(this.editPoint[i].x, this.editPoint[i].y, circleAppearance);
		}
	}
	
	//draw control points selection
	if (mode=='edit3D' && editDesignModelPt != -1) {
		if (editDesignModelPt%1 != 0) {
			drawCircle(this.editPoint[Math.floor(editDesignModelPt)].x, this.editPoint[Math.floor(editDesignModelPt)].y, circleActiveAppearance);
			drawCircle(this.editPoint[Math.ceil(editDesignModelPt)].x, this.editPoint[Math.ceil(editDesignModelPt)].y, circleActiveAppearance);
		} else {
			drawCircle(this.editPoint[editDesignModelPt].x, this.editPoint[editDesignModelPt].y, circleActiveAppearance);
		}
	}
	
	//draw guidelines
	if (mode=='edit3D' && guidelineBool) {
		for (var i=0; i<guidelineA.length; i++) {
			drawPolyline([guidelineA[i], guidelineB[i]], guidelineAppearance, false);
		}
	}
	
	//draw add point
	if (mode=='add3D') {		
		if (addDesignModelPt != -1) {
			designModel.calPoint(addPointList());
			var index = Math.floor(addDesignModelPt);
			var pt = vecAdd([scalarMult(vecSub(designModel.editPoint[index+1], designModel.editPoint[index]), addDesignModelPt%1), designModel.editPoint[index+1]]);
			drawCircle(pt.x, pt.y, circleAppearance);
			drawPolyline([vecAdd([pt, scalarMult(xAxis, -4*circleAppearance.r)]), vecAdd([pt, scalarMult(xAxis, -2*circleAppearance.r)])], lineAppearance, false);
			drawPolyline([vecAdd([pt, scalarMult(yAxis, -circleAppearance.r), scalarMult(xAxis, -3*circleAppearance.r)]), vecAdd([pt, scalarMult(yAxis, circleAppearance.r), scalarMult(xAxis, -3*circleAppearance.r)])], lineAppearance, false);
		} else {
			designModel.calPoint(designModel.editPoint);
		}
	}
	
	//draw subtract point
	if (mode=='subtract3D') {
		if (subtractDesignModelPt != -1) {
			designModel.calPoint(subtractPointList());
			var pt = designModel.editPoint[subtractDesignModelPt];
			drawPolyline([vecAdd([pt, scalarMult(vecAdd([xAxis, yAxis]), -2*circleAppearance.r)]), vecAdd([pt, scalarMult(vecAdd([xAxis, yAxis]), 2*circleAppearance.r)])], lineAppearance, false);
			drawPolyline([vecAdd([pt, scalarMult(vecAdd([scalarMult(xAxis, -1), yAxis]), -2*circleAppearance.r)]), vecAdd([pt, scalarMult(vecAdd([scalarMult(xAxis, -1), yAxis]), 2*circleAppearance.r)])], lineAppearance, false);
		} else {
			designModel.calPoint(designModel.editPoint);
		}
	}
	
	
}

function initDesignModel(initW, initH) {
	var h = 0.6*parseFloat($('#workspaceCanvas').attr('height'));
	scale3D = h/initH;
	var w = initW/2*scale3D;
	var hS = h/(layerCount-1);
	var cP = {'x':parseFloat($('#workspaceCanvas').attr('width'))/2, 'y':(parseFloat($('#workspaceCanvas').attr('height'))-h)/2};
	var ptList = [];
	for (var i=0; i<layerCount; i++) {
		var pt = {'x':cP.x+w, 'y':cP.y+i*hS};
		ptList.push(pt);
	}
	designModel = new DesignModel(ptList, cP);
	designModel.calPoint(designModel.editPoint);
}


//EDIT 3D

var editDesignModelPt = -1;
var referencePt = {'x':0, 'y':0};

function selEditPoint() {
	if (!isMouseDown) {
		editDesignModelPt = -1;
		for (var i=0; i<layerCount; i++) {
			var d = dist2Pt(designModel.editPoint[i].x, designModel.editPoint[i].y, canvasPoint.x, canvasPoint.y);
			if (d<tolerance) {
				editDesignModelPt = i;
				break;
			}
		}
		if (editDesignModelPt==-1) {
			for (var i=0; i<layerCount-1; i++) {
				var CP = lineCP(designModel.editPoint[i], canvasPoint, designModel.editPoint[i+1]);
				var d = dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y);
				if (d<tolerance && CP.t > 0.1 && CP.t < 0.9) {
					editDesignModelPt = i+CP.t;
					break;
				}
			}
		}
	}
}

var guidelineBool = false;
var guidelineA = [];
var guidelineB = [];
var guidelineExt = 40;

function moveEditPoint() {
	guidelineBool = false;
	guidelineA = [];
	guidelineB = [];
	if (isMouseDown && editDesignModelPt != -1) {
		if (editDesignModelPt%1==0) {
			var oldPt = designModel.editPoint[editDesignModelPt];
			var tV = vecSub(oldPt, canvasPoint);
			var newPt = vecAdd([oldPt, tV]);
			
			//ortho movements
			var oxCP = lineCP(referencePt, newPt, vecAdd([referencePt, xAxis]));
			var oxd = dist2Pt(oxCP.x, oxCP.y, newPt.x, newPt.y);
			if (oxd < lineSnapTol) {
				guidelineBool = true;
				newPt.x = oxCP.x;
				newPt.y = oxCP.y;
				var dir = newPt.x > referencePt.x ? xAxis : scalarMult3D(xAxis, -1);
				guidelineA.push(vecAdd([referencePt, scalarMult(dir, -guidelineExt)]));
				guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
			}
			var oyCP = lineCP(referencePt, newPt, vecAdd([referencePt, yAxis]));
			var oyd = dist2Pt(oyCP.x, oyCP.y, newPt.x, newPt.y);
			if (oyd < lineSnapTol) {
				guidelineBool = true;
				newPt.x = oyCP.x;
				newPt.y = oyCP.y;
				var dir = newPt.y > referencePt.y ? yAxis : scalarMult3D(yAxis, -1);
				guidelineA.push(vecAdd([referencePt, scalarMult(dir, -guidelineExt)]));
				guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
			}
			
			//snap to other points
			for (var i=0; i<layerCount; i++) {
				if (i != editDesignModelPt) {
					oxCP = lineCP(designModel.editPoint[i], newPt, vecAdd([designModel.editPoint[i], xAxis]));
					oxd = dist2Pt(oxCP.x, oxCP.y, newPt.x, newPt.y);
					if (oxd < lineSnapTol) {
						guidelineBool = true;
						newPt.x = oxCP.x;
						newPt.y = oxCP.y;
						var dir = newPt.x > referencePt.x ? xAxis : scalarMult3D(xAxis, -1);
						guidelineA.push(vecAdd([designModel.editPoint[i], scalarMult(dir, -guidelineExt)]));
						guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
					}
					oyCP = lineCP(designModel.editPoint[i], newPt, vecAdd([designModel.editPoint[i], yAxis]));
					oyd = dist2Pt(oyCP.x, oyCP.y, newPt.x, newPt.y);
					if (oyd < lineSnapTol) {
						guidelineBool = true;
						newPt.x = oyCP.x;
						newPt.y = oyCP.y;
						var dir = newPt.y > referencePt.y ? yAxis : scalarMult3D(yAxis, -1);
						guidelineA.push(vecAdd([designModel.editPoint[i], scalarMult(dir, -guidelineExt)]));
						guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
					}
				}
			}
			if (newPt.x > designModel.topCenter.x) {
				designModel.editPoint[editDesignModelPt] = {'x':newPt.x, 'y':newPt.y};
			}
		} else {
			var oldPt = designModel.editPoint[Math.floor(editDesignModelPt)];
			var oldPtB = designModel.editPoint[Math.ceil(editDesignModelPt)];
			var tPt = vecAdd([scalarMult(vecSub(oldPtB, oldPt), editDesignModelPt%1), oldPtB]);
			var tV = vecSub(tPt, canvasPoint);
			var newPt = vecAdd([oldPt, tV]);
			var newPtB = vecAdd([oldPtB, tV]);
			
			//ortho movements
			var oxCP = lineCP(referencePt, newPt, vecAdd([referencePt, xAxis]));
			var oxd = dist2Pt(oxCP.x, oxCP.y, newPt.x, newPt.y);
			if (oxd < lineSnapTol) {
				guidelineBool = true;
				var tVB = vecSub(newPt, oxCP);
				newPtB = vecAdd([tVB, newPtB]);
				newPt.x = oxCP.x;
				newPt.y = oxCP.y;
				var dir = newPt.x > referencePt.x ? xAxis : scalarMult3D(xAxis, -1);
				guidelineA.push(vecAdd([referencePt, scalarMult(dir, -guidelineExt)]));
				guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
			}
			var oyCP = lineCP(referencePt, newPt, vecAdd([referencePt, yAxis]));
			var oyd = dist2Pt(oyCP.x, oyCP.y, newPt.x, newPt.y);
			if (oyd < lineSnapTol) {
				guidelineBool = true;
				var tVB = vecSub(newPt, oyCP);
				newPtB = vecAdd([tVB, newPtB]);
				newPt.x = oyCP.x;
				newPt.y = oyCP.y;
				var dir = newPt.y > referencePt.y ? yAxis : scalarMult3D(yAxis, -1);
				guidelineA.push(vecAdd([referencePt, scalarMult(dir, -guidelineExt)]));
				guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
			}
			
			//snap to other points
			for (var i=0; i<layerCount; i++) {
				if (i!=Math.floor(editDesignModelPt) && i!=Math.ceil(editDesignModelPt)) {
					var oxCP = lineCP(designModel.editPoint[i], newPt, vecAdd([designModel.editPoint[i], xAxis]));
					var oxd = dist2Pt(oxCP.x, oxCP.y, newPt.x, newPt.y);
					if (oxd < lineSnapTol) {
						guidelineBool = true;
						var tVB = vecSub(newPt, oxCP);
						newPtB = vecAdd([tVB, newPtB]);
						newPt.x = oxCP.x;
						newPt.y = oxCP.y;
						var dir = newPt.x > referencePt.x ? xAxis : scalarMult3D(xAxis, -1);
						guidelineA.push(vecAdd([designModel.editPoint[i], scalarMult(dir, -guidelineExt)]));
						guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
					}
					var oyCP = lineCP(designModel.editPoint[i], newPt, vecAdd([designModel.editPoint[i], yAxis]));
					var oyd = dist2Pt(oyCP.x, oyCP.y, newPt.x, newPt.y);
					if (oyd < lineSnapTol) {
						guidelineBool = true;
						var tVB = vecSub(newPt, oyCP);
						newPtB = vecAdd([tVB, newPtB]);
						newPt.x = oyCP.x;
						newPt.y = oyCP.y;
						var dir = newPt.y > referencePt.y ? yAxis : scalarMult3D(yAxis, -1);
						guidelineA.push(vecAdd([designModel.editPoint[i], scalarMult(dir, -guidelineExt)]));
						guidelineB.push(vecAdd([newPt, scalarMult(dir, guidelineExt)]));
					}
					var oxCP = lineCP(designModel.editPoint[i], newPtB, vecAdd([designModel.editPoint[i], xAxis]));
					var oxd = dist2Pt(oxCP.x, oxCP.y, newPtB.x, newPtB.y);
					if (oxd < lineSnapTol) {
						guidelineBool = true;
						var tVB = vecSub(newPtB, oxCP);
						newPt = vecAdd([tVB, newPt]);
						newPtB.x = oxCP.x;
						newPtB.y = oxCP.y;
						var dir = newPt.x > referencePt.x ? xAxis : scalarMult3D(xAxis, -1);
						guidelineA.push(vecAdd([designModel.editPoint[i], scalarMult(dir, -guidelineExt)]));
						guidelineB.push(vecAdd([newPtB, scalarMult(dir, guidelineExt)]));
					}
					var oyCP = lineCP(designModel.editPoint[i], newPtB, vecAdd([designModel.editPoint[i], yAxis]));
					var oyd = dist2Pt(oyCP.x, oyCP.y, newPtB.x, newPtB.y);
					if (oyd < lineSnapTol) {
						guidelineBool = true;
						var tVB = vecSub(newPtB, oyCP);
						newPt = vecAdd([tVB, newPt]);
						newPtB.x = oyCP.x;
						newPtB.y = oyCP.y;
						var dir = newPt.y > referencePt.y ? yAxis : scalarMult3D(yAxis, -1);
						guidelineA.push(vecAdd([designModel.editPoint[i], scalarMult(dir, -guidelineExt)]));
						guidelineB.push(vecAdd([newPtB, scalarMult(dir, guidelineExt)]));
					}
				}
			}
			
			if (newPt.x > designModel.topCenter.x && newPtB.x > designModel.topCenter.x) {
				designModel.editPoint[Math.floor(editDesignModelPt)] = {'x':newPt.x, 'y':newPt.y};
				designModel.editPoint[Math.ceil(editDesignModelPt)] = {'x':newPtB.x, 'y':newPtB.y};			
			}
		}
		designModel.calPoint(designModel.editPoint);
		updateFabrication();
		viewModel.update(designModel);
		recordBool = true;
	}
}



//ADD 3D

var addDesignModelPt = -1;

function selAddPoint() {
	if (!isMouseDown) {
		for (var i=0; i<layerCount-1; i++) {
			var CP = lineCP(designModel.editPoint[i], canvasPoint, designModel.editPoint[i+1]);
			var d = dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y);
			if (d < tolerance && CP.t > 0.1 && CP.t < 0.9) {
				addDesignModelPt = i+CP.t;
				break;
			} else {
				addDesignModelPt = -1;
			}
		}
	}
}

function addPointList() {
	var ptList = [];
	for (var i=0; i<layerCount; i++) {
		ptList.push({'x':designModel.editPoint[i].x, 'y':designModel.editPoint[i].y});
		if (Math.floor(addDesignModelPt)==i) {
			var pt = vecAdd([scalarMult(vecSub(designModel.editPoint[i+1], designModel.editPoint[i]), addDesignModelPt%1), designModel.editPoint[i+1]]);
			ptList.push(pt);
		}
	}
	return ptList;
}

function addPoint() {
	if (addDesignModelPt != -1) {
		var i = Math.floor(addDesignModelPt);
		layerCount++;
		var pt = vecAdd([scalarMult(vecSub(designModel.editPoint[i+1], designModel.editPoint[i]), addDesignModelPt%1), designModel.editPoint[i+1]]);
		designModel.editPoint.splice(Math.floor(addDesignModelPt)+1, 0, pt);
		designModel.calPoint(designModel.editPoint);
		addPointFabrication(i+1);
		viewModel.generate(designModel);
		recordBool = true;
	}
}


//SUBTRACT 3D

var subtractDesignModelPt = -1;

function selSubtractPoint() {
	if (designModel.editPoint.length == 2) {
		subtractDesignModelPt = -1;
	}
	if (!isMouseDown && designModel.editPoint.length > 2) {
		for (var i=0; i<layerCount; i++) {
			var d = dist2Pt(designModel.editPoint[i].x, designModel.editPoint[i].y, canvasPoint.x, canvasPoint.y);
			if (d < tolerance) {
				subtractDesignModelPt = i;
				break;
			} else {
				subtractDesignModelPt = -1;
			}
		}
	}
}

function subtractPointList() {
	var ptList = [];
	for (var i=0; i<layerCount; i++) {
		if (i != subtractDesignModelPt) {
			ptList.push({'x':designModel.editPoint[i].x, 'y':designModel.editPoint[i].y});
		}
	}
	return ptList;
}

function subtractPoint() {
	if (subtractDesignModelPt != -1) {
		layerCount--;
		designModel.editPoint.splice(subtractDesignModelPt, 1);
		subtractDesignModelPt = -1;
		designModel.calPoint(designModel.editPoint);
		subtractPointFabrication(designModel.editPoint.length);
		viewModel.generate(designModel);
		recordBool = true;
	}
}


//SCALE 3D

var boundingBox3D = [{'x':0, 'y':0},{'x':0, 'y':0},{'x':0, 'y':0},{'x':0, 'y':0}];
var bbOffset = 30;
var boundingBox3DPt = -1;

function calBoundingBox3D() {
	var ptList = [];
	for (var i=0; i<layerCount; i++) {
		ptList.push({'x':designModel.editPoint[i].x, 'y':designModel.editPoint[i].y});
	}
	ptList.sort(function(a, b){
		return b.x - a.x;
	});
	var xExt = ptList[0].x - designModel.topCenter.x;
	ptList.sort(function(a, b){
		return a.y - b.y;
	});
	var yMin = ptList[0].y;
	var yMax = ptList[ptList.length-1].y;
	var xMin = designModel.topCenter.x - xExt;
	var xMax = designModel.topCenter.x + xExt;
	boundingBox3D[0] = {'x':xMin-bbOffset, 'y':yMin-bbOffset};
	boundingBox3D[1] = {'x':xMax+bbOffset, 'y':yMin-bbOffset};
	boundingBox3D[2] = {'x':xMax+bbOffset, 'y':yMax+bbOffset};
	boundingBox3D[3] = {'x':xMin-bbOffset, 'y':yMax+bbOffset};
}

function drawBoundingBox3D(rectAppearance, cornerAppearance, cornerAppearanceActive, lineAppearanceActive) {
	if (!isMouseDown) {
		boundingBox3DPt = -1;
	}
	
	drawPolyline(boundingBox3D, rectAppearance, true);
	for (var i=0; i<boundingBox3D.length; i++) {
		var CP = lineCP(boundingBox3D[i], canvasPoint, boundingBox3D[(i+1)%boundingBox3D.length]);
		var d = dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y);
		if ((d < tolerance && CP.t > 0.1 && CP.t < 0.9 && !isMouseDown) || (isMouseDown && Math.floor(boundingBox3DPt) == i && boundingBox3DPt%1 != 0)) {
			drawPolyline([boundingBox3D[i], boundingBox3D[(i+1)%boundingBox3D.length]], lineAppearanceActive, false);
			boundingBox3DPt = i+CP.t;
		}
	}
	for (var i=0; i<boundingBox3D.length; i++) {
		drawRect(boundingBox3D[i].x, boundingBox3D[i].y, cornerAppearance);
		var d = dist2Pt(boundingBox3D[i].x, boundingBox3D[i].y, canvasPoint.x, canvasPoint.y);
		if ((d < tolerance && !isMouseDown) || (isMouseDown && boundingBox3DPt == i && boundingBox3DPt%1 == 0)) {
			drawRect(boundingBox3D[i].x, boundingBox3D[i].y, cornerAppearanceActive);
			boundingBox3DPt = i;
		}
	}
}

function scaleDesignModel() {
	if (isMouseDown && boundingBox3DPt != -1) {
		var center = scalarMult(vecAdd(boundingBox3D), 1/4);
		var d1 = dist2Pt(center.x, center.y, pcanvasPoint.x, pcanvasPoint.y);
		var d2 = dist2Pt(center.x, center.y, canvasPoint.x, canvasPoint.y);
		if (d1 > 0 && d2 > 0) {
			var scaleFactor = d2/d1;
			if (boundingBox3DPt%1 != 0) {
				if (Math.floor(boundingBox3DPt)%2==0) {
					//scale y dir
					designModel.topCenter = scaleOrigin2D(designModel.topCenter, center, 1, scaleFactor);
					for (var i=0; i<layerCount; i++) {
						designModel.editPoint[i] = scaleOrigin2D(designModel.editPoint[i], center, 1, scaleFactor);
					}
				} else {
					//scale x dir
					designModel.topCenter = scaleOrigin2D(designModel.topCenter, center, scaleFactor, 1);
					for (var i=0; i<layerCount; i++) {
						designModel.editPoint[i] = scaleOrigin2D(designModel.editPoint[i], center, scaleFactor, 1);
					}
				}
			} else {
				designModel.topCenter = scaleOrigin2D(designModel.topCenter, center, scaleFactor, scaleFactor);
				for (var i=0; i<layerCount; i++) {
					designModel.editPoint[i] = scaleOrigin2D(designModel.editPoint[i], center, scaleFactor, scaleFactor);
				}
			}
		}
		
		designModel.calPoint(designModel.editPoint);
		updateFabrication();
		viewModel.update(designModel);
		recordBool = true;
	}
}



// zoom 3D

function zoomDesignModel(scaleFactor) {
	designModel.topCenter = scaleOrigin2D(designModel.topCenter, canvasPoint, scaleFactor, scaleFactor);
	for (var i=0; i<layerCount; i++) {
		designModel.editPoint[i] = scaleOrigin2D(designModel.editPoint[i], canvasPoint, scaleFactor, scaleFactor);
	}
	designModel.calPoint(designModel.editPoint);
}

// pan 3D

function panDesignModel() {
	if (isMouseDown) {
		$('body').css('cursor', '-webkit-grabbing');
		var tV = vecSub(pcanvasPoint, canvasPoint);
		designModel.topCenter = vecAdd([designModel.topCenter, tV]);
		for (var i=0; i<layerCount; i++) {
			designModel.editPoint[i] = vecAdd([designModel.editPoint[i], tV]);
		}
		designModel.calPoint(designModel.editPoint);
	}
}


// dimensions 3D

var dimPoint3D = [];
var dimPoint3DSel = -1;
function drawDimPoint3D(appearanceDP, appearanceDPA, appearanceD) {
	dimPoint3D = [];
	for (var i=0; i<designModel.editPoint.length; i++) {
		var pt = designModel.editPoint[i];
		var c = designModel.topCenter;
		dimPoint3D.push(pt);
		dimPoint3D.push({'x':c.x, 'y':pt.y});
		dimPoint3D.push({'x':c.x-(pt.x-c.x), 'y':pt.y});
	}
	var bool = false;
	for (var i=0; i<dimPoint3D.length; i++) {
		drawCircle(dimPoint3D[i].x, dimPoint3D[i].y, appearanceDP);
		if (dist2Pt(canvasPoint.x, canvasPoint.y, dimPoint3D[i].x, dimPoint3D[i].y) < tolerance) {
			dimPoint3DSel = i;
			drawCircle(dimPoint3D[i].x, dimPoint3D[i].y, appearanceDPA);
			bool = true;
		}
	}
	if (!bool) {
		dimPoint3DSel = -1;
	}
	if (dim3DClickCount==1) {
		drawCircle(dimPoint3D[dim3DHolder.ptA].x, dimPoint3D[dim3DHolder.ptA].y, appearanceD);
		drawPolyline([dimPoint3D[dim3DHolder.ptA], canvasPoint], appearanceD);
	}
}

var dim3D = [];
var dim3DClickCount = 0;
var dim3DHolder = {'ptA':-1, 'ptB':-1};

function initDim3D() {
	dim3DClickCount = 0;
	dim3DHolder = {'ptA':-1, 'ptB':-1};
}

function dim3DClick() {
	if (dimPoint3DSel != -1) {
		if (dim3DClickCount==0) {
			dim3DHolder.ptA = dimPoint3DSel;
			dim3DClickCount++;
		} else if (dim3DClickCount==1) {
			dim3DHolder.ptB = dimPoint3DSel;
			dim3D.push({'ptA':dim3DHolder.ptA, 'ptB':dim3DHolder.ptB});
			dim3DClickCount = 0;
			recordBool = true;
		}
	} else if (dim3DClickCount==1 && dimPoint3DSel == -1) {
		dim3DClickCount = 0;
		dim3DHolder = {'ptA':-1, 'ptB':-1};
	} else if (dim3DClickCount==0 && dim3DDelete != -1) {
		dim3D.splice(dim3DDelete, 1);
		recordBool = true;
	}
}

var dim3DDelete = -1;

function drawDim3D(appearanceD) {
	var bool = false;
	for (var i=0; i<dim3D.length; i++) {
		var indexA = Math.floor(dim3D[i].ptA/3);
		var offsetA = (1 - dim3D[i].ptA%3);
		var indexB = Math.floor(dim3D[i].ptB/3);
		var offsetB = (1 - dim3D[i].ptB%3);
		var c = designModel.topCenter;
		var ay = designModel.editPoint[indexA].y;
		var ax = designModel.editPoint[indexA].x - c.x;
		var by = designModel.editPoint[indexB].y;
		var bx = designModel.editPoint[indexB].x - c.x;
		var ptA = {'x':c.x+offsetA*ax, 'y':ay};
		var ptB = {'x':c.x+offsetB*bx, 'y':by};
		var CP = lineCP(ptA, canvasPoint, ptB);
		var d = dist2Pt(ptA.x, ptA.y, ptB.x, ptB.y) / scale3D;
		var dString = units=='mm' ? (d).toFixed(2) : (d/mmToInch).toFixed(2);
		var dirPerp = rotateAboutAxis(unitVector(vecSub(ptA, ptB)), origin, zAxis, Math.PI/2);
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
		
		if (mode=='dim3D' && dist2Pt(CP.x, CP.y, canvasPoint.x, canvasPoint.y) < tolerance && CP.t > 0.1 && CP.t < 0.9) {
			drawPolyline([vecAdd([canvasPoint, scalarMult(xAxis, -10), scalarMult(yAxis, 10)]), vecAdd([canvasPoint, scalarMult(xAxis, 10), scalarMult(yAxis, -10)])], appearanceD, false);
			drawPolyline([vecAdd([canvasPoint, scalarMult(xAxis, -10), scalarMult(yAxis, -10)]), vecAdd([canvasPoint, scalarMult(xAxis, 10), scalarMult(yAxis, 10)])], appearanceD, false);
			dim3DDelete = i;
			bool = true;
		}
	}
	if (!bool) {
		dim3DDelete = -1;
	}
}















