var gl;
var canvas;
var shadersProgram;
var vertexPositionAttributePointer;
var vertexPositionAttributePointer2;
var vertexBuffer;
var vertexBuffer2; 
var colorBuffer;
var modelMatrix;
var viewMatrix;
var projectionMatrix;

// for camera movement
var totalAngle = 0.0; 
var totalZ = 0.01;
var requestID = 0;

var perspectiveViewUniformPointer;
var perspectiveMatrix = new Float32Array(16);
var pvMatrix = new Float32Array(16);

var textureCoordinatesAttributePointer;
var indexBuffer;
var textureBuffer;
var floorTexture;
var floorVBuffer;

var modelUniformPointer;
var uSamplerPointer;
var finalMatrix = new Float32Array(16);

let uUseTextureLoc;

// for head front face image
var headTexture;
var headTextureBuffer;
var headFrontFaceBuffer;
var headFrontTexCoordBuffer;
var headTexture;

// for sky image
var SkyFrontTexCoordBuffer;
var SkyTexture;

// for ears 
var EarsLeftBuffer;
var EarsLeftTexCoordBuffer;
var EarLeftTexture;
var EarsRightBuffer;
var EarsRightTexCoordBuffer;
var EarRightTexture;

// for mouse control
var isMouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var mouseSensitivity = 0.05;

// for limb controll
var rightArmAngle = 0;
var leftArmAngle = 0;
var headAngle = 0;
var rightLegAngle = 0;
var leftLegAngle = 0; 

// for parade controll
var paradeActive = false;
var paradePhase = 0;
var paradeSpeed = 1;
var paradeRequestID = 0;

// for body
var bodyTexture;
var bodyTextureBuffer;

// -------------------------------------
// Functions

function createRenderingContext(inCanvas) {
    var outContext = inCanvas.getContext("webgl") || inCanvas.getContext("experimental-webgl");
    if (!outContext) {
        alert("Failed to create WebGL context. Please ensure your browser supports WebGL.");
        return null;
    }
    return outContext;
}

