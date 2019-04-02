const fr = require('face-recognition')
const path = require('path')
const fs = require('fs')
var l = 100;

function get_Image_Filepaths (base_path, limit) {

    var filePaths = [];
    var fileNames = fs.readdirSync(base_path);
    for(i=0; i<l; i++) {
        filePaths.push(base_path + fileNames[i]);  
    }
    console.log(filePaths);
    return filePaths;
}

function loadImages(filePaths) {


    var loadedImages = [];

    filePaths.forEach(function(filePath) {
        if (fs.existsSync(filePath)) {
            console.log(filePath);
            console.log(path.resolve(filePath));
            const loadedImage = fr.loadImage(path.resolve(filePath));
            console.log('loaded image');
            loadedImages.push(loadedImage);
        }
    });
    return loadedImages;

}

function detectFaces(loadedImages) {

    const detector = fr.FaceDetector();
    var detectedFaceImages = [];

    loadedImages.forEach(function(loadedImage) {
        const faceImages = detector.detectFaces(loadedImage);
        detectedFaceImages = detectedFaceImages.concat(faceImages);
    });
    return detectedFaceImages;
}

function addFacesToRecognizer(recognizer, detectedFaceImages, name) {
    
    recognizer.addFaces(detectedFaceImages, name, 5);

}

function addFacesToRecByFolder (recognizer, path, name, l) {
    
    let filePaths = get_Image_Filepaths(path, l);
    let loadedImages = loadImages(filePaths);
    let detectedFaceImages = detectFaces(loadedImages);
    addFacesToRecognizer (recognizer, detectedFaceImages, name);
    
}

module.exports.addFacesToRecByFolder = addFacesToRecByFolder;

module.exports.loadImages = loadImages;

module.exports.detectFaces = detectFaces;

module.exports.addFacesToRecognizer = addFacesToRecognizer;
