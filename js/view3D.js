var viewModel;
var modelSize = 170;
var cameraDistance = 800;
var sceneDistance = 0.6;
var groundOffset = 60;
var camRX = 0.0;
var camRY = 0.0;
var shadeExt = 0.5;

var ViewModel = function() {
	this.face = [];
	this.center = {'x':0, 'y':0, 'z':0};
	this.vertex = [];
	this.camPos = {'x':0, 'y':0, 'z':cameraDistance};
	this.camX = {'x':1, 'y':0, 'z':0};
	this.camY = {'x':0, 'y':1, 'z':0};
	this.boundingR;
	this.ground = [];
}

var Face = function(vertexIndexList, i) {
	this.vI = vertexIndexList;
	this.index = i;
	this.normal = {'x':0, 'y':0, 'z':0};
	this.center = {'x':0, 'y':0, 'z':0};
	this.appearance;
}

ViewModel.prototype.generate = function(DM) {
	this.vertex = [];
	this.face = [];
	for (var i=0; i<DM.point.length; i++) {
		for (var j=0; j<DM.point[i].length; j++) {
			this.vertex.push(DM.point[i][j]);
		}
	}
	this.center = this.calCenter();
	this.resize();
	var count = 0;
	for (var i=0; i<layerCount-1; i++) {
		for (var j=0; j<sideCount; j++) {
			var indexA = i*sideCount+j;
			var indexB = i*sideCount+(j+1)%sideCount;
			var indexC = (i+1)*sideCount+j;
			var indexD = (i+1)*sideCount+(j+1)%sideCount;
			this.face.push(new Face([indexA, indexB, indexC], count));
			count++;
			this.face.push(new Face([indexC, indexB, indexD], count));
			count++;
		}
	}
	for (var i=0; i<sideCount-2; i++) {
		this.face.push(new Face([0, i+1, i+2], count));
		count++;
	}
	for (var i=0; i<sideCount-2; i++) {
		this.face.push(new Face([layerCount*sideCount-1, layerCount*sideCount-2-i, layerCount*sideCount-3-i], count));
		count++;
	}
	this.calFace();
	this.updateCam();
	sortViewModelFaces();
}

ViewModel.prototype.calBoundingSphere = function() {
	this.calCenter();
	var r = 0;
	for (var i=0; i<this.vertex.length; i++) {
		var d = dist2Pt3D(this.center, this.vertex[i]);
		r = r < d ? d : r;
	}
	this.boundingR = r;
}

ViewModel.prototype.resize = function() {
	this.calBoundingSphere();
	var f = modelSize / this.boundingR;
	for (var i=0; i<this.vertex.length; i++) {
		this.vertex[i] = scaleOrigin3D(this.vertex[i], this.center, f);
	}
	this.calBoundingSphere();
	this.calCenter();
}

ViewModel.prototype.update = function(DM) {
	var count = 0;
	for (var i=0; i<DM.point.length; i++) {
		for (var j=0; j<DM.point[i].length; j++) {
			this.vertex[count] = DM.point[i][j];
			count++;
		}
	}
	this.resize();
	this.calFace();
	this.updateCam();
	sortViewModelFaces();
}

ViewModel.prototype.calCenter = function() {
	var minX = this.vertex[0].x;
	var minY = this.vertex[0].y;
	var minZ = this.vertex[0].z;
	var maxX = this.vertex[0].x;
	var maxY = this.vertex[0].y;
	var maxZ = this.vertex[0].z;
	for(var i=0; i<this.vertex.length; i++) {
		minX = this.vertex[i].x < minX ? this.vertex[i].x : minX;
		maxX = this.vertex[i].x > maxX ? this.vertex[i].x : maxX;
		minY = this.vertex[i].y < minY ? this.vertex[i].y : minY;
		maxY = this.vertex[i].y > maxY ? this.vertex[i].y : maxY;
		minZ = this.vertex[i].z < minZ ? this.vertex[i].z : minZ;
		maxZ = this.vertex[i].z > maxZ ? this.vertex[i].z : maxZ;
	}
	this.ground = [];
	this.ground.push({'x':minX-groundOffset, 'y':maxY, 'z':minZ-groundOffset});
	this.ground.push({'x':maxX+groundOffset, 'y':maxY, 'z':minZ-groundOffset});
	this.ground.push({'x':maxX+groundOffset, 'y':maxY, 'z':maxZ+groundOffset});
	this.ground.push({'x':minX-groundOffset, 'y':maxY, 'z':maxZ+groundOffset});
	this.center = {'x':(minX+maxX)/2,'y':(minY+maxY)/2, 'z':(minZ+maxZ)/2};
}