function createCompileShader(shaderType, shaderSource) {
    var outShader = gl.createShader(shaderType);
    gl.shaderSource(outShader, shaderSource);
    gl.compileShader(outShader);
    if (!gl.getShaderParameter(outShader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error: " + gl.getShaderInfoLog(outShader));
        alert("Shader compilation error: " + gl.getShaderInfoLog(outShader));
        gl.deleteShader(outShader);
        return null;
    }
    return outShader;
}

function initShaders() {
    var vertexShaderSource = document.getElementById("vShader").textContent;
    var fragmentShaderSource = document.getElementById("fShader").textContent;
    var vertexShader = createCompileShader(gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createCompileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
        console.error("Failed to compile shaders.");
        return false;
    }

    shadersProgram = gl.createProgram();
    gl.attachShader(shadersProgram, vertexShader);
    gl.attachShader(shadersProgram, fragmentShader);
    gl.linkProgram(shadersProgram);
    
    if (!gl.getProgramParameter(shadersProgram, gl.LINK_STATUS)) {
        console.error("Shader program linking error: " + gl.getProgramInfoLog(shadersProgram));
        alert("Shader program linking error: " + gl.getProgramInfoLog(shadersProgram));
        return false;
    }
    
    gl.useProgram(shadersProgram);
    vertexPositionAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexPosition");
    if (vertexPositionAttributePointer < 0) {
        console.error("Failed to get aVertexPosition attribute location.");
        return false;
    }
    gl.enableVertexAttribArray(vertexPositionAttributePointer);

	var vertexColorAttribute = gl.getAttribLocation(shadersProgram, "aVertexColor");
	gl.enableVertexAttribArray(vertexColorAttribute);

	textureCoordinatesAttributePointer = gl.getAttribLocation(shadersProgram, "aTextureCoordinates");
	gl.enableVertexAttribArray(textureCoordinatesAttributePointer);

	uSamplerPointer = gl.getUniformLocation(shadersProgram, "uSampler");
	modelUniformPointer = gl.getUniformLocation(shadersProgram, "uModelMatrix"); 
	uUseTextureLoc = gl.getUniformLocation(shadersProgram, "uUseTexture");
	
    return true;
}

function initBuffers() {
    CubeGeneration();
    FloorGeneration();
    FrontFaceGeneration();
    EarsGeneration();
    SkyBoxGeneration();
    BodyTextureGeneration();
}

function CubeGeneration() {
    var cubeVertices = new Float32Array([
        -0.5, -0.5, -0.5, 1.0,
         0.5, -0.5, -0.5, 1.0,
         0.5,  0.5, -0.5, 1.0,
        -0.5, -0.5, -0.5, 1.0,
         0.5,  0.5, -0.5, 1.0,
        -0.5,  0.5, -0.5, 1.0,
        
        -0.5, -0.5, 0.5, 1.0,
         0.5,  0.5, 0.5, 1.0,
         0.5, -0.5, 0.5, 1.0,
        -0.5, -0.5, 0.5, 1.0,
        -0.5,  0.5, 0.5, 1.0,
         0.5,  0.5, 0.5, 1.0,
        
        -0.5, -0.5, -0.5, 1.0,
        -0.5,  0.5, -0.5, 1.0,
        -0.5,  0.5,  0.5, 1.0,
        -0.5, -0.5, -0.5, 1.0,
        -0.5,  0.5,  0.5, 1.0,
        -0.5, -0.5,  0.5, 1.0,
        
         0.5, -0.5, -0.5, 1.0,
         0.5, -0.5,  0.5, 1.0,
         0.5,  0.5,  0.5, 1.0,
         0.5, -0.5, -0.5, 1.0,
         0.5,  0.5,  0.5, 1.0,
         0.5,  0.5, -0.5, 1.0,
        
        -0.5, -0.5, -0.5, 1.0,
        -0.5, -0.5,  0.5, 1.0,
         0.5, -0.5,  0.5, 1.0,
        -0.5, -0.5, -0.5, 1.0,
         0.5, -0.5,  0.5, 1.0,
         0.5, -0.5, -0.5, 1.0,
        
        -0.5,  0.5, -0.5, 1.0,
         0.5,  0.5, -0.5, 1.0,
         0.5,  0.5,  0.5, 1.0,
        -0.5,  0.5, -0.5, 1.0,
         0.5,  0.5,  0.5, 1.0,
        -0.5,  0.5,  0.5, 1.0
    ]);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    vertexBuffer.itemSize = 4;
    vertexBuffer.itemCount = 36;

    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Red
        [0.0, 1.0, 0.0, 1.0], // Green
        [0.0, 0.0, 1.0, 1.0], // Blue
        [1.0, 1.0, 0.0, 1.0], // Yellow
        [0.5, 0.0, 0.5, 1.0], // Purple
        [1.0, 0.5, 0.0, 1.0], // Orange
    ];

    var colors = [];
    for (var i = 0; i < faceColors.length; i++) {
        var c = faceColors[i];
        for (var j = 0; j < 6; j++) {
            colors = colors.concat(c);
        }
    }

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    colorBuffer.itemSize = 4;
    colorBuffer.itemCount = 36;
}

function FloorGeneration() {
    var floorVertices = new Float32Array([
        -0.9,  0.9, -0.2, 1.0, // Vertex A
         0.9,  0.9, -0.2, 1.0, // Vertex B
        -0.9, -0.9, -0.2, 1.0, // Vertex C
         0.9, -0.9, -0.2, 1.0  // Vertex D
    ]);
    
    vertexBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);
    vertexBuffer2.itemSize = 4;
    vertexBuffer2.itemCount = 4;
    
    var textureCoordinates = [
    	0.0, 1.0, // (top-left)
    	1.0, 1.0, // (top-right)
    	0.0, 0.0, // (bottom-left)
    	1.0, 0.0  // (bottom-right)
	];
    
    textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    textureBuffer.itemSize = 2;
    
    // For two triangles
    var floorIMatrix = new Uint16Array([
        0, 1, 2,  // A-B-C
        1, 2, 3   // B-C-D
    ]);
    
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floorIMatrix, gl.STATIC_DRAW);
    indexBuffer.itemCount = 6;
    
    floorTexture = gl.createTexture();
    var floorImageURL = "Floor.jpg";
    preprocessTextureImage(floorImageURL, floorTexture);
}

