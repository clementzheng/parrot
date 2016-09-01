function mode2DClick() {
	if (mode2D3D=='3D') {
		$('#mode2D3D>.icon.active').toggleClass('active');
		$('#mode2D').toggleClass('active');
		mode2D3D = '2D';
		
		$('#editMenu>.icon.active').toggleClass('active');
		$('#editMenu>.icon.hidden').toggleClass('hidden');
		$('#editPoint').toggleClass('hidden');
		$('#addPoint').toggleClass('hidden');
		$('#removePoint').toggleClass('hidden');
		mode = 'arrange2D';
		$('#arrange').toggleClass('active');
		$('body').css('cursor', 'default');
		$('#ghost2D').toggleClass('hidden');
	}
}

function mode3DClick() {
	if (mode2D3D=='2D') {
		$('#mode2D3D>.icon.active').toggleClass('active');
		$('#mode3D').toggleClass('active');
		mode2D3D = '3D';
		
		$('#editMenu>.icon.active').toggleClass('active');
		$('#editMenu>.icon.hidden').toggleClass('hidden');
		$('#arrange').toggleClass('hidden');
		$('#split').toggleClass('hidden');
		$('#fuse').toggleClass('hidden');
		mode = 'edit3D';
		$('#editPoint').toggleClass('active');
		
		activeFaceList = [];
		$('body').css('cursor', 'default');
		$('#ghost2D').toggleClass('hidden');
	}
}

function editPointClick() {
	if (mode2D3D=='3D') {
		$('#editMenu>.icon.active').toggleClass('active');
		$('#editPoint').toggleClass('active');
		mode = 'edit3D';
		$('body').css('cursor', 'default');
	}
}

function addPointClick() {
	if (mode2D3D=='3D') {
		$('#editMenu>.icon.active').toggleClass('active');
		$('#addPoint').toggleClass('active');
		mode = 'add3D';
		$('body').css('cursor', 'default');
	}
}

function removePointClick() {
	if (mode2D3D=='3D') {
		$('#editMenu>.icon.active').toggleClass('active');
		$('#removePoint').toggleClass('active');
		mode = 'subtract3D';
		$('body').css('cursor', 'default');
	}
}

function arrangeClick() {
	if (mode2D3D=='2D') {
		$('#editMenu>.icon.active').toggleClass('active');
		$('#arrange').toggleClass('active');
		mode = 'arrange2D';
		$('body').css('cursor', 'default');
	}
}

function splitClick() {
	if (mode2D3D=='2D') {
		$('#editMenu>.icon.active').toggleClass('active');
		$('#split').toggleClass('active');
		mode = 'split2D';
		$('body').css('cursor', 'default');
	}
}

function fuseClick() {
	if (mode2D3D=='2D') {
		$('#editMenu>.icon.active').toggleClass('active');
		$('#fuse').toggleClass('active');
		mode = 'fuse2D';
		$('body').css('cursor', 'default');
	}
}

function measureClick() {
	$('#editMenu>.icon.active').toggleClass('active');
	$('#measure').toggleClass('active');
	mode = mode2D3D=='3D' ? 'dim3D' : 'dim2D';
	initDim3D();
	initDim2D();
	$('body').css('cursor', 'default');
}

function scaleClick() {
	$('#editMenu>.icon.active').toggleClass('active');
	$('#scale').toggleClass('active');
	mode = mode2D3D=='3D' ? 'scale3D' : 'scale2D';
	$('body').css('cursor', 'default');
}

function panClick() {
	$('#editMenu>.icon.active').toggleClass('active');
	$('#pan').toggleClass('active');
	mode = 'globalMove';
	$('body').css('cursor', '-webkit-grab');
}


function toggleGhost2D() {
	ghosted2D = !ghosted2D;
	$('#ghost2D').toggleClass('active');
}

var insideMenu = false;

function initInsideMenu() {
	$( '.icon' ).mouseenter(function() {
		insideMenu = true;
	});
	$( '.icon' ).mouseleave(function() {
		insideMenu = false;
	});
	$( '.menu' ).mouseenter(function() {
		insideMenu = true;
	});
	$( '.menu' ).mouseleave(function() {
		insideMenu = false;
	});
	$( '.item' ).mouseenter(function() {
		insideMenu = true;
	});
	$( '.item' ).mouseleave(function() {
		insideMenu = false;
	});
}

var insideView3D = false;

function initInsideView3D() {
	$( '#view3DCanvasDiv' ).mouseenter(function() {
		insideView3D = true;
	});
	$( '#view3DCanvasDiv' ).mouseleave(function() {
		insideView3D = false;
	});
}

