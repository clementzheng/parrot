var initialized = false;

var wcanvas;
var wctx;
var vcanvas;
var vctx;

var mode2D3D = '3D';
var mode = 'edit3D';
var units = 'mm';
var mmToInch = 25.4;
var rememberMode = mode;

var scale3D = 1.0;
var scale2D = 1.0;

var layerCount = 5;
var tempLayerCount = layerCount;
var sideCount = 6;
var maxSideCount = 20;
var twist = 0.0;
var topCapBool = false;
var bottomCapBool = false;
var ghosted2D = true;

var origin = {'x':0, 'y':0, 'z':0};
var xAxis = {'x':1, 'y':0, 'z':0};
var yAxis = {'x':0, 'y':1, 'z':0};
var zAxis = {'x':0, 'y':0, 'z':1};

var tolerance = 10;
var lineSnapTol = 5;

var canvasW = 812.8;
var canvasH = 457.2;
var canvasGap = 40;
var initModuleGap = 30;


function init(bool) {
	
	if (bool) {
		initDoc();
	}
	
	$('#workspaceCanvas').attr('width',$('#workspaceCanvasDiv').css('width')).attr('height',$('#workspaceCanvasDiv').css('height'));
	console.log($('#workspaceCanvasDiv').innerWidth()+' x '+$('#workspaceCanvasDiv').innerHeight());

	wcanvas = document.getElementById('workspaceCanvas');
	wctx = wcanvas.getContext('2d');
	wctx.translate(0.5, 0.5);
	
	$('#view3DCanvas').attr('width',$('.active.menu').css('width')).attr('height',$('#view3DCanvasDiv').css('height'));
	vcanvas = document.getElementById('view3DCanvas');
	vctx = vcanvas.getContext('2d');
	vctx.translate(0.5, 0.5);
	
	initDesignModel(150, 300);
	initFabrication();
	initViewModel();
	initialized = true;
	recordState();
	
	draw();
	drawView3D();
}





//draw at X FPS (20fps = 50ms interval)
//setInterval(draw, 50);
//setInterval(drawView3D, 50);

var fps = 30;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

function draw() {
	if (initialized) {
		requestAnimationFrame(draw);	
		
		now = Date.now();
		delta = now - then;
		
		if (delta > interval) {
			then = now - (delta % interval);
			
			wctx.clearRect(-1, -1, $('#workspaceCanvasDiv').innerWidth()+1, $('#workspaceCanvasDiv').innerHeight()+1);
			switch(mode2D3D) {
				case '3D':
					if (ghosted2D) {
						for (var i=0; i<fabCanvas.length; i++) {
							fabCanvas[i].display(FCCG, FCSG);
						}
						for (var i=0; i<flatModule.length; i++) {
							flatModule[i].display(FMFLMG, FMFLVG, FMCLG, FMFG, FMPL, FMAL, i, segmentArray);
						}
						drawCap(FMFLMG, FMFLVG, FMCLG, FMFG, FMAL);
						}
					designModel.display(ML, MLCP, CL, TRI, MLA, MLCA1, GL);
					drawDim3D(DIM);
					break;
				case '2D':
					for (var i=0; i<fabCanvas.length; i++) {
						fabCanvas[i].display(FCC, FCS);
					}
					for (var i=0; i<flatModule.length; i++) {
						flatModule[i].display(FMFLM, FMFLV, FMCL, FMF, FMPL, FMAL, i, segmentArray);
					}
					drawCap(FMFLM, FMFLV, FMCL, FMF, FMAL);
					drawDim2D(DIM);
					break;
			}
			
			if (moduleSelection.length > 1 && mode=='arrange2D') {
				$('#alignment.hidden').toggleClass('hidden');
			} else {
				$('#alignment:not(.hidden)').toggleClass('hidden');
			}
			
			switch(mode) {
				case 'scale3D':
					drawBoundingBox3D(BB, BBRP, BBRA, MLA);
					break;
				case 'arrange2D':
					drawSelWindow(SW);
					drawSelBox(SBB, SBBC, SBBCR);
					break;
				case 'scale2D':
					calBoundingBox2D();
					drawBoundingBox2D(BB, BBRP, BBRA);
					break;
				case 'dim3D':
					drawDimPoint3D(DIMP, DIMPA, DIM);
					break;
				case 'dim2D':
					drawDimPoint2D(DIMP, DIMPA, DIM);
					break;
			}
			
			updateModelSize();
			updateSide();
		}
	}
}