function FrontFaceGeneration() {
    var headFrontFaceVertices = new Float32Array([
        -0.5, -0.5, -0.5, 1.0,
        -0.5, -0.5,  0.5, 1.0,
        0.5, -0.5,  0.5, 1.0,
        -0.5, -0.5, -0.5, 1.0,
        0.5, -0.5,  0.5, 1.0,
        0.5, -0.5, -0.5, 1.0
    ]);

    headFrontFaceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, headFrontFaceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, headFrontFaceVertices, gl.STATIC_DRAW);
    headFrontFaceBuffer.itemSize = 4;
    headFrontFaceBuffer.itemCount = 6;

    var headFrontTexCoords = new Float32Array([
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0
    ]);

    headFrontTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, headFrontTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, headFrontTexCoords, gl.STATIC_DRAW);
    headFrontTexCoordBuffer.itemSize = 2;

    headTexture = gl.createTexture();
    var headImageURL = "head.jpg";
    preprocessTextureImage(headImageURL, headTexture);
}

function EarsGeneration () {
    // Left Ear
    var EarsLeftVertices = new Float32Array([
        -0.5, -0.5, -0.5, 1.0,
        -0.5,  0.5, -0.5, 1.0,
        -0.5,  0.5,  0.5, 1.0,
        -0.5, -0.5, -0.5, 1.0,
        -0.5,  0.5,  0.5, 1.0,
        -0.5, -0.5,  0.5, 1.0,
    ]);

    EarsLeftBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsLeftBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, EarsLeftVertices, gl.STATIC_DRAW);
    EarsLeftBuffer.itemSize = 4;
    EarsLeftBuffer.itemCount = 6;

    var EarsLeftTexCoords = new Float32Array([
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ]);

    EarsLeftTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsLeftTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, EarsLeftTexCoords, gl.STATIC_DRAW);
    EarsLeftTexCoordBuffer.itemSize = 2;

    EarLeftTexture = gl.createTexture();
    var EarImageURL = "ear.jpg";
    preprocessTextureImage(EarImageURL, EarLeftTexture);

    // Right Ear
    var EarsRightVertices = new Float32Array([
         0.5, -0.5, -0.5, 1.0,
         0.5, -0.5,  0.5, 1.0,
         0.5,  0.5,  0.5, 1.0,
         0.5, -0.5, -0.5, 1.0,
         0.5,  0.5,  0.5, 1.0,
         0.5,  0.5, -0.5, 1.0,
    ]);

    EarsRightBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsRightBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, EarsRightVertices, gl.STATIC_DRAW);
    EarsRightBuffer.itemSize = 4;
    EarsRightBuffer.itemCount = 6;

    var EarsRightTexCoords = new Float32Array([
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 0.0
    ]);

    EarsRightTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsRightTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, EarsRightTexCoords, gl.STATIC_DRAW);
    EarsRightTexCoordBuffer.itemSize = 2;

    EarRightTexture = gl.createTexture();
    var EarImageURL = "ear.jpg";
    preprocessTextureImage(EarImageURL, EarRightTexture);
}

