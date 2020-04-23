module.exports = (imageurl) => {
    return imageurl.split('/')[7].split('.')[0]
}