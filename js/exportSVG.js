var exportStrokeWeight = 0.001;

var CUT = 'black';
var MFOLD = 'blue';
var VFOLD = 'green';
var canvasStart = {'x':0, 'y':0};
var ctxSVG;

function exportSVG() {
	if (initialized) {
		var canvasStart = {'x':fabCanvas[0].pos.x, 'y':fabCanvas[0].pos.y};
		var svgWidth = canvasW;
		var svgHeight = fabCanvas.length*canvasH + (fabCanvas.length-1)*canvasGap;
		ctxSVG = new C2S(svgWidth, svgHeight);
		ctxSVG.lineWidth = exportStrokeWeight;
		ctxSVG.strokeStyle = 'red';
		for (var i=0; i<fabCanvas.length; i++) {
			ctxSVG.rect(0, i*(canvasH+canvasGap), canvasW, canvasH);
			ctxSVG.stroke();
		}
		
		for (var index=0; index<flatModule.length; index++) {
			var fM = $.extend(true,{},flatModule[index]);
			for (var i=0; i<fM.point.length; i++) {
				fM.point[i] = scalarMult(vecSub(canvasStart, fM.point[i]), 1/scale2D);
			}
			
			for (var i=0; i<fM.point.length; i++) {
				//top end
				if (i==0) {
					var ptA, ptB, ptA2, ptB2;
					ptA2 = fM.point[i];
					ptB2 = fM.point[i+1];
					var det = determinant(fM.point[fM.point.length-1], ptA2, ptB2);
					ptA = det<0 ? ptA2 : ptB2;
					ptB = det<0 ? ptB2 : ptA2;
					if (Math.floor(index/sideCount)>0) {
						drawFemaleJointSVG(ptA, ptB, CUT, MFOLD);
					} else {
						if (topCapBool) {
							drawMaleJointSVG(fM.point[i], fM.point[i+1], CUT, MFOLD);
						} else {
							drawPolylineSVG([fM.point[i], fM.point[i+1]], CUT);
						}
					}
				}
				//bottom end
				if (i==fM.point.length-1) {
					var ptA, ptB, ptA2, ptB2;
					ptA2 = fM.point[i];
					ptB2 = fM.point[i-1];
					var det = determinant(fM.point[0], ptA2, ptB2);
					ptA = det>0 ? ptA2 : ptB2;
					ptB = det>0 ? ptB2 : ptA2;
					if (Math.floor(index/sideCount)<segmentArray.length-1) {
						drawMaleJointSVG(ptA, ptB, CUT, MFOLD);
					} else {
						if (bottomCapBool) {
							drawMaleJointSVG(ptA, ptB, CUT, MFOLD);
						} else {
							drawPolylineSVG([fM.point[fM.point.length-2], fM.point[fM.point.length-1]], CUT);
						}
					}
				}
				//folding lines
				if (i>0 && i<fM.point.length-2) {
					var foldAppearance = folding[i-1+segmentArray[fM.segment].s] < 0 ? VFOLD : MFOLD;
					drawPolylineSVG([fM.point[i], fM.point[i+1]], foldAppearance);
				}
				
				if (i%2==0 && i<fM.point.length-2) {
					if (segmentArray[fM.segment].s%2==1) { //right side
						drawMaleJointSVG(fM.point[i], fM.point[i+2], CUT, MFOLD);
					} else { //left side
						drawFemaleJointSVG(fM.point[i], fM.point[i+2], CUT, MFOLD);
					}
				}
				
				if (i%2==1 && i<fM.point.length-2) {
					if (segmentArray[fM.segment].s%2==1) { //left side
						drawFemaleJointSVG(fM.point[i], fM.point[i+2], CUT, MFOLD);
					} else { //right side
						drawMaleJointSVG(fM.point[i], fM.point[i+2], CUT, MFOLD);
					}
				}
			}
		}
		
		if (topCapBool) {
			var tC = $.extend(true,{},topCap);
			for (var i=0; i<tC.point.length; i++) {
				tC.point[i] = scalarMult(vecSub(canvasStart, tC.point[i]), 1/scale2D);
			}
			for (var i=0; i<tC.point.length; i++) {
				drawFemaleJointSVG(tC.point[(i+1)%sideCount], tC.point[i], CUT, MFOLD);
			}
		}
		if (bottomCapBool) {
			var bC = $.extend(true,{},bottomCap);
			for (var i=0; i<bC.point.length; i++) {
				bC.point[i] = scalarMult(vecSub(canvasStart, bC.point[i]), 1/scale2D);
			}
			for (var i=0; i<bC.point.length; i++) {
				drawFemaleJointSVG(bC.point[(i+1)%sideCount], bC.point[i], CUT, MFOLD);
			}
		}
		
		
		var serializedSVG = ctxSVG.getSerializedSvg();
		var svg = ctxSVG.getSvg();
		var svgString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+svgWidth+'mm" height="'+svgHeight+'mm" viewBox="0 0 '+svgWidth+' '+svgHeight+'">'+$(svg).html()+'</svg>';
		console.log(svg);
		var blob = new Blob([svgString], {type: 'image/svg+xml'});
		var d = new Date();
		var filename = $('#filename').val();
		saveAs(blob, filename+'_export_'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'_'+d.getHours()+'.'+d.getMinutes()+'.'+d.getSeconds()+'.svg');
	}
}