function SkyBoxGeneration() {
    var skyboxTexCoords = new Float32Array([
        // Back face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Front face
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Right face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,

        // Top face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ]);

    SkyFrontTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, SkyFrontTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxTexCoords, gl.STATIC_DRAW);
    SkyFrontTexCoordBuffer.itemSize = 2;
    SkyFrontTexCoordBuffer.itemCount = 36;

    SkyTexture = gl.createTexture();
    var SkyImageURL = "Sky.jpg";
    preprocessTextureImage(SkyImageURL, SkyTexture);
}

function BodyTextureGeneration() {
    var bodyTexCoords = new Float32Array([
        // Back face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Front face
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Right face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,

        // Bottom face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,

        // Top face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ]);

    bodyTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bodyTexCoords, gl.STATIC_DRAW);
    bodyTextureBuffer.itemSize = 2;
    bodyTextureBuffer.itemCount = 36;

    bodyTexture = gl.createTexture();
    var bodyImageURL = "rest.jpg";
    preprocessTextureImage(bodyImageURL, bodyTexture);
}

function preprocessTextureImage(imageURL, textureObject) {
    var imageObject = new Image();
    imageObject.onload = function() {
        console.log("Texture image loaded successfully");
        gl.bindTexture(gl.TEXTURE_2D, textureObject);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageObject);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        drawScene();
    };
    imageObject.onerror = function() {
        console.error("Failed to load texture image");
    };
    imageObject.src = imageURL;
}

function getCameraPosition(camOrthoDistance) {
    const selectedPosition = document.querySelector('input[name="cameraPosition"]:checked');
    if (!selectedPosition) {
        console.warn("No camera position selected, using default [8, 8, 8]");
        return [8, 8, 8];
    }
    switch (selectedPosition.value) {
        case 'left-front-top':
            return [-camOrthoDistance, -camOrthoDistance, camOrthoDistance];
        case 'left-front-bottom':
            return [-camOrthoDistance, -camOrthoDistance, -camOrthoDistance];
        case 'left-back-top':
            return [-camOrthoDistance, camOrthoDistance, camOrthoDistance];
        case 'left-back-bottom':
            return [-camOrthoDistance, camOrthoDistance, -camOrthoDistance];
        case 'right-front-top':
            return [camOrthoDistance, -camOrthoDistance, camOrthoDistance];
        case 'right-front-bottom':
            return [camOrthoDistance, -camOrthoDistance, -camOrthoDistance];
        case 'right-back-top':
            return [camOrthoDistance, camOrthoDistance, camOrthoDistance];
        case 'right-back-bottom':
            return [camOrthoDistance, camOrthoDistance, -camOrthoDistance];
        default:
            console.warn("Invalid camera position, using default [8, 8, 8]");
            return [8, 8, 8];
    }
}

function initMatrices() {
    modelMatrix = glMatrix.mat4.create();
    viewMatrix = glMatrix.mat4.create();
    projectionMatrix = glMatrix.mat4.create();

    glMatrix.mat4.identity(modelMatrix);

    const viewAngle = parseFloat(document.getElementById('viewAngle').value) || 60;
    const camOrthoDistance = parseFloat(document.getElementById('camOrthoDistance').value) || 8;
    const cameraPosition = getCameraPosition(camOrthoDistance);

    glMatrix.mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 0, 1]);
    glMatrix.mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(Math.max(1, Math.min(179, viewAngle))), canvas.width / canvas.height, 0.01, 30000);
}

function spinning() {
    var txtStepAngle = document.getElementById("stepAngleTxt").value;
    var numStepAngle = parseFloat(txtStepAngle) * Math.PI / 180.0;
    totalAngle += numStepAngle;

    var txtStepZ = document.getElementById("stepZTxt").value;
    var numStepZ = parseFloat(txtStepZ);
    totalZ += numStepZ;

    // Get camera distance
    const viewAngle = parseFloat(document.getElementById('viewAngle').value) || 60;
    const camOrthoDistance = parseFloat(document.getElementById('camOrthoDistance').value) || 8;

    const x = camOrthoDistance * Math.cos(totalAngle);
    const y = camOrthoDistance * Math.sin(totalAngle);

    glMatrix.mat4.lookAt(viewMatrix, [x, y, totalZ], [0, 0, 0], [0, 0, 1]);
    glMatrix.mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(Math.max(1, Math.min(179, viewAngle))), canvas.width / canvas.height, 0.01, 30000);
}

function drawScene() {
    // Basic setup
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Get locations
    var modelMatrixUniform = gl.getUniformLocation(shadersProgram, "uModelMatrix");
    var viewMatrixUniform = gl.getUniformLocation(shadersProgram, "uViewMatrix");
    var projectionMatrixUniform = gl.getUniformLocation(shadersProgram, "uProjectionMatrix");

    // Set matrices
    gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniform, false, projectionMatrix);

    // Draw components
    drawSky(modelMatrixUniform);
    drawFloor(modelMatrixUniform);
    drawRobot(modelMatrixUniform);
    drawHead(modelMatrixUniform);
}

