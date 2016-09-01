var jointMode = 'tabInsert';

var tabInsertParam = {
	'value': 'tabInsert',
	'name': 'Tab Insert',
	'offset': 12,
	'width': 7,
	'height': 7,
	'tolerance': 0.75,
	'thickness': 0.75
};

var interlockingParam = {
	'value': 'interlocking',
	'name': 'Interlocking',
	'width': 10,
	'height': 5,
	'tolerance': 0.75,
	'thickness': 0.75
};

var singleFlap = {
	'value': 'singleFlap',
	'name': 'Single Flap',
	'height': 10,
};

var doubleFlap = {
	'value': 'doubleFlap',
	'name': 'Double Flap',
	'height': 10,
};

var noJointParam = {
	'value': 'none',
	'name': 'None'
};

var jointList = [noJointParam, tabInsertParam, interlockingParam, singleFlap, doubleFlap];

function drawMaleJoint(pointA, pointB, appearanceCut, appearanceFold, appearanceFill) {
	var jP;
	for (i in jointList) {
		if (jointList[i].value==jointMode) {
			jP = $.extend(true,{},jointList[i]);
		}
	}
	for (i in jP) {
		jP[i] = jP[i] * scale2D;
	}
	switch(jointMode) {
		case 'tabInsert':
			var tabPos = [];
			var len = dist2Pt(pointA.x, pointA.y, pointB.x, pointB.y);
			if (len > jP.offset*2 + jP.width*2.5 + jP.tolerance*4) {
				var aS = jP.offset/len;
				var aE = aS + jP.width/len;
				var bE = 1 - jP.offset/len;
				var bS = bE - jP.width/len;
				tabPos.push({'s':aS, 'e':aE});
				tabPos.push({'s':bS, 'e':bE});
			} else if (len > jP.width*1.2 + jP.tolerance*2) {
				var w = jP.width/len;
				var aS = 0.5 - w/2;
				var aE = 0.5 + w/2;
				tabPos.push({'s':aS, 'e':aE});
			}
			if (tabPos.length==0) {
				drawPolyline([pointA, pointB], appearanceCut, false);
			} else {
				var tabPoints = [];
				var baseLine = [];
				baseLine.push(pointA);
				for (var i=0; i<tabPos.length; i++) {
					var ptA = vecAdd([pointA, scalarMult(vecSub(pointA, pointB), tabPos[i].s)]);
					var ptB = vecAdd([pointA, scalarMult(vecSub(pointA, pointB), tabPos[i].e)]);
					var dir = unitVector(vecSub(ptA, ptB));
					var dirPerp = {'x':dir.y, 'y':-dir.x};
					var ptAThick = vecAdd([ptA, scalarMult(dirPerp, jP.thickness)]);
					var ptBThick = vecAdd([ptB, scalarMult(dirPerp, jP.thickness)]);
					var ptATol = vecAdd([ptAThick, scalarMult(dir, -jP.tolerance)]);
					var ptBTol = vecAdd([ptBThick, scalarMult(dir, jP.tolerance)]);
					var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height), scalarMult(dir, jP.tolerance/2)]);
					var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height), scalarMult(dir, -jP.tolerance/2)]);
					tabPoints.push([ptA, ptAThick, ptATol, ptATip, ptBTip, ptBTol, ptBThick, ptB]);
					baseLine.push(ptA);
					baseLine.push(ptB);
				}
				baseLine.push(pointB);
				for (i in tabPoints) {
					drawTab(tabPoints[i], appearanceCut, appearanceFill, jP);
				}
				for (var i=0; i<baseLine.length-1; i++) {
					if (i%2==0) {
						drawPolyline([baseLine[i], baseLine[i+1]], appearanceCut, false);
					} else {
						drawPolyline([baseLine[i], baseLine[i+1]], appearanceFold, false);
					}
				}
			}
			break;
		case 'interlocking':
			var tabPos = [];
			var len = dist2Pt(pointA.x, pointA.y, pointB.x, pointB.y);
			var numberOfTabs = Math.floor(len/jP.width);
			numberOfTabs = numberOfTabs + numberOfTabs%2;
			if (numberOfTabs < 2) {
				drawPolyline([pointA, pointB], appearanceCut, false);
			} else {
				var gap = len/numberOfTabs;
				var dir = unitVector(vecSub(pointA, pointB));
				var dirPerp = {'x':dir.y, 'y':-dir.x};
				for (var i=0; i<numberOfTabs; i++) {
					var pt = vecAdd([pointA, scalarMult(dir, gap*i)]);
					tabPos.push(pt);
				}
				tabPos.push(pointB);
				for (var i=0; i<tabPos.length-1; i++) {
					if (i%2==0) {
						if (i==0) {
							var ptA = tabPos[i];
							var ptB = tabPos[i+1];
							var ptAThick = vecAdd([ptA, scalarMult(dirPerp, jP.thickness)]);
							var ptBThick = vecAdd([ptB, scalarMult(dirPerp, jP.thickness)]);
							var ptBTol = vecAdd([ptBThick, scalarMult(dir, jP.tolerance)]);
							var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
							var ptATipRot = rotateAboutAxis(ptATip, ptA, zAxis, Math.PI/6);
							var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
							var ptAEnd = lineIntersection(ptA, ptATipRot, ptATip, ptBTip);
							drawInterlocking([ptA, ptAEnd, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, appearanceFill, jP);
						} else {
							var ptA = tabPos[i];
							var ptB = tabPos[i+1];
							var ptAThick = vecAdd([ptA, scalarMult(dirPerp, jP.thickness)]);
							var ptBThick = vecAdd([ptB, scalarMult(dirPerp, jP.thickness)]);
							var ptATol = vecAdd([ptAThick, scalarMult(dir, -jP.tolerance)]);
							var ptBTol = vecAdd([ptBThick, scalarMult(dir, jP.tolerance)]);
							var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
							var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
							drawInterlocking([ptA, ptAThick, ptATol, ptATip, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, appearanceFill, jP);
						}
						drawPolyline([tabPos[i], tabPos[i+1]], appearanceFold, false);
					} else {
						drawPolyline([tabPos[i], tabPos[i+1]], appearanceCut, false);
					}
				}
			}
			break;
		case 'singleFlap':
			var ptA = pointA;
			var ptB = pointB;
			var len = dist2Pt(pointA.x, pointA.y, pointB.x, pointB.y);
			var dir = unitVector(vecSub(ptA, ptB));
			var dirPerp = {'x':dir.y, 'y':-dir.x};
			var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
			var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
			var ptARot = rotateAboutAxis(ptATip, ptA, zAxis, Math.PI/4);
			var ptBRot = rotateAboutAxis(ptBTip, ptB, zAxis, -Math.PI/4);
			var ptAEnd = lineIntersection(ptA, ptARot, ptATip, ptBTip);
			var ptBEnd = lineIntersection(ptB, ptBRot, ptATip, ptBTip);
			var filletB = len>jP.height ? jP.height*0.9 : len*0.3;
			var bool = lineIntersection(ptA, ptAEnd, ptB, ptBEnd);
			if (bool.onLine1 && bool.onLine2) {
				drawPolyline([pointA, pointB], appearanceCut, false);
			} else {
				drawPolylineFillet([ptA, ptAEnd, ptBEnd, ptB], [filletB, filletB], appearanceCut, appearanceFill);
				drawPolyline([pointA, pointB], appearanceFold, false);
			}
			break;
		case 'doubleFlap':
			var ptA = pointA;
			var ptB = pointB;
			var len = dist2Pt(pointA.x, pointA.y, pointB.x, pointB.y);
			var dir = unitVector(vecSub(ptA, ptB));
			var dirPerp = {'x':dir.y, 'y':-dir.x};
			var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
			var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
			var ptARot = rotateAboutAxis(ptATip, ptA, zAxis, Math.PI/4);
			var ptBRot = rotateAboutAxis(ptBTip, ptB, zAxis, -Math.PI/4);
			var ptAEnd = lineIntersection(ptA, ptARot, ptATip, ptBTip);
			var ptBEnd = lineIntersection(ptB, ptBRot, ptATip, ptBTip);
			var filletB = len>jP.height ? jP.height*0.9 : len*0.3;
			var bool = lineIntersection(ptA, ptAEnd, ptB, ptBEnd);
			if (bool.onLine1 && bool.onLine2) {
				drawPolyline([pointA, pointB], appearanceCut, false);
			} else {
				drawPolylineFillet([ptA, ptAEnd, ptBEnd, ptB], [filletB, filletB], appearanceCut, appearanceFill);
				drawPolyline([pointA, pointB], appearanceFold, false);
			}
			break;
		default:
			drawPolyline([pointA, pointB], appearanceCut, false);
			break;
	}
}