ViewModel.prototype.calFace = function() {
	for (var i=0; i<this.face.length; i++) {
		var ptA = this.vertex[this.face[i].vI[0]];
		var ptB = this.vertex[this.face[i].vI[1]];
		var ptC = this.vertex[this.face[i].vI[2]];
		this.face[i].center = scalarMult3D(vecAdd3D([ptA, ptB, ptC]), 1/3);
		this.face[i].normal = norm3Pt(ptA, ptB, ptC);
	}
}

ViewModel.prototype.setFaceAppearance = function(facePassive, faceActive, faceCapPassive, faceCapActive, activeList) {
	for (var i=0; i<this.face.length; i++) {
		if (this.face[i].index < (layerCount-1)*sideCount*2) {
			this.face[i].appearance = facePassive;
		} else {
			if (this.face[i].index < (layerCount-1)*sideCount*2+sideCount-2) {
				if (topCapBool) {
					this.face[i].appearance = faceCapActive;
				} else {
					this.face[i].appearance = faceCapPassive;
				}
			} else {
				if (bottomCapBool) {
					this.face[i].appearance = faceCapActive;
				} else {
					this.face[i].appearance = faceCapPassive;
				}
			}
		}
		if (activeList.indexOf(this.face[i].index) > -1) {
			this.face[i].appearance = faceActive;
		}
	}
}

ViewModel.prototype.updateCam = function() {
	this.camPos = {'x':this.center.x, 'y':this.center.y, 'z':cameraDistance};
	this.camX = {'x':1, 'y':0, 'z':0};
	this.camY = {'x':0, 'y':1, 'z':0};
	this.camPos = rotateAboutAxis(this.camPos, this.center, yAxis, camRY);
	this.camX = rotateAboutAxis(this.camX, origin, yAxis, camRY);
	this.camPos = rotateAboutAxis(this.camPos, this.center, this.camX, camRX);
	this.camY = rotateAboutAxis(this.camY, origin, this.camX, camRX);
}

function initViewModel() {
	viewModel = new ViewModel();
	viewModel.generate(designModel);
	viewModel.setFaceAppearance(FP, FA, FCP, FCA, []);
}