function drawFloor(modelMatrixUniform) {
    gl.uniform1i(uUseTextureLoc, 1);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2);
    gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer2.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(textureCoordinatesAttributePointer, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoordinatesAttributePointer);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    gl.uniform1i(uSamplerPointer, 0);
    
    let floorMatrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(floorMatrix, floorMatrix, [0, 0, 0]);
    glMatrix.mat4.scale(floorMatrix, floorMatrix, [60, 60, 2]);
    gl.uniformMatrix4fv(modelMatrixUniform, false, floorMatrix);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indexBuffer.itemCount, gl.UNSIGNED_SHORT, 0);
}

function drawRobot(modelMatrixUniform) {
    gl.uniform1i(uUseTextureLoc, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    var vertexColorAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttributePointer);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(vertexColorAttributePointer, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Draw robot parts
    drawRobotPart(modelMatrixUniform, [0, 0, 0], [0, 0, 0], 0);    // Mysterious
    drawRobotPart(modelMatrixUniform, [-3, 0, 1], [4, 6, 2], 1);   // Right Foot
    drawRobotPart(modelMatrixUniform, [3, 0, 1], [4, 6, 2], 2);    // Left Foot
    drawRobotPart(modelMatrixUniform, [3, 1.5, 6], [4, 3, 8], 3);  // Left Leg
    drawRobotPart(modelMatrixUniform, [-3, 1.5, 6], [4, 3, 8], 4); // Right Leg
    drawRobotPart(modelMatrixUniform, [0, 0, 16], [10, 6, 12], 5); // Body
    drawRobotPart(modelMatrixUniform, [6, 0, 17], [2, 4, 10], 6);  // Right Arm
    drawRobotPart(modelMatrixUniform, [-6, 0, 17], [2, 4, 10], 7); // Left Arm
}

function drawRobotPart(modelMatrixUniform, translation, scale, part) {
    let matrix = glMatrix.mat4.create();
    glMatrix.mat4.translate(matrix, matrix, translation);
    switch(part){
        case 1:
            glMatrix.mat4.translate(matrix, matrix, [0, 1.5, 9]);
            glMatrix.mat4.rotateX(matrix, matrix, glMatrix.glMatrix.toRadian(-rightLegAngle));
            glMatrix.mat4.translate(matrix, matrix, [0, -1.5, -9]);
            break;
        case 2:
            glMatrix.mat4.translate(matrix, matrix, [0, 1.5, 9]);
            glMatrix.mat4.rotateX(matrix, matrix, glMatrix.glMatrix.toRadian(-leftLegAngle));
            glMatrix.mat4.translate(matrix, matrix, [0, -1.5, -9]);
            break;
        case 3:
            glMatrix.mat4.translate(matrix, matrix, [0, 0, 4]);
            glMatrix.mat4.rotateX(matrix, matrix, glMatrix.glMatrix.toRadian(-leftLegAngle));
            glMatrix.mat4.translate(matrix, matrix, [0, 0, -4]);
            break;
        case 4:
            glMatrix.mat4.translate(matrix, matrix, [0, 0, 4]);
            glMatrix.mat4.rotateX(matrix, matrix, glMatrix.glMatrix.toRadian(-rightLegAngle));
            glMatrix.mat4.translate(matrix, matrix, [0, 0, -4]);
            break;
        case 6:
            glMatrix.mat4.translate(matrix, matrix, [0, 0, 5]);
            glMatrix.mat4.rotateX(matrix, matrix, glMatrix.glMatrix.toRadian(-rightArmAngle));
            glMatrix.mat4.translate(matrix, matrix, [0, 0, -5]);
            break;
        case 7:
            glMatrix.mat4.translate(matrix, matrix, [0, 0, 5]);
            glMatrix.mat4.rotateX(matrix, matrix, glMatrix.glMatrix.toRadian(-leftArmAngle));
            glMatrix.mat4.translate(matrix, matrix, [0, 0, -5]);
            break;
    }
    
    glMatrix.mat4.scale(matrix, matrix, scale);
    gl.uniformMatrix4fv(modelMatrixUniform, false, matrix);

    if (part == 0) {
        gl.uniform1i(uUseTextureLoc, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bodyTextureBuffer);
        gl.vertexAttribPointer(textureCoordinatesAttributePointer, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
        gl.uniform1i(uSamplerPointer, 0);
        gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
    } else {
        gl.uniform1i(uUseTextureLoc, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(gl.getAttribLocation(shadersProgram, "aVertexColor"), 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
    }
}

function drawHead(modelMatrixUniform) {
    let Head = glMatrix.mat4.create();
    glMatrix.mat4.translate(Head, Head, [0, 1, 24.5]);
    glMatrix.mat4.scale(Head, Head, [6, 4, 5]);

    glMatrix.mat4.translate(Head, Head, [0, 0, -0.5]);
    glMatrix.mat4.rotateX(Head, Head, glMatrix.glMatrix.toRadian(headAngle));
    glMatrix.mat4.translate(Head, Head, [0, 0, 0.5]);
    gl.uniformMatrix4fv(modelMatrixUniform, false, Head);

    // Face
    gl.uniform1i(uUseTextureLoc, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, headFrontFaceBuffer);
    gl.vertexAttribPointer(vertexPositionAttributePointer, headFrontFaceBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, headFrontTexCoordBuffer);
    gl.vertexAttribPointer(textureCoordinatesAttributePointer, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, headTexture);
    gl.uniform1i(uSamplerPointer, 0);
    gl.drawArrays(gl.TRIANGLES, 0, headFrontFaceBuffer.itemCount);

    // Left ear
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsLeftBuffer);
    gl.vertexAttribPointer(vertexPositionAttributePointer, EarsLeftBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsLeftTexCoordBuffer);
    gl.vertexAttribPointer(textureCoordinatesAttributePointer, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, EarLeftTexture);
    gl.uniform1i(uSamplerPointer, 0);
    gl.drawArrays(gl.TRIANGLES, 0, EarsLeftBuffer.itemCount);

    // Right ear
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsRightBuffer);
    gl.vertexAttribPointer(vertexPositionAttributePointer, EarsRightBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, EarsRightTexCoordBuffer);
    gl.vertexAttribPointer(textureCoordinatesAttributePointer, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, EarRightTexture);
    gl.uniform1i(uSamplerPointer, 0);
    gl.drawArrays(gl.TRIANGLES, 0, EarsRightBuffer.itemCount);
    
    // Rest of head
    gl.uniform1i(uUseTextureLoc, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyTextureBuffer);
    gl.vertexAttribPointer(textureCoordinatesAttributePointer, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
}

function drawSky(modelMatrixUniform) {
    let Sky = glMatrix.mat4.create();
    glMatrix.mat4.translate(Sky, Sky, [0, 0, 0]);
    glMatrix.mat4.scale(Sky, Sky, [2000, 2000, 2000]);
    gl.uniformMatrix4fv(modelMatrixUniform, false, Sky);

    gl.uniform1i(uUseTextureLoc, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, SkyFrontTexCoordBuffer);
    gl.vertexAttribPointer(textureCoordinatesAttributePointer, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, SkyTexture);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
}

// Apply Button actions
function updateScene() {
    if (!gl) {
        console.error("WebGL context not initialized.");
        return;
    }
    initMatrices();
    drawScene();
}

// Start Button actions
function StartAnimation() {
    if (requestID) return;

    const camOrthoDistance = parseFloat(document.getElementById('camOrthoDistance').value) || 8;
    const cameraPosition = getCameraPosition(camOrthoDistance);

    // Calculate the initial angle and height from camera's position
    totalAngle = Math.atan2(cameraPosition[1], cameraPosition[0]);
    totalZ = cameraPosition[2];

    function renderLoop() {
        spinning();
        drawScene();
        requestID = requestAnimationFrame(renderLoop);
    }
    renderLoop();
}

// Stop Button actions
function StopAnimation() {
    if (requestID) {
        cancelAnimationFrame(requestID);
        requestID = 0;
    }
}

window.updateScene = updateScene;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gl) {
        initMatrices();
        drawScene();
    }
});

