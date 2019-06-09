const generateMessage = (text, username) => {
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (location) => {
    return {
        link: location,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}