var fpsV3D = 40;
var nowV3D;
var thenV3D = Date.now();
var intervalV3D = 1000/fps;
var deltaV3D;


function drawView3D() {
	if (initialized) {
		requestAnimationFrame(drawView3D);
		
		nowV3D = Date.now();
		deltaV3D = nowV3D - thenV3D;
		
		if (deltaV3D > intervalV3D) {
			thenV3D = nowV3D - (deltaV3D % intervalV3D);
		
			vctx.clearRect(-1, -1, $('#view3DCanvasDiv').innerWidth()+1, $('#view3DCanvasDiv').innerHeight()+1);
			displayViewModel();
		}
	}
}

function drawCircle(xPos, yPos, appearance) {
	wctx.beginPath();
	wctx.arc(Math.round(xPos), Math.round(yPos), appearance.r, 0, 2 * Math.PI, false);
	wctx.fillStyle = appearance.fill;
	wctx.strokeStyle = appearance.stroke;
	wctx.lineWidth = appearance.strokeW;
	wctx.fill();
	wctx.stroke();
}

function drawPolyline(ptList, appearance, bool) {
	wctx.beginPath();
	wctx.fillStyle = appearance.fill;
	wctx.strokeStyle = appearance.stroke;
	wctx.lineWidth = appearance.strokeW;
	wctx.setLineDash(appearance.dash);
	wctx.moveTo(Math.round(ptList[0].x), Math.round(ptList[0].y));
	for (var i=0; i<ptList.length; i++) {
		wctx.lineTo(Math.round(ptList[i].x), Math.round(ptList[i].y));
	}
	if (bool) {
		wctx.closePath();
	}
	wctx.stroke();
	wctx.fill();
	wctx.setLineDash([]);
}

function drawRect(xPos, yPos, appearance) {
	wctx.beginPath();
	wctx.rect(Math.round(xPos-appearance.w), Math.round(yPos-appearance.h), appearance.w*2, appearance.h*2);
	wctx.fillStyle = appearance.fill;
	wctx.strokeStyle = appearance.stroke;
	wctx.lineWidth = appearance.strokeW;
	wctx.fill();
	wctx.stroke();
}

var undoList = [];
var undoIndex = -1;
var recordBool = false;
function returnState() {
	
	var recScale2D = scale2D;
	var recScale3D = scale3D;
	var recLayerCount = layerCount;
	var recSideCount = sideCount;
	var recTwist = twist;
	var recJointMode = jointMode;
	
	var segList = [];
	for (i in segmentArray) {
		segList.push($.extend(true,{},segmentArray[i]));
	}
	
	var dMList = $.extend(true,{},designModel);
		
	var fMList = [];
	for (i in flatModule) {
		fMList.push($.extend(true,{},flatModule[i]));
	}
	
	var recTopCapBool = topCapBool;
	var recBottomCapBool = bottomCapBool;
	var tC = $.extend(true,{},topCap);
	var bC = $.extend(true,{},bottomCap);
	
	var canList = [];
	for (i in fabCanvas) {
		canList.push($.extend(true,{},fabCanvas[i]));
	}
	
	var dim2List = [];
	for (i in dim2D) {
		dim2List.push($.extend(true,{},dim2D[i]));
	}
	
	var dim3List = [];
	for (i in dim3D) {
		dim3List.push($.extend(true,{},dim3D[i]));
	}
	
	var jtList = [];
	for (i in jointList) {
		jtList.push($.extend(true,{},jointList[i]));
	}
	
	return {'scale2D':scale2D, 'scale3D':scale3D, 'sideCount':recSideCount, 'layerCount':recLayerCount, 'twist':twist, 'segmentArray':segList, 'DesignModel':dMList, 'FlatModule':fMList, 'topCapBool':recTopCapBool, 'bottomCapBool':recBottomCapBool, 'topCap':tC, 'bottomCap':bC, 'FabCanvas':canList, 'dim2D':dim2List, 'dim3D':dim3List, 'jointList':jtList, 'jointMode':recJointMode};
}