function MouseClickHandler() {
    // Mouse down
    canvas.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    // Mouse up
    canvas.addEventListener('mouseup', function(e) {
        isMouseDown = false;
        lastMouseX = null;
        lastMouseY = null;
    });

    // Mouse left-right
    canvas.addEventListener('mouseout', function(e) {
        isMouseDown = false;
        lastMouseX = null;
        lastMouseY = null;
    });

    // Handle camera movement
    canvas.addEventListener('mousemove', function(e) {
        if (!isMouseDown) return;
        
        // Calculate mouse movement delta
        var deltaX = e.clientX - lastMouseX;
        var deltaY = e.clientY - lastMouseY;

        document.getElementById("mouseX").innerHTML = e.clientX;
        document.getElementById("mouseY").innerHTML = e.clientY;
        
        // Update camera rotation (left-right)
        totalAngle += deltaX * mouseSensitivity * 0.1;
        
        // Update camera height (up-down)
        totalZ += deltaY * mouseSensitivity * 1;
        
        // Update camera position
        const camOrthoDistance = parseFloat(document.getElementById('camOrthoDistance').value) || 8;
        const x = camOrthoDistance * Math.cos(totalAngle);
        const y = camOrthoDistance * Math.sin(totalAngle);
        
        glMatrix.mat4.lookAt(viewMatrix, [x, y, totalZ], [0, 0, 0], [0, 0, 1]);
        
        drawScene();
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = Math.sign(e.deltaY);
        const selectedLimb = document.querySelector('input[name="LimbPart"]:checked');
        if (!selectedLimb) {
            console.warn("No camera position selected, using default [8, 8, 8]");
        }
        switch (selectedLimb.value) {
            case 'rightArm':
                rightArmAngle = Math.max(0, Math.min(180, rightArmAngle - delta * 5));
                break;
            case 'leftArm':
                leftArmAngle = Math.max(0, Math.min(180, leftArmAngle - delta * 5));
                break;
            case 'head':
                headAngle = Math.max(0, Math.min(90, headAngle - delta * 5));
                break;
            case 'rightFoot':
                rightLegAngle = Math.max(0, Math.min(90, rightLegAngle - delta * 5));
                break;
            case 'leftFoot':
                leftLegAngle = Math.max(0, Math.min(90, leftLegAngle - delta * 5));
                break;
        }
        drawScene();
    });

    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
}