function sortViewModelFaces() {
	viewModel.updateCam();
	var planeNormal = vecSub3D(viewModel.camPos, viewModel.center);
	var planeOrigin = vecAdd3D([scalarMult3D(planeNormal, sceneDistance), viewModel.camPos]);
	var sceneCenter = {'x':$('#view3DCanvas').innerWidth()/2, 'y':$('#view3DCanvas').innerHeight()/2};
	var translateScene = vecSub(planeOrigin, sceneCenter);
	
	
	
	viewModel.face.sort(function(a, b) {
		var aP = projectPoint(a.center, planeOrigin, planeNormal, vecAdd3D([a.center, planeNormal]));
		var bP = projectPoint(b.center, planeOrigin, planeNormal, vecAdd3D([b.center, planeNormal]));
		var ad = dist2Pt3D(aP, a.center);
		var bd = dist2Pt3D(bP, b.center);
		
		return bd - ad;
	});
	
	/* viewModel.face.sort(function (a, b) {
		var aCam = vecSub3D(a.center, viewModel.camPos);
		var ab = vecSub3D(a.center, b.center);
		var aDotCam = dotPdt3D(aCam, a.normal);
		var bDotCam = dotPdt3D(ab, a.normal);
		if (aDotCam*bDotCam < 0) {
			return 1;
		} else if (aDotCam*bDotCam == 0) {
			return 0;
		} else {
			return -1;
		}
	}); */
	
	
	/* viewModel.face.sort(function(a, b) {
		var aP = projectPoint(a.center, planeOrigin, planeNormal, vecAdd3D([a.center, planeNormal]));
		var bP = projectPoint(b.center, planeOrigin, planeNormal, vecAdd3D([b.center, planeNormal]));
		var ad = dist2Pt3D(aP, a.center);
		var bd = dist2Pt3D(bP, b.center);
				
		var aD = [];
		var bD = [];
		for (var i=0; i<3; i++) {
			var aV = projectPoint(viewModel.vertex[a.vI[i]], planeOrigin, planeNormal, vecAdd3D([viewModel.vertex[a.vI[i]], planeNormal]));
			var bV = projectPoint(viewModel.vertex[b.vI[i]], planeOrigin, planeNormal, vecAdd3D([viewModel.vertex[b.vI[i]], planeNormal]));
			aD.push({'d':dist2Pt3D(aV, viewModel.vertex[a.vI[i]]), 'i':i, 'p':aV});
			bD.push({'d':dist2Pt3D(bV, viewModel.vertex[b.vI[i]]), 'i':i, 'p':bV});
		}
		
		var distCount = 0;
		for (var i=0; i<3; i++) {
			for (var j=0; j<3; j++) {
				if (aD[i].d <= bD[i].d) {
					distCount++;
				}
			}
		}

		
		var aPb = projectPoint(a.center, b.center, b.normal, aP);

		var intersect = pt_in_triangle3D(aPb, viewModel.vertex[b.vI[0]], viewModel.vertex[b.vI[1]], viewModel.vertex[b.vI[2]]);
		
		var sharePoint = 0;
		for (var i=0; i<3; i++) {
			for (var j=0; j<3; j++) {
				var d = dist2Pt3D(viewModel.vertex[a.vI[i]], viewModel.vertex[b.vI[j]]);
				if (d==0) {
					sharePoint++;
					break;
				}
			}
		}
				
		if (distCount==9) {
			return 1;
		} else if (sharePoint>=1) {
			return aPb.t-1;
		} else {
			return bd - ad;
		}	
		
	}); */
	
	/* viewModel.face.sort(function(a, b) {
		
		var cA = [];
		var cB = [];
		
		var cAM = [];
		var cBM = [];		
		
		for (var i=0; i<3; i++) {
			var i1 = (i+1)%3;
			var i2 = (i+2)%3;
			var pA1 = vecAdd3D([viewModel.vertex[a.vI[i]], scalarMult3D(vecSub3D(viewModel.vertex[a.vI[i]], viewModel.vertex[a.vI[i1]]), 1/2)]);
			var pA2 = vecAdd3D([viewModel.vertex[a.vI[i]], scalarMult3D(vecSub3D(viewModel.vertex[a.vI[i]], viewModel.vertex[a.vI[i2]]), 1/2)]);
			var pB1 = vecAdd3D([viewModel.vertex[b.vI[i]], scalarMult3D(vecSub3D(viewModel.vertex[b.vI[i]], viewModel.vertex[b.vI[i1]]), 1/2)]);
			var pB2 = vecAdd3D([viewModel.vertex[b.vI[i]], scalarMult3D(vecSub3D(viewModel.vertex[b.vI[i]], viewModel.vertex[b.vI[i2]]), 1/2)]);
			cAM.push(pA1);
			cBM.push(pB1);
			cA.push(scalarMult3D(vecAdd3D([viewModel.vertex[a.vI[i]], pA1, pA2]), 1/3));
			cB.push(scalarMult3D(vecAdd3D([viewModel.vertex[b.vI[i]], pB1, pB2]), 1/3));
		}
		
		cA.push(scalarMult3D(vecAdd3D([cAM[0], cAM[1], cAM[2]]), 1/3));
		cB.push(scalarMult3D(vecAdd3D([cBM[0], cBM[1], cBM[2]]), 1/3));
				
		var d = [];
		for (var i=0; i<4; i++) {
			for (var j=0; j<4; j++) {
				d.push({'d':dist2Pt3D(cA[i], cB[j]), 'a':i, 'b':j});
			}
		}
		d.sort(function(a, b){
			return a.d - b.d;
		});
		
		var aP = projectPoint(cA[d[0].a], planeOrigin, planeNormal, vecAdd3D([cA[d[0].a], planeNormal]));
		var bP = projectPoint(cB[d[0].b], planeOrigin, planeNormal, vecAdd3D([cB[d[0].b], planeNormal]));
		var ad = dist2Pt3D(aP, cA[d[0].a]);
		var bd = dist2Pt3D(bP, cB[d[0].b]);
		
		return bd - ad;
	
	}); */
	
}