function drawPolylineSVG(ptList, color, bool) {
	ctxSVG.beginPath();
	ctxSVG.strokeStyle = color;
	ctxSVG.lineWidth = exportStrokeWeight;
	ctxSVG.moveTo(ptList[0].x, ptList[0].y);
	for (var i=0; i<ptList.length; i++) {
		ctxSVG.lineTo(ptList[i].x, ptList[i].y);
	}
	if (bool) {
		ctxSVG.closePath();
	}
	ctxSVG.stroke();
}

function drawMaleJointSVG(pointA, pointB, appearanceCut, appearanceFold) {
	var jP;
	for (i in jointList) {
		if (jointList[i].value==jointMode) {
			jP = $.extend(true,{},jointList[i]);
		}
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
				drawPolylineSVG([pointA, pointB], appearanceCut, false);
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
					drawTabSVG(tabPoints[i], appearanceCut, jP);
				}
				for (var i=0; i<baseLine.length-1; i++) {
					if (i%2==0) {
						drawPolylineSVG([baseLine[i], baseLine[i+1]], appearanceCut, false);
					} else {
						drawPolylineSVG([baseLine[i], baseLine[i+1]], appearanceFold, false);
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
				drawPolylineSVG([pointA, pointB], appearanceCut, false);
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
							drawInterlockingSVG([ptA, ptAEnd, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, jP);
						} else {
							var ptA = tabPos[i];
							var ptB = tabPos[i+1];
							var ptAThick = vecAdd([ptA, scalarMult(dirPerp, jP.thickness)]);
							var ptBThick = vecAdd([ptB, scalarMult(dirPerp, jP.thickness)]);
							var ptATol = vecAdd([ptAThick, scalarMult(dir, -jP.tolerance)]);
							var ptBTol = vecAdd([ptBThick, scalarMult(dir, jP.tolerance)]);
							var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
							var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
							drawInterlockingSVG([ptA, ptAThick, ptATol, ptATip, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, jP);
						}
						drawPolylineSVG([tabPos[i], tabPos[i+1]], appearanceFold, false);
					} else {
						drawPolylineSVG([tabPos[i], tabPos[i+1]], appearanceCut, false);
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
				drawPolylineSVG([pointA, pointB], appearanceCut, false);
			} else {
				drawPolylineFilletSVG([ptA, ptAEnd, ptBEnd, ptB], [filletB, filletB], appearanceCut);
				drawPolylineSVG([pointA, pointB], appearanceFold, false);
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
				drawPolylineSVG([pointA, pointB], appearanceCut, false);
			} else {
				drawPolylineFilletSVG([ptA, ptAEnd, ptBEnd, ptB], [filletB, filletB], appearanceCut);
				drawPolylineSVG([pointA, pointB], appearanceFold, false);
			}
			break;
		default:
			drawPolylineSVG([pointA, pointB], appearanceCut, false);
			break;
	}
}

function drawFemaleJointSVG(pointA, pointB, appearanceCut, appearanceFold) {
	var jP;
	for (i in jointList) {
		if (jointList[i].value==jointMode) {
			jP = $.extend(true,{},jointList[i]);
		}
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
				drawPolylineSVG([pointA, pointB], appearanceCut, false);
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
				drawPolylineFilletSVG([pointB, ptB2, ptA2, pointA], [fillet, fillet], appearanceCut);
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
					drawPolylineFilletSVG([a, a1, b1, b2, a2, a], [fillet2, fillet2, fillet2, fillet2], appearanceCut);
				}
				baseLine.push(pointB);
				for (var i=0; i<baseLine.length-1; i++) {
					if (i%2==0) {
						drawPolylineSVG([baseLine[i], baseLine[i+1]], appearanceFold, false);
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
				drawPolylineSVG([pointA, pointB], appearanceCut, false);
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
							drawInterlockingSVG([ptA, ptAEnd, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, jP);
						} else {
							var ptA = tabPos[i];
							var ptB = tabPos[i+1];
							var ptAThick = vecAdd([ptA, scalarMult(dirPerp, jP.thickness)]);
							var ptBThick = vecAdd([ptB, scalarMult(dirPerp, jP.thickness)]);
							var ptATol = vecAdd([ptAThick, scalarMult(dir, -jP.tolerance)]);
							var ptBTol = vecAdd([ptBThick, scalarMult(dir, jP.tolerance)]);
							var ptATip = vecAdd([ptA, scalarMult(dirPerp, jP.height)]);
							var ptBTip = vecAdd([ptB, scalarMult(dirPerp, jP.height)]);
							drawInterlockingSVG([ptA, ptAThick, ptATol, ptATip, ptBTip, ptBTol, ptBThick, ptB], appearanceCut, jP);
						}
						drawPolylineSVG([tabPos[i], tabPos[i+1]], appearanceFold, false);
					} else {
						drawPolylineSVG([tabPos[i], tabPos[i+1]], appearanceCut, false);
					}
				}
			}
			break;
		case 'singleFlap':
			drawPolylineSVG([pointA, pointB], appearanceCut, false);
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
				drawPolylineSVG([pointA, pointB], appearanceCut, false);
			} else {
				drawPolylineFilletSVG([ptA, ptAEnd, ptBEnd, ptB], [filletB, filletB], appearanceCut);
				drawPolylineSVG([pointA, pointB], appearanceFold, false);
			}
			break;
		default:
			drawPolylineSVG([pointA, pointB], appearanceCut, false);
			break;
	}
}