function StartParade() {
    if (paradeRequestID) return;
    paradeActive = true;
    paradePhase = 0;
    
    rightArmAngle = 0;
    leftArmAngle = 0;
    rightLegAngle = 0;
    leftLegAngle = 0;

    function paradeLoop() {
        if (!paradeActive) return;

        if (paradePhase === 0) {
            rightArmAngle = Math.min(90, rightArmAngle + paradeSpeed);
            rightLegAngle = Math.min(90, rightLegAngle + paradeSpeed);
            
            leftArmAngle = Math.max(0, leftArmAngle - paradeSpeed);
            leftLegAngle = Math.max(0, leftLegAngle - paradeSpeed);
            
            if (rightArmAngle >= 90 && rightLegAngle >= 90) {
                paradePhase = 1;
            }
        } else {
            leftArmAngle = Math.min(90, leftArmAngle + paradeSpeed);
            leftLegAngle = Math.min(90, leftLegAngle + paradeSpeed);
            
            rightArmAngle = Math.max(0, rightArmAngle - paradeSpeed);
            rightLegAngle = Math.max(0, rightLegAngle - paradeSpeed);
            
            if (leftArmAngle >= 90 && leftLegAngle >= 90) {
                paradePhase = 0;
            }
        }
        
        drawScene();
        paradeRequestID = requestAnimationFrame(paradeLoop);
    }
    
    paradeLoop();
}

function StopParade() {
    paradeActive = false;
    if (paradeRequestID) {
        cancelAnimationFrame(paradeRequestID);
        paradeRequestID = 0;
    }
}

function Reset () {
    rightArmAngle = 0;
    leftArmAngle = 0;
    rightLegAngle = 0;
    leftLegAngle = 0;
    headAngle = 0;
    drawScene();
}

// main
function main() {
    canvas = document.getElementById("sceneCanvas");
    if (!canvas) {
        alert("Canvas element not found!");
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = createRenderingContext(canvas);
    if (!gl) {
        return;
    }

    if (!initShaders()) {
        return;
    }

    initBuffers();
    initMatrices();
    drawScene();

    MouseClickHandler();
}