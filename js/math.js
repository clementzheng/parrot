function dist2Pt(aX, aY, bX, bY) {
	var d = Math.sqrt(Math.pow(aX-bX, 2)+Math.pow(aY-bY, 2));
	return d;
}

function dist2Pt3D(a, b) {
	var d = Math.sqrt(Math.pow(a.x-b.x, 2)+Math.pow(a.y-b.y, 2)+Math.pow(a.z-b.z, 2));
	return d;
}

function unitVector(vec) {
	var d = dist2Pt(0, 0, vec.x, vec.y);
	return {'x':vec.x/d, 'y':vec.y/d};
}

function scalarMult(vec, mag) {
	return {'x':vec.x*mag, 'y':vec.y*mag};
}

function vecAdd(vecArray) {
	var v = {'x':0, 'y':0};
	for (var i=0; i<vecArray.length; i++) {
		v = {'x':v.x+vecArray[i].x, 'y':v.y+vecArray[i].y};
	}
	return v;
}

function vecSub(vecA, vecB) { //returns AB
	return {'x':vecB.x-vecA.x, 'y':vecB.y-vecA.y};
}

function vecSub3D(vecA, vecB) { //returns AB
	return {'x':vecB.x-vecA.x, 'y':vecB.y-vecA.y, 'z':vecB.z-vecA.z};
}

function vecAdd3D(vecArray) {
	var v = {'x':0, 'y':0, 'z':0};
	for (var i=0; i<vecArray.length; i++) {
		v = {'x':v.x+vecArray[i].x, 'y':v.y+vecArray[i].y, 'z':v.z+vecArray[i].z};
	}
	return v;
}

function vecMag3D(v) {
	return Math.sqrt(Math.pow(v.x, 2)+Math.pow(v.y, 2)+Math.pow(v.z, 2));
}

function vecNormal3D(v) {
	var m = vecMag3D(v);
	return {'x':v.x/m, 'y':v.y/m, 'z':v.z/m};
}

function scalarMult3D(v, m) {
	return {'x':v.x*m, 'y':v.y*m, 'z':v.z*m};
}

function norm3Pt(a, b, c) {
	var v = vecSub3D(b, a);
	var u = vecSub3D(b, c);
	return {'x':u.y*v.z-u.z*v.y, 'y':-u.x*v.z+u.z*v.x, 'z':u.x*v.y-u.y*v.x};
}

function angleBetween(ptA, ptB, ptC) { //Angle between BA and BC
	var BA = {'x':(ptA.x-ptB.x), 'y':(ptA.y-ptB.y)};
	var BC = {'x':(ptC.x-ptB.x), 'y':(ptC.y-ptB.y)};
	var theta = Math.atan2(BA.x*BC.y-BA.y*BC.x, BA.x*BC.x+BA.y*BC.y);
	//var theta = Math.acos((BA.x*BC.x+BA.y*BC.y)/(dist2Pt(0,0,BA.x,BA.y)*dist2Pt(0,0,BC.x,BC.y)));
	//console.log(theta);
	return theta;
}

function angleVec(BA, CD) { //Angle between BA and CD
	var theta = Math.atan2(BA.x*CD.y-BA.y*CD.x, BA.x*CD.x+BA.y*CD.y);
	//var theta = Math.acos((BA.x*BC.x+BA.y*BC.y)/(dist2Pt(0,0,BA.x,BA.y)*dist2Pt(0,0,BC.x,BC.y)));
	//console.log(theta);
	return theta;
}


function rotateAboutAxis(pointToRotate, startOfAxis, axisDirNormalize, angleInput) {
  var x = pointToRotate.x;
  var y = pointToRotate.y;
  var z = pointToRotate.hasOwnProperty('z') ? pointToRotate.z : 0;
  var a = startOfAxis.x;
  var b = startOfAxis.y;
  var c = startOfAxis.hasOwnProperty('z') ? startOfAxis.z : 0;
  var u = axisDirNormalize.x;
  var v = axisDirNormalize.y;
  var w = axisDirNormalize.z;
  var t = angleInput;

  var xRotated = (a*(Math.pow(v,2)+Math.pow(w,2))-u*(b*v+c*w-u*x-v*y-w*z))*(1-Math.cos(t))+x*Math.cos(t)+(-c*v+b*w-w*y+v*z)*Math.sin(t);
  var yRotated = (b*(Math.pow(u,2)+Math.pow(w,2))-v*(a*u+c*w-u*x-v*y-w*z))*(1-Math.cos(t))+y*Math.cos(t)+(c*u-a*w+w*x-u*z)*Math.sin(t);
  var zRotated = (c*(Math.pow(u,2)+Math.pow(v,2))-w*(a*u+b*v-u*x-v*y-w*z))*(1-Math.cos(t))+z*Math.cos(t)+(-b*u+a*v-v*x+u*y)*Math.sin(t);

  var rotated = {'x':xRotated, 'y':yRotated, 'z':zRotated};
  return rotated;
}

