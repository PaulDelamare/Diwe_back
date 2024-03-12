//Require fs (file system)
const fs = require('fs');
//Require path
const path = require('path');

const uploadImage = (file)=> (pathDirectory)=>{

     //Stock in variable image 
     const uploadedImage = file;

     //get image extension
     const ext = path.extname(uploadedImage.originalname);

     //Rename image for security
     const fileName = `${Date.now()}-${uploadedImage.originalname.toLowerCase().replace(/[^a-z0-9]/g, '')}${ext}`;

     //Create image file path
     const imageFilePath = `${pathDirectory}${fileName}`;

     //Save image in image file path
     fs.writeFileSync(imageFilePath, uploadedImage.buffer);
     
     //Return image file path
     return imageFilePath
}

module.exports = uploadImage