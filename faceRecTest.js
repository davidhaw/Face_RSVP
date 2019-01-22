
const fr = require('face-recognition')
const path = require('path')
const fs = require('fs')
var l = 100;

function get_Image_Filepaths (base_path, limit) {

    var filePaths = [];
    var i;
    for(i=1; i<=limit; i++) {

        var uncompleteIdString = ['0', '0', '0', '0'];
        var idLength = i.toString().length;
        var c;
        for (c=0; c<idLength; c++){
            uncompleteIdString.pop();

        }

    var idSnippetList = i.toString().split('');
    var almostCompleteIdString = uncompleteIdString.concat(idSnippetList);
    var completeIdString = almostCompleteIdString.join('');

    filePaths.push(base_path + completeIdString + '.jpg');
    }
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

function recognizeFaces(trainFaces, predictFaces) {
    const recognizer = fr.FaceRecognizer();
    recognizer.addFaces(trainFaces, 'Bill_Clinton', 15)
    const predictions = recognizer.predict(predictFaces[0])
    console.log(predictions);
    return recognizer;
}

function seperateDetectedFaces (detectFaces) {
    var detected1 = detectFaces.splice(0, Math.floor(detectFaces.length / 2));
    var detected2 = detectFaces;
    return {
        trainFaces: detected1,
        testFaces: detected2
    };
}

function saveJSON (recognizer) {
    
    const modelState = recognizer.serialize();
    fs.writeFileSync('model.json', JSON.stringify(modelState));
    
}


const image1 = fr.loadImage('Ryder/Winona_Ryder_0002.jpg')
const baseImageP = 'George_W_Bush/George_W_Bush_';

console.log(filePaths);

var filePaths = get_Image_Filepaths(baseImageP, 100);
var loadedImages = loadImages(filePaths);
var detectedFaceImages = detectFaces(loadedImages);

console.log(detectedFaceImages);

var jsonFaces = seperateDetectedFaces(detectedFaceImages);

var rec = recognizeFaces(jsonFaces.trainFaces, jsonFaces.testFaces);
saveJSON(rec);
console.log("Success!");