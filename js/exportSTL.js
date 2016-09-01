function exportSTL() {
		
	var scene = new THREE.Scene();
	var geometry = new THREE.Geometry();
	var wallThickness = $('#wallThickness').val();
	wallThickness = units=='mm' ? wallThickness : wallThickness*mmToInch;
	var material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
	
	if (isNaN(wallThickness) || wallThickness <= 0) {
		wallThickness = 0;
	}
	
	var DMP = $.extend(true,{},designModel.point);
	
	if (wallThickness==0) {
		for (var i=0; i<layerCount; i++) {
			for (var j=0; j<sideCount; j++) {
				geometry.vertices.push(new THREE.Vector3(DMP[i][j].x, -DMP[i][j].y, DMP[i][j].z));
			}
		}
		for (var i=0; i<layerCount-1; i++) {
			for (var j=0; j<sideCount; j++) {
				var a = i*sideCount+j;
				var b = i*sideCount+(j+1)%sideCount;
				var c = (i+1)*sideCount+j;
				var d = (i+1)*sideCount+(j+1)%sideCount;
				geometry.faces.push(new THREE.Face3(a, c, b));
				geometry.faces.push(new THREE.Face3(c, d, b));
			}
		}
		if (topCapBool) {
			for (var j=0; j<sideCount-2; j++) { //top cap
				var a = 0;
				var b = j+1;
				var c = j+2;
				geometry.faces.push(new THREE.Face3(a, b, c));
			}
		}
		if (bottomCapBool) {
			for (var j=0; j<sideCount-2; j++) { //bottom cap
				var a = (layerCount-1)*sideCount + 0;
				var b = (layerCount-1)*sideCount + j+2;
				var c = (layerCount-1)*sideCount + j+1;
				geometry.faces.push(new THREE.Face3(a, b, c));
			}
		}
	} else {
		if (topCapBool && bottomCapBool) { //CLOSED
			for (var i=0; i<layerCount; i++) {
				for (var j=0; j<sideCount; j++) {
					geometry.vertices.push(new THREE.Vector3(DMP[i][j].x, -DMP[i][j].y, DMP[i][j].z));
				}
			}
			for (var i=0; i<layerCount-1; i++) {
				for (var j=0; j<sideCount; j++) {
					var a = i*sideCount+j;
					var b = i*sideCount+(j+1)%sideCount;
					var c = (i+1)*sideCount+j;
					var d = (i+1)*sideCount+(j+1)%sideCount;
					geometry.faces.push(new THREE.Face3(a, c, b));
					geometry.faces.push(new THREE.Face3(c, d, b));
				}
			}
			for (var j=0; j<sideCount-2; j++) { //top cap
				var a = 0;
				var b = j+1;
				var c = j+2;
				geometry.faces.push(new THREE.Face3(a, b, c));
			}
			for (var j=0; j<sideCount-2; j++) { //bottom cap
				var a = (layerCount-1)*sideCount + 0;
				var b = (layerCount-1)*sideCount + j+2;
				var c = (layerCount-1)*sideCount + j+1;
				geometry.faces.push(new THREE.Face3(a, b, c));
			}
		} else if (topCapBool && !bottomCapBool) { //TOP CLOSED
			for (var i=0; i<layerCount; i++) {
				for (var j=0; j<sideCount; j++) {
					geometry.vertices.push(new THREE.Vector3(DMP[i][j].x, -DMP[i][j].y, DMP[i][j].z));
				}
			}
			for (var i=0; i<layerCount; i++) {
				for (var j=0; j<sideCount; j++) {			
					var o = DMP[i][j];
					var surPt = [];
					var nor = [];
					if (i>0 && i<layerCount-1) {
						surPt.push(DMP[i][(j+1)%sideCount]);
						surPt.push(DMP[i+1][j]);
						surPt.push(DMP[i+1][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i-1][j]);
						surPt.push(DMP[i-1][(j+1)%sideCount]);
						for (var k=0; k<surPt.length; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[(k+1)%surPt.length]));
						}
					}
					if (i==0) {
						surPt.push(DMP[i][(j+1)%sideCount]);
						surPt.push(DMP[i+1][j]);
						surPt.push(DMP[i+1][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						for (var k=0; k<surPt.length-1; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[k+1]));
						}
					}
					if (i==layerCount-1) {
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i-1][j]);
						surPt.push(DMP[i-1][(j+1)%sideCount]);
						surPt.push(DMP[i][(j+1)%sideCount]);
						for (var k=0; k<surPt.length-1; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[k+1]));
						}
					}
					var norAvg = vecNormal3D(vecAdd3D(nor));
					if (i==0) {
						norAvg = vecNormal3D(vecAdd3D([norAvg, {'x':0, 'y':-1, 'z':0}]));
					}
					var newPt = vecAdd3D([o, scalarMult3D(norAvg, wallThickness)]);
					geometry.vertices.push(new THREE.Vector3(newPt.x, -newPt.y, newPt.z));
				}
			}
			
			for (var i=0; i<layerCount-1; i++) {
				for (var j=0; j<sideCount; j++) {
					var a = i*sideCount+j;
					var b = i*sideCount+(j+1)%sideCount;
					var c = (i+1)*sideCount+j;
					var d = (i+1)*sideCount+(j+1)%sideCount;
					geometry.faces.push(new THREE.Face3(a, b, c));
					geometry.faces.push(new THREE.Face3(c, b, d));
				}
			}
			for (var i=0; i<layerCount-1; i++) {
				for (var j=0; j<sideCount; j++) {
					var a = layerCount*sideCount+i*sideCount+j;
					var b = layerCount*sideCount+i*sideCount+(j+1)%sideCount;
					var c = layerCount*sideCount+(i+1)*sideCount+j;
					var d = layerCount*sideCount+(i+1)*sideCount+(j+1)%sideCount;
					geometry.faces.push(new THREE.Face3(a, c, b));
					geometry.faces.push(new THREE.Face3(c, d, b));
				}
			}
			for (var j=0; j<sideCount; j++) {
				var a = (layerCount-1)*sideCount+j;
				var b = (layerCount-1)*sideCount+(j+1)%sideCount;
				var c = sideCount*layerCount+(layerCount-1)*sideCount+j;
				var d = sideCount*layerCount+(layerCount-1)*sideCount+(j+1)%sideCount;
				geometry.faces.push(new THREE.Face3(a, b, c));
				geometry.faces.push(new THREE.Face3(c, b, d));
			}
			for (var j=0; j<sideCount-2; j++) {
				var a = 0;
				var b = j+2;
				var c = j+1;
				geometry.faces.push(new THREE.Face3(a, b, c));
				var d = sideCount*layerCount+ 0;
				var e = sideCount*layerCount+ j+2;
				var f = sideCount*layerCount+ j+1;
				geometry.faces.push(new THREE.Face3(d, f, e));
			}
		} else if (!topCapBool && bottomCapBool) { //BOTTOM CLOSED
			for (var i=0; i<layerCount; i++) {
				for (var j=0; j<sideCount; j++) {
					geometry.vertices.push(new THREE.Vector3(DMP[i][j].x, -DMP[i][j].y, DMP[i][j].z));
				}
			}
			for (var i=0; i<layerCount; i++) {
				for (var j=0; j<sideCount; j++) {			
					var o = DMP[i][j];
					var surPt = [];
					var nor = [];
					if (i>0 && i<layerCount-1) {
						surPt.push(DMP[i][(j+1)%sideCount]);
						surPt.push(DMP[i+1][j]);
						surPt.push(DMP[i+1][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i-1][j]);
						surPt.push(DMP[i-1][(j+1)%sideCount]);
						for (var k=0; k<surPt.length; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[(k+1)%surPt.length]));
						}
					}
					if (i==0) {
						surPt.push(DMP[i][(j+1)%sideCount]);
						surPt.push(DMP[i+1][j]);
						surPt.push(DMP[i+1][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						for (var k=0; k<surPt.length-1; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[k+1]));
						}
					}
					if (i==layerCount-1) {
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i-1][j]);
						surPt.push(DMP[i-1][(j+1)%sideCount]);
						surPt.push(DMP[i][(j+1)%sideCount]);
						for (var k=0; k<surPt.length-1; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[k+1]));
						}
					}
					var norAvg = vecNormal3D(vecAdd3D(nor));
					if (i==layerCount-1) {
						norAvg = vecNormal3D(vecAdd3D([norAvg, {'x':0, 'y':1, 'z':0}]));
					}
					var newPt = vecAdd3D([o, scalarMult3D(norAvg, wallThickness)]);
					geometry.vertices.push(new THREE.Vector3(newPt.x, -newPt.y, newPt.z));
				}
			}
			for (var i=0; i<layerCount-1; i++) {
				for (var j=0; j<sideCount; j++) {
					var a = i*sideCount+j;
					var b = i*sideCount+(j+1)%sideCount;
					var c = (i+1)*sideCount+j;
					var d = (i+1)*sideCount+(j+1)%sideCount;
					geometry.faces.push(new THREE.Face3(a, b, c));
					geometry.faces.push(new THREE.Face3(c, b, d));
				}
			}
			for (var i=0; i<layerCount-1; i++) {
				for (var j=0; j<sideCount; j++) {
					var a = layerCount*sideCount+i*sideCount+j;
					var b = layerCount*sideCount+i*sideCount+(j+1)%sideCount;
					var c = layerCount*sideCount+(i+1)*sideCount+j;
					var d = layerCount*sideCount+(i+1)*sideCount+(j+1)%sideCount;
					geometry.faces.push(new THREE.Face3(a, c, b));
					geometry.faces.push(new THREE.Face3(c, d, b));
				}
			}
			for (var j=0; j<sideCount; j++) {
				var a = j;
				var b = (j+1)%sideCount;
				var c = sideCount*layerCount+j;
				var d = sideCount*layerCount+(j+1)%sideCount;
				geometry.faces.push(new THREE.Face3(a, c, b));
				geometry.faces.push(new THREE.Face3(c, d, b));
			}
			for (var j=0; j<sideCount-2; j++) { //bottom cap
				var a = (layerCount-1)*sideCount + 0;
				var b = (layerCount-1)*sideCount + j+2;
				var c = (layerCount-1)*sideCount + j+1;
				geometry.faces.push(new THREE.Face3(a, c, b));
				var d = sideCount*layerCount+(layerCount-1)*sideCount + 0;
				var e = sideCount*layerCount+(layerCount-1)*sideCount + j+2;
				var f = sideCount*layerCount+(layerCount-1)*sideCount + j+1;
				geometry.faces.push(new THREE.Face3(d, e, f));
			}
		} else { //TUBE
			for (var i=0; i<layerCount; i++) {
				for (var j=0; j<sideCount; j++) {
					geometry.vertices.push(new THREE.Vector3(DMP[i][j].x, -DMP[i][j].y, DMP[i][j].z));
				}
			}
			for (var i=0; i<layerCount; i++) {
				for (var j=0; j<sideCount; j++) {			
					var o = DMP[i][j];
					var surPt = [];
					var nor = [];
					if (i>0 && i<layerCount-1) {
						surPt.push(DMP[i][(j+1)%sideCount]);
						surPt.push(DMP[i+1][j]);
						surPt.push(DMP[i+1][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i-1][j]);
						surPt.push(DMP[i-1][(j+1)%sideCount]);
						for (var k=0; k<surPt.length; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[(k+1)%surPt.length]));
						}
					}
					if (i==0) {
						surPt.push(DMP[i][(j+1)%sideCount]);
						surPt.push(DMP[i+1][j]);
						surPt.push(DMP[i+1][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						for (var k=0; k<surPt.length-1; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[k+1]));
						}
					}
					if (i==layerCount-1) {
						surPt.push(DMP[i][(sideCount+j-1)%sideCount]);
						surPt.push(DMP[i-1][j]);
						surPt.push(DMP[i-1][(j+1)%sideCount]);
						surPt.push(DMP[i][(j+1)%sideCount]);
						for (var k=0; k<surPt.length-1; k++) {
							nor.push(norm3Pt(o, surPt[k], surPt[k+1]));
						}
					}
					var norAvg = vecNormal3D(vecAdd3D(nor));
					var newPt = vecAdd3D([o, scalarMult3D(norAvg, wallThickness)]);
					geometry.vertices.push(new THREE.Vector3(newPt.x, -newPt.y, newPt.z));
				}
			}
			for (var i=0; i<layerCount-1; i++) {
				for (var j=0; j<sideCount; j++) {
					var a = i*sideCount+j;
					var b = i*sideCount+(j+1)%sideCount;
					var c = (i+1)*sideCount+j;
					var d = (i+1)*sideCount+(j+1)%sideCount;
					geometry.faces.push(new THREE.Face3(a, b, c));
					geometry.faces.push(new THREE.Face3(c, b, d));
				}
			}
			for (var i=0; i<layerCount-1; i++) {
				for (var j=0; j<sideCount; j++) {
					var a = layerCount*sideCount+i*sideCount+j;
					var b = layerCount*sideCount+i*sideCount+(j+1)%sideCount;
					var c = layerCount*sideCount+(i+1)*sideCount+j;
					var d = layerCount*sideCount+(i+1)*sideCount+(j+1)%sideCount;
					geometry.faces.push(new THREE.Face3(a, c, b));
					geometry.faces.push(new THREE.Face3(c, d, b));
				}
			}
			for (var j=0; j<sideCount; j++) {
				var a = j;
				var b = (j+1)%sideCount;
				var c = sideCount*layerCount+j;
				var d = sideCount*layerCount+(j+1)%sideCount;
				geometry.faces.push(new THREE.Face3(a, c, b));
				geometry.faces.push(new THREE.Face3(c, d, b));
				var e = (layerCount-1)*sideCount+j;
				var f = (layerCount-1)*sideCount+(j+1)%sideCount;
				var g = sideCount*layerCount+(layerCount-1)*sideCount+j;
				var h = sideCount*layerCount+(layerCount-1)*sideCount+(j+1)%sideCount;
				geometry.faces.push(new THREE.Face3(e, f, g));
				geometry.faces.push(new THREE.Face3(g, f, h));
			}
		}
	}
	
	
	var model = new THREE.Mesh(geometry, material);
	scene.add(model);
	var d = new Date();
	var filename = $('#filename').val()+'_export_'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'_'+d.getHours()+'.'+d.getMinutes()+'.'+d.getSeconds();
	
	saveSTL(scene, filename);
	
}