function displayViewModel() {	
	viewModel.setFaceAppearance(FP, FA, FCP, FCA, activeFaceList);
	viewModel.updateCam();
	var planeNormal = vecSub3D(viewModel.camPos, viewModel.center);
	var planeOrigin = vecAdd3D([scalarMult3D(planeNormal, sceneDistance), viewModel.camPos]);
	var sceneCenter = {'x':$('#view3DCanvas').innerWidth()/2, 'y':$('#view3DCanvas').innerHeight()/2};
	var translateScene = vecSub(planeOrigin, sceneCenter);
	
	drawGround(viewModel, GND, planeOrigin, planeNormal, sceneCenter);
	
	for (var i=0; i<viewModel.face.length; i++) {
		var ptA = projectPointOnScene(viewModel.vertex[viewModel.face[i].vI[0]], planeOrigin, planeNormal, viewModel.camPos, viewModel.camX, viewModel.camY);
		var ptB = projectPointOnScene(viewModel.vertex[viewModel.face[i].vI[1]], planeOrigin, planeNormal, viewModel.camPos, viewModel.camX, viewModel.camY);
		var ptC = projectPointOnScene(viewModel.vertex[viewModel.face[i].vI[2]], planeOrigin, planeNormal, viewModel.camPos, viewModel.camX, viewModel.camY);
		var angle = angleBetweenVec3D(vecSub3D(viewModel.face[i].center, viewModel.face[i].normal), vecSub3D(viewModel.face[i].center, viewModel.camPos));
		var ratio = 1-Math.abs((angle/Math.PI)-0.5)*2;
		drawFace([{'x':ptA.x+sceneCenter.x, 'y':ptA.y+sceneCenter.y}, {'x':ptB.x+sceneCenter.x, 'y':ptB.y+sceneCenter.y}, {'x':ptC.x+sceneCenter.x, 'y':ptC.y+sceneCenter.y}], viewModel.face[i].index, viewModel.face[i].appearance, 1.0-shadeExt*Math.pow(ratio, 3));
	}
}