function drawFemaleJoint(pointA, pointB, appearanceCut, appearanceFold, appearanceFill) {
	var jP;
	for (i in jointList) {
		if (jointList[i].value==jointMode) {
			jP = $.extend(true,{},jointList[i]);
		}
	}
	for (i in jP) {
		jP[i] = jP[i] * scale2D;
	}
	switch(jointMode) {
		case 'tabInsert':
			var tabPos = [];
			var len = dist2Pt(pointA.x, pointA.y, pointB.x, pointB.y);
			if (len > jP.offset*2 + jP.width*2.5 + jP.tolerance*4) {
				var aS = jP.offset/len;
				var aE = aS + jP.width/len;
				var bE = 1 - jP.offset/len;
				var bS = bE - jP.width/len;
				tabPos.push({'s':aS, 'e':aE});
				tabPos.push({'s':bS, 'e':bE});
			} else if (len > jP.width*1.2 + jP.tolerance*2) {
				var w = jP.width/len;
				var aS = 0.5 - w/2;
				var aE = 0.5 + w/2;
				tabPos.push({'s':aS, 'e':aE});
			}
			if (tabPos.length==0) {
				drawPolyline([pointA, pointB], appearanceCut, false);
			} else {
				var dir = unitVector(vecSub(pointA, pointB));
				var dirPerp = {'x':-dir.y, 'y':dir.x};
				var ptAOffset = vecAdd([pointA, scalarMult(dirPerp, jP.height)]);
				var ptBOffset = vecAdd([pointB, scalarMult(dirPerp, jP.height)]);
				var maxAngle = Math.PI/6;
				var dirA = rotateAboutAxis(dirPerp, origin, zAxis, -maxAngle);
				var dirB = rotateAboutAxis(dirPerp, origin, zAxis, maxAngle);
				var ptA2 = lineIntersection(pointA, vecAdd([pointA, dirA]), ptAOffset, ptBOffset);
				var ptB2 = lineIntersection(pointB, vecAdd([pointB, dirB]), ptAOffset, ptBOffset);
				var fillet = len>jP.height ? jP.height*0.6 : len*0.6;
				drawPolylineFillet([pointB, ptB2, ptA2, pointA], [fillet, fillet], appearanceCut, appearanceFill);
				var baseLine = [];
				baseLine.push(pointA);
				for (i in tabPos) {
					var a = vecAdd([pointA, scalarMult(vecSub(pointA, pointB), tabPos[i].s)]);
					var b = vecAdd([pointA, scalarMult(vecSub(pointA, pointB), tabPos[i].e)]);
					baseLine.push(a);
					baseLine.push(b);
					var a1 = vecAdd([a, scalarMult(dirPerp, -jP.thickness/2)]);
					var a2 = vecAdd([a, scalarMult(dirPerp, jP.thickness/2)]);
					var b1 = vecAdd([b, scalarMult(dirPerp, -jP.thickness/2)]);
					var b2 = vecAdd([b, scalarMult(dirPerp, jP.thickness/2)]);
					var fillet2 = jP.thickness/2;
					drawPolylineFillet([a, a1, b1, b2, a2, a], [fillet2, fillet2, fillet2, fillet2], appearanceCut, {'fill':'rgba(0, 0, 0, 0)'});
				}
				baseLine.push(pointB);
				for (var i=0; i<baseLine.length-1; i++) {
					if (i%2==0) {
						drawPolyline([baseLine[i], baseLine[i+1]], appearanceFold, false);
					}
				}
			}
			break;
		case 'interlocking':
			var tabPos = [];
			var len = dist2Pt(pointA.x, pointA.y, pointB.x, pointB.y);
			var numberOfTabs = Math.floor(len/jP.width);
			numberOfTabs = numberOfTabs + numberOfTabs%2;
			if (numberOfTabs < 2) {
				drawPolyline([pointA, pointB], appearanceCut, false);
			} else {
				var gap = len/numberOfTabs;
				var dir = unitVector(vecSub(pointB, pointA));
				var dirPerp = {'x':dir.y, 'y':-dir.x};
				for (var i=0; i<numberOfTabs; i++) {
					var pt = vecAdd([pointB, scalarMult(dir, gap*i)]);
					tabPos.push(pt);
				}
				tabPos.push(pointA);
				for (var i=0; i<tabPos.length-1; i++) {
					if (i%2==0) {
						if (i==0) {
							var ptA = tabPos[i];
							var ptB = tabPos[i+1];
							var ptAThick = vecAdd([ptA, scalarMult(dirPerp, jP.thickness)]);
							var ptBThick = vecAdd([ptB, scalarMult(dirPerp, jP.thickness)]);
							var ptBTol = vecAdd([ptBThick, scalarMult(dir, jP.tolerance)]);
							var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
							var ptATipRot = rotateAboutAxis(ptATip, ptA, zAxis, Math.PI/6);
							var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
							var ptAEnd = lineIntersection(ptA, ptATipRot, ptATip, ptBTip);
							drawInterlocking([ptA, ptAEnd, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, appearanceFill, jP);
						} else {
							var ptA = tabPos[i];
							var ptB = tabPos[i+1];
							var ptAThick = vecAdd([ptA, scalarMult(dirPerp, jP.thickness)]);
							var ptBThick = vecAdd([ptB, scalarMult(dirPerp, jP.thickness)]);
							var ptATol = vecAdd([ptAThick, scalarMult(dir, -jP.tolerance)]);
							var ptBTol = vecAdd([ptBThick, scalarMult(dir, jP.tolerance)]);
							var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
							var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
							drawInterlocking([ptA, ptAThick, ptATol, ptATip, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, appearanceFill, jP);
						}
						drawPolyline([tabPos[i], tabPos[i+1]], appearanceFold, false);
					} else {
						drawPolyline([tabPos[i], tabPos[i+1]], appearanceCut, false);
					}
				}
			}
			break;
		case 'singleFlap':
			drawPolyline([pointA, pointB], appearanceCut, false);
			break;
		case 'doubleFlap':
			var ptA = pointB;
			var ptB = pointA;
			var len = dist2Pt(pointA.x, pointA.y, pointB.x, pointB.y);
			var dir = unitVector(vecSub(ptA, ptB));
			var dirPerp = {'x':dir.y, 'y':-dir.x};
			var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
			var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
			var ptARot = rotateAboutAxis(ptATip, ptA, zAxis, Math.PI/4);
			var ptBRot = rotateAboutAxis(ptBTip, ptB, zAxis, -Math.PI/4);
			var ptAEnd = lineIntersection(ptA, ptARot, ptATip, ptBTip);
			var ptBEnd = lineIntersection(ptB, ptBRot, ptATip, ptBTip);
			var filletB = len>jP.height ? jP.height*0.9 : len*0.3;
			var bool = lineIntersection(ptA, ptAEnd, ptB, ptBEnd);
			if (bool.onLine1 && bool.onLine2) {
				drawPolyline([pointA, pointB], appearanceCut, false);
			} else {
				drawPolylineFillet([ptA, ptAEnd, ptBEnd, ptB], [filletB, filletB], appearanceCut, appearanceFill);
				drawPolyline([pointA, pointB], appearanceFold, false);
			}
			break;
		default:
			drawPolyline([pointA, pointB], appearanceCut, false);
			break;
	}
}

function drawTab(ptList, appearanceStroke, appearanceFill, param) {
	var a1 = ptList[0];
	var a2 = ptList[1];
	var a12 = scalarMult(vecAdd([a1, a2]), 1/2);
	var arcA = calArc(a12, a1, a2);
	var b1 = ptList[7];
	var b2 = ptList[6];
	var b12 = scalarMult(vecAdd([b1, b2]), 1/2);
	var arcB = calArc(b12, b2, b1);
	wctx.fillStyle = appearanceFill.fill;
	wctx.beginPath();
	wctx.moveTo(a1.x, a1.y);
	wctx.arc(arcA.o.x, arcA.o.y, arcA.r, arcA.aS, arcA.aE, true);
	wctx.lineTo(b2.x, b2.y);
	wctx.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
	wctx.closePath();
	wctx.fill();
	wctx.strokeStyle = appearanceStroke.stroke;
	wctx.lineWidth = appearanceStroke.strokeW;
	wctx.beginPath();
	wctx.arc(arcA.o.x, arcA.o.y, arcA.r, arcA.aS, arcA.aE, true);
	wctx.stroke();
	wctx.beginPath();
	wctx.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
	wctx.stroke();
	var filletA = param.tolerance*0.6;
	var filletB = param.width>param.height ? param.height*0.3 : param.width*0.3;
	drawPolylineFillet([ptList[1], ptList[2], ptList[3], ptList[4], ptList[5], ptList[6]], [filletA, filletB, filletB, filletA], appearanceStroke, appearanceFill);
}

function drawInterlocking(ptList, appearanceStroke, appearanceFill, param) {
	if (ptList.length==6) {
		var a1 = ptList[0];
		var b1 = ptList[5];
		var b2 = ptList[4];
		var b12 = scalarMult(vecAdd([b1, b2]), 1/2);
		var arcB = calArc(b12, b2, b1);
		wctx.fillStyle = appearanceFill.fill;
		wctx.beginPath();
		wctx.moveTo(a1.x, a1.y);
		wctx.lineTo(b2.x, b2.y);
		wctx.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
		wctx.closePath();
		wctx.fill();
		wctx.strokeStyle = appearanceStroke.stroke;
		wctx.lineWidth = appearanceStroke.strokeW;
		wctx.beginPath();
		wctx.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
		wctx.stroke();
		var filletA = param.tolerance*0.6;
		var filletB = param.width>param.height ? param.height*0.7 : param.width*0.5;
		drawPolylineFillet([ptList[0], ptList[1], ptList[2], ptList[3], ptList[4]], [filletB, filletB, filletA], appearanceStroke, appearanceFill);
	} else {
		var a1 = ptList[0];
		var a2 = ptList[1];
		var a12 = scalarMult(vecAdd([a1, a2]), 1/2);
		var arcA = calArc(a12, a1, a2);
		var b1 = ptList[7];
		var b2 = ptList[6];
		var b12 = scalarMult(vecAdd([b1, b2]), 1/2);
		var arcB = calArc(b12, b2, b1);
		wctx.fillStyle = appearanceFill.fill;
		wctx.beginPath();
		wctx.moveTo(a1.x, a1.y);
		wctx.arc(arcA.o.x, arcA.o.y, arcA.r, arcA.aS, arcA.aE, true);
		wctx.lineTo(b2.x, b2.y);
		wctx.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
		wctx.closePath();
		wctx.fill();
		wctx.strokeStyle = appearanceStroke.stroke;
		wctx.lineWidth = appearanceStroke.strokeW;
		wctx.beginPath();
		wctx.arc(arcA.o.x, arcA.o.y, arcA.r, arcA.aS, arcA.aE, true);
		wctx.stroke();
		wctx.beginPath();
		wctx.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
		wctx.stroke();
		var filletA = param.tolerance*0.6;
		var filletB = param.width>param.height ? param.height*0.7 : param.width*0.5;
		drawPolylineFillet([ptList[1], ptList[2], ptList[3], ptList[4], ptList[5], ptList[6]], [filletA, filletB, filletB, filletA], appearanceStroke, appearanceFill);
	}
}

function drawPolylineFillet(ptList, filletList, appearanceStroke, appearanceFill) {
	var pt = [];
	var arc = [];
	for (var i=0; i<ptList.length; i++) {
		if (i == 0) {
			pt.push(ptList[i]);
		} else if (i>0 && i<ptList.length-1) {
			var v1 = unitVector(vecSub(ptList[i], ptList[i-1]));
			var v2 = unitVector(vecSub(ptList[i], ptList[i+1]));
			var angle1 = angleVec(v1, v2)/2;
			var l = filletList[i-1]/Math.tan(angle1);
			var start = vecAdd([ptList[i], scalarMult(v1, -l)]);
			var end = vecAdd([ptList[i], scalarMult(v2, -l)]);
			var center = lineIntersection(start, vecAdd([start, {'x':-v1.y, 'y':v1.x}]), end, vecAdd([end, {'x':v2.y, 'y':-v2.x}]));
			arc.push(calArc(center, start, end));
			pt.push(start);
		} else {
			pt.push(ptList[i]);
		}
	}
	wctx.beginPath();
	wctx.fillStyle = appearanceFill.fill;
	wctx.strokeStyle = appearanceStroke.stroke;
	wctx.lineWidth = appearanceStroke.strokeW;
	for (var i=0; i<pt.length; i++) {
		if (i == 0) {
			wctx.moveTo(pt[i].x, pt[i].y);
		} else if (i>0 && i<pt.length-1) {
			//wctx.lineTo(pt[i].x, pt[i].y);
			wctx.arc(arc[i-1].o.x, arc[i-1].o.y, arc[i-1].r, arc[i-1].aS, arc[i-1].aE);
		} else {
			wctx.lineTo(pt[i].x, pt[i].y);
		}
	}
	wctx.fill();
	wctx.stroke();
}

function calArc(center, start, end) {
	var v1 = vecSub(center, start);
	var v2 = vecSub(center, end);
	var r = dist2Pt(center.x, center.y, start.x, start.y);
	var angle = angleVec(v1, v2);
	var startAngle = angleVec(xAxis, v1);
	var endAngle = angleVec(xAxis, v2);
	return {'o':center, 'r':r, 'aS':startAngle, 'aE':endAngle};
}