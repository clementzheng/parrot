$( window ).resize(function() {
	if (initialized) {
		$('#workspaceCanvas').attr('width',$('#workspaceCanvasDiv').css('width')).attr('height',$('#workspaceCanvasDiv').css('height'));
		wctx = wcanvas.getContext('2d');
		wctx.translate(0.5, 0.5);
	}
});

var cursorX = 0;
var cursorY = 0;
var pcursorX = 0;
var pcursorY = 0;
var canvasPoint = {'x':0, 'y':0};
var pcanvasPoint = {'x':0, 'y':0};
var rememberPoint = {'x':0, 'y':0};
var mouseClickDebounce = 200;
var isMouseDown = false;
var mouseDownTime = Date.now();

document.onmousemove = function(e){
	if (initialized) {
		pcursorX = cursorX;
		pcursorY = cursorY;
		pcanvasPoint.x = cursorX;
		pcanvasPoint.y = cursorY;

		cursorX = e.pageX;
		cursorY = e.pageY - $(window).scrollTop();
		canvasPoint.x = cursorX;
		canvasPoint.y = cursorY;
		
		if (!insideMenu) {
			switch(mode2D3D) {
				case '2D':
					highlightPart();
					break;
			}
			switch(mode) {
				case 'edit3D':
					selEditPoint();
					moveEditPoint();
					break;
				case 'add3D':
					selAddPoint();
					break;
				case 'subtract3D':
					selSubtractPoint();
					break;
				case 'scale3D':
					scaleDesignModel();
					break;
				case 'split2D':
					selSplitLine();
					break;
				case 'fuse2D':
					selFuseLine();
					break;
				case 'arrange2D':
					selArrange();
					selModuleWindow();
					checkArrangeCursor();
					arrangeModules();
					break;
				case 'scale2D':
					scaleFabrication();
					break;
				case 'globalMove':
					if (mode2D3D=='3D') {
						panDesignModel();
					} else {
						panFabrication();
					}
					break;
			}
		} else {
			if (insideView3D && mode != 'globalMove' && !ctrlDown && !shiftDown) {
				rotateCamera();
			}
			if (isMouseDown && insideTwistSlider && !ctrlDown && !shiftDown) {
				updateTwist();
			}
		}
	}
}

document.onclick = function(e){
	if (initialized) {
		if ((Date.now()-mouseDownTime)<mouseClickDebounce) {
			if (!insideMenu) {
				switch(mode) {
					case 'add3D':
						addPoint();
						break;
					case 'subtract3D':
						subtractPoint();
						break;
					case 'split2D':
						splitLine();
						break;
					case 'fuse2D':
						fuseLine();
						break;
					case 'arrange2D':
						rotateSelOrtho();
						selModuleClick();
						break;
					case 'dim3D':
						dim3DClick();
						break;
					case 'dim2D':
						dim2DClick();
						break;
				}
			}
		}
		if (recordBool) {
			recordState();
			recordBool = false;
		}
	}
}

document.onmousedown = function(e) {
	if (initialized) {
		mouseDownTime = Date.now();
		isMouseDown = true;
		pcanvasPoint.x = canvasPoint.x;
		pcanvasPoint.y = canvasPoint.y;
		rememberPoint.x = canvasPoint.x;
		rememberPoint.y = canvasPoint.y;
		
		if (!insideMenu) {
			switch(mode) {
				case 'edit3D':
					if (editDesignModelPt != -1) {
						referencePt.x = designModel.editPoint[Math.floor(editDesignModelPt)].x;
						referencePt.y = designModel.editPoint[Math.floor(editDesignModelPt)].y;	
					}
					break;
				case 'globalMove':
					$('body').css('cursor', '-webkit-grabbing');
					break;
				case 'arrange2D':
					initArrangeModules();
					break;
			}
		}
	}
}

document.onmouseup = function(e) {
	if (initialized) {
		isMouseDown = false;
		if (!insideMenu) {
			switch(mode) {
				case 'globalMove':
					$('body').css('cursor', '-webkit-grab');
					break;
				case 'arrange2D':
					initArrangeModules();
					break;
			}
		}
	}
	if (recordBool) {
		recordState();
		recordBool = false;
	}
}