function view3DClick() {
	$('#view3DMenu>.icon').toggleClass('active');
	$('#view3DMenu>.menu').toggleClass('active');
}

function detailsClick() {
	$('#optionsIcon>.active:not(#detailsIcon)').toggleClass('active');
	$('#optionsMenu>.active:not(#detailsMenu)').toggleClass('active');
	$('#detailsIcon').toggleClass('active');
	$('#detailsMenu').toggleClass('active');
}

function jointsClick() {
	$('#optionsIcon>.active:not(#jointsIcon)').toggleClass('active');
	$('#optionsMenu>.active:not(#jointsMenu)').toggleClass('active');
	$('#jointsIcon').toggleClass('active');
	$('#jointsMenu').toggleClass('active');
}

function canvasClick() {
	$('#optionsIcon>.active:not(#canvasIcon)').toggleClass('active');
	$('#optionsMenu>.active:not(#canvasMenu)').toggleClass('active');
	$('#canvasIcon').toggleClass('active');
	$('#canvasMenu').toggleClass('active');
}

function exportClick() {
	$('#optionsIcon>.active:not(#exportIcon)').toggleClass('active');
	$('#optionsMenu>.active:not(#exportMenu)').toggleClass('active');
	$('#exportIcon').toggleClass('active');
	$('#exportMenu').toggleClass('active');
}

function docClick() {
	$('#optionsIcon>.active:not(#docIcon)').toggleClass('active');
	$('#optionsMenu>.active:not(#docMenu)').toggleClass('active');
	$('#docIcon').toggleClass('active');
	$('#docMenu').toggleClass('active');
}

function updateModelSize() {
	var s = calModelSize(designModel);
	var xText;
	var yText;
	var zText;
	if (units=='inch') {
		for (i in s) {
			s[i] = s[i]/mmToInch;
		}
		xText = (s.sizeX).toFixed(1);
		yText = (s.sizeY).toFixed(1);
		zText = (s.sizeZ).toFixed(1);
	} else {
		xText = (s.sizeX).toFixed(0);
		yText = (s.sizeY).toFixed(0);
		zText = (s.sizeZ).toFixed(0);
	}
	var sText = 'w '+xText+' d '+zText+' h '+yText+' ('+units+')';
	$('#modelSize').html(sText);
}

function wireframeClick() {
	if( $('#checkWireframe').is(':checked') ) {
		FP.fill.a = 0.2;
		FA.fill.a = 0.2;
		FCA.fill.a = 0.2;
		FP.stroke1.a = 0.2;
		FA.stroke1.a = 0.4;
	} else {
		FP.fill.a = 0.9;
		FA.fill.a = 0.9;
		FCA.fill.a = 0.9;
		FP.stroke1.a = 0.12;
		FA.stroke1.a = 0.4;
	}
}

function topCapClick() {
	topCapBool = !topCapBool;
	if (topCapBool) {
		$('#checkTopCap').prop('checked', true);
	} else {
		$('#checkTopCap').prop('checked', false);
	}
	viewModel.setFaceAppearance(FP, FA, FCP, FCA, []);
	if (moduleSelection.indexOf('t')!=-1) {
		moduleSelection.splice(moduleSelection.indexOf('t'), 1);
		selBoundingBox();
	}
	recordBool = true;
}

function bottomCapClick() {
	bottomCapBool = !bottomCapBool;
	if (bottomCapBool) {
		$('#checkBottomCap').prop('checked', true);
	} else {
		$('#checkBottomCap').prop('checked', false);
	}
	viewModel.setFaceAppearance(FP, FA, FCP, FCA, []);
	if (moduleSelection.indexOf('b')!=-1) {
		moduleSelection.splice(moduleSelection.indexOf('b'), 1);
		selBoundingBox();
	}
	recordBool = true;
}

function addSideClick() {
	sideCount = sideCount>=maxSideCount ? maxSideCount : sideCount+1;
	designModel.calPoint(designModel.editPoint);
	addModule();
	viewModel.generate(designModel);
	recordBool = true;
}

function subtractSideClick() {
	if (sideCount > 3) {
		sideCount--;
		designModel.calPoint(designModel.editPoint);
		removeModule();
		viewModel.generate(designModel);
		recordBool = true;
	}
}

function updateSide() {
	$('#sideValue').html(sideCount);
}

var insideTwistSlider = false;
function initInsideTwist() {
	$( '#twistSlider' ).mouseenter(function() {
		insideTwistSlider = true;
	});
	$( '#twistSlider' ).mouseleave(function() {
		insideTwistSlider = false;
	});
}