function recordState() {
	var state = returnState();
	undoIndex++;
	undoList.splice(undoIndex, undoList.length, state);
	//console.log(undoIndex, undoList.length, state);
}

function applyState(state) {
	
	scale2D = state['scale2D'];
	scale3D = state['scale3D'];
	sideCount = state['sideCount'];
	layerCount = state['layerCount'];
	twist = state['twist'];
	jointMode = state['jointMode'];
	$('#twistSlider').val(twist);
	
	var dM = state['DesignModel'];
	
	designModel.editPoint = [];
	for (i in dM['editPoint']) {
		designModel.editPoint.push(dM['editPoint'][i]);
	}
	designModel.topCenter = dM['topCenter'];
	designModel.minScaleX = dM['minScaleX'];
	designModel.minScaleY = dM['minScaleY'];
	
	designModel.calPoint(designModel.editPoint);
	viewModel.generate(designModel);
	template = calUnfold(designModel.point);
	folding = calFolding(designModel.point);
	
	var sA = state['segmentArray'];
	segmentArray = [];
	for (i in sA) {
		segmentArray.push($.extend(true,{},sA[i]));
	}

			
	var fM = state['FlatModule'];
	flatModule = [];
	for (i in fM) {
		flatModule.push(new FlatModule());
		flatModule[i].pos = fM[i]['pos'];
		flatModule[i].rot = fM[i]['rot'];
		flatModule[i].segment = fM[i]['segment'];
		flatModule[i].point = [];
		for (var j=0; j<fM[i].point.length; j++) {
			flatModule[i].point.push(fM[i].point[j]);
		}
	}
	
	topCapBool = state['topCapBool'];
	bottomCapBool = state['bottomCapBool'];
	topCap = $.extend(true,{},state['topCap']);
	bottomCap = $.extend(true,{},state['bottomCap']);
	
	moduleSelection = [];
	selBox.bool = false;
	
	var can = state['FabCanvas'];
	fabCanvas = [];
	for (i in can) {
		fabCanvas.push(new FabCanvas(can[i]['pos'], can[i]['w'], can[i]['h']));
	}
	
	var dim2 = state['dim2D'];
	dim2D = [];
	for (i in dim2) {
		dim2D.push($.extend(true,{},dim2[i]));
	}
	
	var dim3 = state['dim3D'];
	dim3D = [];
	for (i in dim3) {
		dim3D.push($.extend(true,{},dim3[i]));
	}
	
	var jtList = state['jointList'];
	jointList = [];
	for (i in jtList) {
		jointList.push($.extend(true,{},jtList[i]));
	}
	
	$('#jointsDropdown').val(jointMode);
	updateJointParam();
	
	$('#canvasValue').html(fabCanvas.length);
}

function undo() {
	if (undoIndex > 0) {
		undoIndex--;
		applyState(undoList[undoIndex]);
		console.log(undoIndex+'/'+(undoList.length-1), 'undo');
	} else {
		console.log('nothing to undo');
	}
}

function redo() {
	if (undoIndex < undoList.length-1) {
		undoIndex++;
		applyState(undoList[undoIndex]);
		console.log(undoIndex+'/'+(undoList.length-1), 'redo');
	} else {
		console.log('nothing to redo');
	}
}

function saveFile() {
	var state = returnState();
	var saveText = JSON.stringify(state);
	var blob = new Blob([saveText], {type: "text/plain;charset=utf-8"});
	var d = new Date();
	var filename = $('#filename').val();
	saveAs(blob, filename+'_save_'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'_'+d.getHours()+'.'+d.getMinutes()+'.'+d.getSeconds()+'.parrot');
}

function returnVal(x) {
	return x;
}