import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
    privateKey: process.env['IMAGEKIT_PRIVATE_KEY'], // This is the default and can be omitted
    publickey: process.env['IMAGEKIT_PUBLIC_KEY'],
    urlEndpoint: process.env['IMAGEKIT_URL_ENDPOINT']
});


export default imagekit;

// const response = await client.files.upload({
//   file: fs.createReadStream('path/to/file'),
//   fileName: 'file-name.jpg',
// });

// console.log(response);