function updateTwist() {
	var val = $('#twistSlider').val();
	twist = val;
	designModel.calPoint(designModel.editPoint);
	updateFabrication();
	viewModel.update(designModel);
}

function setTwist(n) {
	$('#twistSlider').val(n);
	twist = n;
	designModel.calPoint(designModel.editPoint);
	updateFabrication();
	viewModel.update(designModel);
}

function mmClick() {
	$('#checkMM').prop('checked', true);
	$('#checkInch').prop('checked', false);
	units = 'mm';
	updateCanvasSize();
	updateJointParam();
}

function inchClick() {
	$('#checkMM').prop('checked', false);
	$('#checkInch').prop('checked', true);
	units = 'inch';
	updateCanvasSize();
	updateJointParam();
}

function addCanvasClick() {
	var pos = fabCanvas[fabCanvas.length-1].pos;
	fabCanvas.push(new FabCanvas({'x':pos.x, 'y':pos.y+canvasH*scale2D+canvasGap*scale2D}, canvasW*scale2D, canvasH*scale2D));
	$('#canvasValue').html(fabCanvas.length);
}

function subtractCanvasClick() {
	if (fabCanvas.length > 1) {
		fabCanvas.splice(fabCanvas.length-1, 1);
		$('#canvasValue').html(fabCanvas.length);
	}
}

function updateCanvasSize() {
	var size;
	if (units=='mm') {
		var w = parseFloat(canvasW).toFixed(1);
		var h = parseFloat(canvasH).toFixed(1);
		size = w+' x '+h+' mm';
	} else {
		var w = parseFloat(canvasW/mmToInch).toFixed(2);
		var h = parseFloat(canvasH/mmToInch).toFixed(2);
		size = size = w+' x '+h+' in';
	}
	$('#canvasSize').html(size);
}

function setCanvasSize() {
	var w = $('#canvasWidth').val();
	var h = $('#canvasHeight').val();
	if (!isNaN(w) && !isNaN(h) && w!=0 && h!=0) {
		canvasW = units=='mm' ? w : w*mmToInch;
		canvasH = units=='mm' ? h : h*mmToInch;
		var pos = fabCanvas[0].pos;
		var wS = canvasW*scale2D;
		var hS = canvasH*scale2D;
		var gS = canvasGap*scale2D;
		for (var i=0; i<fabCanvas.length; i++) {
			fabCanvas[i].pos = {'x':pos.x, 'y':pos.y+(gS+hS)*i};
			fabCanvas[i].w = wS;
			fabCanvas[i].h = hS;
		}
		updateCanvasSize();
	}
}

function initJointList() {
	var s = '';
	for (i in jointList) {
		s = s + '<option value='+jointList[i].value+'>'+jointList[i].name+'</option>';
	}
	$('#jointsDropdown').html(s);
	$('#jointsDropdown').val(jointMode);
}

function updateJointParam() {
	jointMode = $('#jointsDropdown').val();
	var joint;
	for (i in jointList) {
		if (jointList[i].value==$('#jointsDropdown').val()) {
			joint = jointList[i];
			break;
		}
	}
	var s = '';
	var count = 0;
	for (i in joint) {
		if (i != 'name' && i != 'value') {
			count++;
			var val = units=='mm' ? joint[i] : joint[i]/mmToInch;
			s = s+'<div class="lineItem paramName">'+i+' ('+parseFloat(val).toFixed(2)+')</div>';
			s = s+'<div class="lineItem"><input class="paramValue" type="number" id="'+i+'"></div>'
		}
	}
	if (count>0) {
		s = s+'<div class="lineItem"><div id="setJoints" class="bigButton" style="margin-top:15px; width:224px;">set parameters</div></div>';
	}
	$('#jointParam').html(s);
	$('#setJoints').click(setJointParam);
}

function setJointParam() {
	var count = 0;
	$('.paramValue').each(function() {
		var i = this.id;
		var val = $(this).val();
		if (!isNaN(val) && val>0) {
			count++;
			val = units=='mm' ? parseFloat(val) : parseFloat(val)*mmToInch;
			for (j in jointList) {
				if (jointList[j].value==jointMode) {
					for (k in jointList[j]) {
						if (k == i) {
							jointList[j][k] = val;
						}
					}
				}
			}
		}
		updateJointParam();
	});
	if (count > 0) {
		recordBool = true;
	}
}

