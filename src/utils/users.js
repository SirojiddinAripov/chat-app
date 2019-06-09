const users = []
const Filter = require('bad-words')

const addUser = ({ id, username, roomID }) => {
    const filter = new Filter()
    if(filter.isProfane(username)){
        return {
            err: 'Profane language is not allowed'
        }
    }
    //Clean the data 
    displayName =username.trim()
    username = username.trim().toLowerCase()
    

    //validate
    if (!username || !roomID) {
        return {
            err: 'username or roomID not provided'
        }
    }
    //Check for existing user
    const existingUser = users.find((user) => {
        return user.roomID === roomID && user.username === username
    })
    //Validate username
    if (existingUser) {
        return {
            err: 'Username is taken'
        }
    }
    //Store User
    const user = { id, username, displayName, roomID }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInChat = (roomID) => {
    return users.filter((user) => user.roomID === roomID)
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInChat
}