function drawFace(ptList, index, a, sV) {
	vctx.beginPath();
	vctx.fillStyle = 'rgba('+Math.round(a.fill.r*sV)+', '+Math.round(a.fill.g*sV)+', '+Math.round(a.fill.b*sV)+', '+a.fill.a+')';
	vctx.strokeStyle = 'rgba('+a.stroke1.r+', '+a.stroke1.g+', '+a.stroke1.b+', '+a.stroke1.a+')';
	vctx.lineWidth = a.strokeW1;
	vctx.setLineDash([]);
	vctx.moveTo((ptList[0].x), (ptList[0].y));
	for (var i=0; i<ptList.length; i++) {
		vctx.lineTo((ptList[i].x), (ptList[i].y));
	}
	vctx.closePath();
	if (index < (layerCount-1)*sideCount*2) {
		vctx.stroke();
	}
	vctx.fill();
	if (index < (layerCount-1)*sideCount*2) {
		if (index%2==0) {
			vctx.beginPath();
			vctx.strokeStyle = 'rgba('+a.stroke2.r+', '+a.stroke2.g+', '+a.stroke2.b+', '+a.stroke2.a+')';
			vctx.lineWidth = a.strokeW2;
			vctx.moveTo((ptList[0].x), (ptList[0].y));
			vctx.lineTo((ptList[2].x), (ptList[2].y));
			vctx.stroke();
		}
		if (Math.floor(index/(sideCount*2))==0 && index%2==0) {
			vctx.beginPath();
			vctx.strokeStyle = 'rgba('+a.stroke2.r+', '+a.stroke2.g+', '+a.stroke2.b+', '+a.stroke2.a+')';
			vctx.lineWidth = a.strokeW2;
			vctx.moveTo((ptList[0].x), (ptList[0].y));
			vctx.lineTo((ptList[1].x), (ptList[1].y));
			vctx.stroke();
		}
		if (Math.floor(index/(sideCount*2))==(layerCount-2) && index%2==1) {
			vctx.beginPath();
			vctx.strokeStyle = 'rgba('+a.stroke2.r+', '+a.stroke2.g+', '+a.stroke2.b+', '+a.stroke2.a+')';
			vctx.lineWidth = a.strokeW2;
			vctx.moveTo((ptList[0].x), (ptList[0].y));
			vctx.lineTo((ptList[2].x), (ptList[2].y));
			vctx.stroke();
		}
	}
}

function drawGround(vM, groundAppearance, pO, pN, sC) {
	vctx.beginPath();
	vctx.fillStyle = groundAppearance.fill;
	vctx.strokeStyle = groundAppearance.stroke;
	vctx.lineWidth = groundAppearance.strokeW;
	vctx.setLineDash([]);
	var gA = projectPointOnScene(vM.ground[0], pO, pN, vM.camPos, vM.camX, vM.camY);
	var gB = projectPointOnScene(vM.ground[1], pO, pN, vM.camPos, vM.camX, vM.camY);
	var gC = projectPointOnScene(vM.ground[2], pO, pN, vM.camPos, vM.camX, vM.camY);
	var gD = projectPointOnScene(vM.ground[3], pO, pN, vM.camPos, vM.camX, vM.camY);
	vctx.moveTo(gA.x+sC.x, gA.y+sC.y);
	vctx.lineTo(gB.x+sC.x, gB.y+sC.y);
	vctx.lineTo(gC.x+sC.x, gC.y+sC.y);
	vctx.lineTo(gD.x+sC.x, gD.y+sC.y);
	vctx.closePath();
	vctx.fill();
	vctx.stroke();
}

function projectPointOnScene(pt3D, pO, pN, camPos, camX, camY) {
	var ptA = projectPoint(pt3D, pO, pN, camPos);
	var aCPX = lineCP3D(vecAdd3D([pO, camX]), ptA, pO);
	var aX = aCPX.t < 0 ? -dist2Pt3D(aCPX, pO) : dist2Pt3D(aCPX, pO);
	var aCPY = lineCP3D(vecAdd3D([pO, camY]), ptA, pO);
	var aY = aCPY.t < 0 ? -dist2Pt3D(aCPY, pO) : dist2Pt3D(aCPY, pO);
	return {'x':aX, 'y':aY};
}

var mouseSensitivity = 0.01;

function rotateCamera() {
	if (isMouseDown) {
		var dX = canvasPoint.x-pcanvasPoint.x;
		var dY = canvasPoint.y-pcanvasPoint.y;
		camRX = camRX + mouseSensitivity*dY;
		camRY = camRY + mouseSensitivity*-dX;
		sortViewModelFaces();
	}
}