function drawTabSVG(ptList, appearanceStroke, param) {
	var a1 = ptList[0];
	var a2 = ptList[1];
	var a12 = scalarMult(vecAdd([a1, a2]), 1/2);
	var arcA = calArc(a12, a1, a2);
	var b1 = ptList[7];
	var b2 = ptList[6];
	var b12 = scalarMult(vecAdd([b1, b2]), 1/2);
	var arcB = calArc(b12, b2, b1);
	ctxSVG.strokeStyle = appearanceStroke;
	ctxSVG.lineWidth = exportStrokeWeight;
	ctxSVG.beginPath();
	ctxSVG.arc(arcA.o.x, arcA.o.y, arcA.r, arcA.aS, arcA.aE, true);
	ctxSVG.stroke();
	ctxSVG.beginPath();
	ctxSVG.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
	ctxSVG.stroke();
	var filletA = param.tolerance*0.6;
	var filletB = param.width>param.height ? param.height*0.3 : param.width*0.3;
	drawPolylineFilletSVG([ptList[1], ptList[2], ptList[3], ptList[4], ptList[5], ptList[6]], [filletA, filletB, filletB, filletA], appearanceStroke);
}

function drawInterlockingSVG(ptList, appearanceStroke, param) {
	if (ptList.length==6) {
		var a1 = ptList[0];
		var b1 = ptList[5];
		var b2 = ptList[4];
		var b12 = scalarMult(vecAdd([b1, b2]), 1/2);
		var arcB = calArc(b12, b2, b1);
		ctxSVG.strokeStyle = appearanceStroke;
		ctxSVG.lineWidth = exportStrokeWeight;
		ctxSVG.beginPath();
		ctxSVG.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
		ctxSVG.stroke();
		var filletA = param.tolerance*0.6;
		var filletB = param.width>param.height ? param.height*0.7 : param.width*0.5;
		drawPolylineFilletSVG([ptList[0], ptList[1], ptList[2], ptList[3], ptList[4]], [filletB, filletB, filletA], appearanceStroke);
	} else {
		var a1 = ptList[0];
		var a2 = ptList[1];
		var a12 = scalarMult(vecAdd([a1, a2]), 1/2);
		var arcA = calArc(a12, a1, a2);
		var b1 = ptList[7];
		var b2 = ptList[6];
		var b12 = scalarMult(vecAdd([b1, b2]), 1/2);
		var arcB = calArc(b12, b2, b1);
		ctxSVG.strokeStyle = appearanceStroke;
		ctxSVG.lineWidth = exportStrokeWeight;
		ctxSVG.beginPath();
		ctxSVG.arc(arcA.o.x, arcA.o.y, arcA.r, arcA.aS, arcA.aE, true);
		ctxSVG.stroke();
		ctxSVG.beginPath();
		ctxSVG.arc(arcB.o.x, arcB.o.y, arcB.r, arcB.aS, arcB.aE, true);
		ctxSVG.stroke();
		var filletA = param.tolerance*0.6;
		var filletB = param.width>param.height ? param.height*0.7 : param.width*0.5;
		drawPolylineFilletSVG([ptList[1], ptList[2], ptList[3], ptList[4], ptList[5], ptList[6]], [filletA, filletB, filletB, filletA], appearanceStroke);
	}
}

function drawPolylineFilletSVG(ptList, filletList, appearanceStroke) {
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
	ctxSVG.beginPath();
	ctxSVG.strokeStyle = appearanceStroke;
	ctxSVG.lineWidth = exportStrokeWeight;
	for (var i=0; i<pt.length; i++) {
		if (i == 0) {
			ctxSVG.moveTo(pt[i].x, pt[i].y);
		} else if (i>0 && i<pt.length-1) {
			ctxSVG.arc(arc[i-1].o.x, arc[i-1].o.y, arc[i-1].r, arc[i-1].aS, arc[i-1].aE);
		} else {
			ctxSVG.lineTo(pt[i].x, pt[i].y);
		}
	}
	ctxSVG.stroke();
}