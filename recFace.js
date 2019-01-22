const fr = require('face-recognition')
const path = require('path')
const fs = require('fs')

const trainer = require('./faceRecTrainer.js')

function get_Image_Filepaths (base_path, startinIndex, limit) {

    var filePaths = [];
    var i;
    for(i=startinIndex; i<=startinIndex+limit; i++) {

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


function predictImages (recognizer, detectedImage){

    var prediction = recognizer.predict(detectedImage);
    console.log(prediction);

}


const recognizer = fr.FaceRecognizer();
//const modelState = require('./model.json');
//recognizer.load(modelState);

function recognizeImages (basePath, l, recognizer) {
    var filePaths = get_Image_Filepaths(basePath, 1, l);
    console.log(filePaths);
    var loadedImages = loadImages(filePaths);
    var detectedFaceImages = detectFaces(loadedImages);
    console.log(detectedFaceImages);
    for (i = 0; i< l; i++ ){
        predictImages(recognizer, detectedFaceImages[i]);
    }
}

trainer.addFacesToRecByFolder(recognizer, './Ryder/', 'Ryder', 20);
trainer.addFacesToRecByFolder(recognizer, './George_W_Bush/', 'George', 20);
recognizeImages('./Ryder/Winona_Ryder_', 20, recognizer);
recognizeImages('./George_W_Bush/George_W_Bush_', 20, recognizer);