function lineIntersection(line1Start, line1End, line2Start, line2End) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
	
    denominator = ((line2End.y - line2Start.y) * (line1End.x - line1Start.x)) - ((line2End.x - line2Start.x) * (line1End.y - line1Start.y));
    if (denominator == 0) {
        return result;
    }
	
    a = line1Start.y - line2Start.y;
    b = line1Start.x - line2Start.x;
    numerator1 = ((line2End.x - line2Start.x) * a) - ((line2End.y - line2Start.y) * b);
    numerator2 = ((line1End.x - line1Start.x) * a) - ((line1End.y - line1Start.y) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1Start.x + (a * (line1End.x - line1Start.x));
    result.y = line1Start.y + (a * (line1End.y - line1Start.y));

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

function pt_in_quad(test, a1, a2, a3, a4) {

  var is_it_in1 = false;
  var is_it_in2 = false;

  var d1 = determinant(test, a1, a2);
  var d2 = determinant(test, a2, a3);
  var d3 = determinant(test, a3, a1);

  if ((d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)) {
    is_it_in1 = true;
  }

  d1 = determinant(test, a3, a4);
  d2 = determinant(test, a4, a1);
  d3 = determinant(test, a1, a3);

  if ((d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)) {
    is_it_in2 = true;
  }

  if (is_it_in1 || is_it_in2) {
    return true;
  } else {
    return false;
  }
}

function pt_in_triangle(test, a1, a2, a3) {

  var is_it_in1 = false;

  var d1 = determinant(test, a1, a2);
  var d2 = determinant(test, a2, a3);
  var d3 = determinant(test, a3, a1);

  if ((d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)) {
    is_it_in1 = true;
  }

  if (is_it_in1) {
    return true;
  } else {
    return false;
  }
}

function pt_in_triangle3D(test, a1, a2, a3) {
	//compare parametric t of closest pt
	var t1 = lineCP3D(a3, test, a1);
	var t2 = lineCP3D(a2, test, a1);
	if (t1.t>=0 && t1.t<=1 && t2.t>=0 && t2.t<=1) {
		return true;
	} else {
		return false;
	}
}

function determinant(test, ptA, ptB) {
	var d = ((ptB.x-ptA.x)*(test.y-ptA.y)-(ptB.y-ptA.y)*(test.x-ptA.x));
	return d;
}

function dotPdt(ptA, ptB) {
	return ptA.x*ptB.x+ptA.y*ptB.y;
}

function dotPdt3D(vA, vB) {
	return vA.x*vB.x + vA.y*vB.y + vA.z*vB.z;
}

function lineCP(p2, p0, p1) {
	var p10 = {'x':p0.x-p1.x, 'y':p0.y-p1.y};
	var p12 = {'x':p2.x-p1.x, 'y':p2.y-p1.y};
	var t = dotPdt(p12, p10)/dotPdt(p12, p12);
	var CPx = p1.x + t*p12.x;
	var CPy = p1.y + t*p12.y;
	return {'x': CPx, 'y': CPy, 't': t};
}

function lineCP3D(p2, p0, p1) {
	var p10 = {'x':p0.x-p1.x, 'y':p0.y-p1.y, 'z':p0.z-p1.z};
	var p12 = {'x':p2.x-p1.x, 'y':p2.y-p1.y, 'z':p2.z-p1.z};
	var t = dotPdt3D(p12, p10)/dotPdt3D(p12, p12);
	var CPx = p1.x + t*p12.x;
	var CPy = p1.y + t*p12.y;
	var CPz = p1.z + t*p12.z;
	return {'x': CPx, 'y': CPy, 'z': CPz, 't': t};
}

function mirrorPt(ptM, ptA, ptB) {
	var CP = lineCP(ptA, ptM, ptB);
	var MCP = vecSub(ptM, CP);
	return vecAdd([CP, MCP]);
}

function scaleOrigin2D(pt, originPt, scaleFactorX, scaleFactorY) {
	var ptToOri = vecSub(originPt, pt);
	var ptToOriScaled = {'x':ptToOri.x*scaleFactorX, 'y':ptToOri.y*scaleFactorY};
	var ptReturn = vecAdd([ptToOriScaled, originPt]);
	return ptReturn;
}

function scaleOrigin3D(pt, originPt, scaleFactor) {
	var ptToOri = vecSub3D(originPt, pt);
	var ptToOriScaled = {'x':ptToOri.x*scaleFactor, 'y':ptToOri.y*scaleFactor, 'z':ptToOri.z*scaleFactor};
	var ptReturn = vecAdd3D([ptToOriScaled, originPt]);
	return ptReturn;
}

function orientPt(ptO, ptA, ptB, ptA1, ptB1) {
	var AA1 = vecSub(ptA, ptA1);
	var angle = angleVec(ptB, ptA, ptA1, ptB1);
	var ptOR = rotateAboutAxis(ptO, ptA, zAxis, angle);
	var ptORT = vecAdd([ptOR, AA1]);
	return ptORT;
}

function projectPoint(pt, planeO, planeN, rayO) {
	var l = vecSub3D(rayO, pt); //line from ray origin to pt
	var t = dotPdt3D(vecSub3D(rayO, planeO), planeN)/dotPdt3D(l, planeN);
	var p = vecAdd3D([scalarMult3D(l, t), rayO]);
	return {'x':p.x, 'y':p.y, 'z':p.z, 't':t};
}

function angleBetweenVec3D(v1, v2) {
	var theta = Math.acos(dotPdt3D(v1, v2)/(Math.pow(dotPdt3D(v1, v1), 1/2)*Math.pow(dotPdt3D(v2, v2), 1/2)));
	return theta;
}

function triangleArea3D(p1, p2, p3) {
	var v1 = vecSub3D(p1, p2);
	var v2 = vecSub3D(p1, p3);
	return 0.5*(vecMag3D(crossPdt3D(v1, v2)));
}

function crossPdt3D(u, v) {
	return {'x':u.y*v.z-u.z*v.y, 'y':u.z*v.x-u.x*v.z, 'z':u.x*v.y-u.y*v.x};
}