var scaleSensitivity = 0.0075;
var zoomSpeedLimit = 200;
var zoomThen = Date.now();
var zoomNow = Date.now();
document.onwheel = function(e) {
	if (initialized) {
		zoomNow = Date.now();
		if (!insideView3D) {
			var dir = e.deltaY<0 ? -1 : e.deltaY>0 ? 1 : 0;
			var oldScale = 0;
			zoomThen = (zoomNow - zoomThen) > zoomSpeedLimit ? zoomNow : zoomThen;
			var scaleFactor = 1 + (zoomNow - zoomThen)*dir*scaleSensitivity;
			scaleFactor = scaleFactor > 1.3 ? 1.3 : scaleFactor;
			scaleFactor = scaleFactor < 0.8 ? 0.8 : scaleFactor;
			switch(mode2D3D) {
				case '3D':
					oldScale = scale3D;
					scale3D = scale3D * scaleFactor;
					var checkScale = designModel.minScaleX < designModel.minScaleY ? designModel.minScaleX : designModel.minScaleY;
					scale3D = scale3D<=checkScale ? checkScale : scale3D;
					zoomDesignModel(scale3D/oldScale);
					break;
				case '2D':
					oldScale = scale2D;
					scale2D = scale2D * scaleFactor;
					var minScale = ($('#workspaceCanvas').innerHeight()/4)/canvasH;
					scale2D = scale2D<=minScale ? minScale : scale2D;
					zoomFabrication(scale2D/oldScale);
					break;
			}
		}
		zoomThen = Date.now();
	}
}

document.onkeyup = function(e) {
	if (initialized && !checkFocus()) {
		
		$('body').css('cursor', 'default');
		
		designModel.calPoint(designModel.editPoint);
		
		var key = e.keyCode ? e.keyCode : e.which;
		if (!ctrlDown && !shiftDown) {
			if (key==50) {
				mode2DClick();
			}
			if (key==51) {
				mode3DClick();
			}
			
			if (key==69) {  // 'e'
				editPointClick();
			}
			if (key==82) {  // 'r'
				arrangeClick();
			}
			if (key==65) {  // 'a'
				addPointClick();
			}
			if (key==83) {  // 's'
				if (mode2D3D=='3D') {
					removePointClick();
				} else {
					splitClick();
				}
			}
			if (key==67) { // 'c'
				scaleClick();
			}
			if (key==70) { // 'f'
				fuseClick();
			}
			if (key==77) { // 'm'
				measureClick();
			}
			if (key==189) { // '-'
				if (sideCount > 3) {
					sideCount--;
					designModel.calPoint(designModel.editPoint);
					removeModule();
					viewModel.generate(designModel);
					recordBool = true;
				}
			}
			if (key==187) { // '='
				sideCount = sideCount>=maxSideCount ? maxSideCount : sideCount+1;
				designModel.calPoint(designModel.editPoint);
				addModule();
				viewModel.generate(designModel);
				recordBool = true;
			}
			
			if (mode=='arrange2D') {
				if (key==37) { // left arrow
					moveModule({'x':-nudgeMag, 'y':0});
				}
				if (key==39) { // right arrow
					moveModule({'x':nudgeMag, 'y':0});
				}
				if (key==38) { // up arrow
					moveModule({'x':0, 'y':-nudgeMag});
				}
				if (key==40) { // down arrow
					moveModule({'x':0, 'y':nudgeMag});
				}
			}
			
			if (key==48) { // 0 - bottom cap
				bottomCapClick();
			}
			if (key==57) { // 9 - top cap
				topCapClick();
			}
			
		}
		if (key==32) { // space
			mode = rememberMode;
			if (mode != 'globalMove') {
				$('body').css('cursor', 'default');
			}
		}
		if (key==16) { // shift
			shiftDown = false;
		}
		if (key==17) { // ctrl
			ctrlDown = false;
		}
		
		if (ctrlDown) {
			if (key==90) { //ctrl z
				undo();
			}
			if (key==89) { //ctrl y
				redo();
			}
			if (key==83) { //ctrl s
				saveFile();
			}
		}
		//console.log(key+', '+mode2D3D+' - '+mode);
	}
	
	if (recordBool) {
		recordState();
		recordBool = false;
	}
}

var ctrlDown = false;
var shiftDown = false;

document.onkeydown = function(e) {
	if (initialized && !checkFocus()) {
		var key = e.keyCode ? e.keyCode : e.which;		
		if (key==16) { // shift
			shiftDown = true;
		}
		if (key==17) { // ctrl
			ctrlDown = true;
		}
		if (key==32) { // space
			if (mode != 'globalMove') {
				rememberMode = mode;
				mode = 'globalMove';
				if (!isMouseDown) {
					console.log('test');
					$('body').css('cursor', '-webkit-grab');
				}
			}
		}
	}
}

$(document).bind('keydown', function(e) {
  if(e.ctrlKey && (e.which == 90)) {
    e.preventDefault();
  }
  if(e.ctrlKey && (e.which == 89)) {
    e.preventDefault();
  }
  if(e.ctrlKey && (e.which == 83)) {
    e.preventDefault();
  }
});