function initDoc() {
	initInsideMenu();
	initInsideView3D();
	initInsideTwist();
	updateCanvasSize();
	initJointList();
	updateJointParam();
	
	$('#view3DIcon').click(view3DClick);
	$('#detailsIcon').click(detailsClick);
	$('#jointsIcon').click(jointsClick);
	$('#canvasIcon').click(canvasClick);
	$('#exportIcon').click(exportClick);
	$('#docIcon').click(docClick);
	
	$('#checkWireframe').click(wireframeClick);
	$('#checkTopCap').click(topCapClick);
	$('#checkBottomCap').click(bottomCapClick);
	$('#subtractSide').click(subtractSideClick);
	$('#addSide').click(addSideClick);
	$('#twistSlider').on('change', function() {
		updateTwist();
		recordBool = true;
	});
	$('#checkMM').click(mmClick);
	$('#checkInch').click(inchClick);
	$('#addCanvas').click(addCanvasClick);
	$('#subtractCanvas').click(subtractCanvasClick);
	$('#setCanvasSize').click(setCanvasSize);
	 
	$('#jointsDropdown').on('change', updateJointParam);
	
	$('#saveFile').click(saveFile);
	$('#exportFile').click(exportSVG);
	$('#exportSTL').click(exportSTL);
	
	$('#ghost2D').toggleClass('hidden');
	$('#ghost2D').toggleClass('active');
	
	$('#mode2D').click(mode2DClick);
	$('#mode3D').click(mode3DClick);
	$('#editPoint').click(editPointClick);
	$('#arrange').click(arrangeClick);
	$('#addPoint').click(addPointClick);
	$('#removePoint').click(removePointClick);
	$('#split').click(splitClick);
	$('#fuse').click(fuseClick);
	$('#scale').click(scaleClick);
	$('#measure').click(measureClick);
	$('#pan').click(panClick);
}

var initLayerCount = 5;
var initSideCount = 6;
var newDocCheck = false;

function newFile() {
	$('#initSidesValue').html(initSideCount);
	$('#initLayerValue').html(initLayerCount-1);
	
	$('#subtractInitSides').click(function() {
		if (initSideCount > 3) {
			initSideCount--;
			$('#initSidesValue').html(initSideCount);
		}
	});
	$('#addInitSides').click(function() {
		initSideCount++;
		$('#initSidesValue').html(initSideCount);
	});
	$('#subtractInitLayers').click(function() {
		if (initLayerCount > 2) {
			initLayerCount--;
			$('#initLayerValue').html(initLayerCount-1);
			$('#newDocument').html('generate new file');
			newDocCheck = false;
		}
	});
	$('#addInitLayers').click(function() {
		initLayerCount++;
		$('#initLayerValue').html(initLayerCount-1);
		$('#newDocument').html('generate new file');
		newDocCheck = false;
	});
	
	$('#newDocument').click(function() {
		if (!initialized) {
			layerCount = initLayerCount;
			sideCount = initSideCount;
			init(true);
			view3DClick();
		} else {
			if (!newDocCheck) {
				$('#newDocument').html('this will clear current progress, continue?');
				newDocCheck = true;
			} else {
				$('#newDocument').html('generate new file');
				layerCount = initLayerCount;
				sideCount = initSideCount;
				init(false);
				newDocCheck = false;
			}
		}
	});
	
	$('#loadFile').change(function() {
		if (this.files.length) {
			var file = this.files[0];
			var reader = new FileReader();
			var filename = file.name;
			var ext = filename.split('.');
			var name = filename.split('_');
			if (ext[ext.length-1]=='parrot') {
				$('#loadFileText').html(file.name+'</br>loaded');
				reader.readAsText(file);
				$(reader).on('load', processFile);
				$('#filename').val(name[0]);
			} else {
				$('#loadFileText').html('invalid file type');
			}
		} else {
			$('#loadFileText').html('no file selected');
		} 
	});
}

function processFile(e) {
    var file = e.target.result,
        results;
    if (file && file.length) {
		if (!initialized) {
			init(true);
			view3DClick();
		} else {
			init(false);
		}
		var JSONfile = JSON.parse(file);
		applyState(JSONfile);
		$('#newDocument').html('generate new file');
		newDocCheck = false;
    }
}

function checkFocus() {
	var focusBool = false;
	focusBool = $("#filename").is(':focus') ? true : focusBool;
	focusBool = $(".numberInput").is(':focus') ? true : focusBool;
	focusBool = $(".paramValue").is(':focus') ? true : focusBool;
	focusBool = $("#wallThickness").is(':focus') ? true : focusBool;
	return focusBool;
}


