const cloudinary = require('../config/cloudinary');

function uploadImage(buffer, folder = 'lend-ring/items') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image', transformation: [{ width: 1200, crop: 'limit' }] },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(buffer);
    });
}

module.exports = { uploadImage };