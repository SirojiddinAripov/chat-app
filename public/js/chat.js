const socket = io()

const textBox = document.querySelector('#textBox')
const enter = document.querySelector('#enter')
const locationButton = document.querySelector('#shareLocation')
const message_area = document.querySelector('#message-area')
const sideBar = document.querySelector('#sideBar')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sideBarTemplate').innerHTML

const { username, roomID } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //New message 
    const newMessage = message_area.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = message_area.offsetHeight

    //Height of messages container 
    const contentHeight = message_area.scrollHeight

    //How far to scroll
    const scrollOffSet = message_area.scrollTop + visibleHeight

    if (contentHeight - newMessageHeight - 20 <= scrollOffSet)
        message_area.scrollTop = message_area.scrollHeight
}

socket.on('message', (message, isProfane) => {
    console.log(isProfane)
    const html = Mustache.render(messageTemplate, {
        username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h : mm A')
    })
    message_area.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location, username) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username,
        link: location.link,
        createdAt: moment(location.createdAt).format('h : mm A')
    })
    message_area.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('usersInChat', ({ roomID, users }) => {
    setTimeout(() => {
        const html = Mustache.render(sideBarTemplate, {
            roomID,
            users
        })
        sideBar.innerHTML = html
    }, 1000)
})

document.querySelector('#send-message').addEventListener('submit', (e) => {
    e.preventDefault()
    const message = textBox.value

    textBox.disabled = true
    enter.disabled = true

    if (message === '') {
        textBox.disabled = false
        enter.disabled = false
        textBox.focus()

        return alert(`You can't send empty messages`)
    }
    socket.emit('sendMessage', message, (err) => {
        if (err) {
            return alert(err)
        }
        textBox.disabled = false
        enter.disabled = false
        textBox.focus()
        console.log('Message sent')
    })
    textBox.value = ''
})

locationButton.addEventListener('click', async () => {
    locationButton.disabled = true
    if (!navigator.geolocation)
        alert('This web browser does not support geolocation features')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (err) => {
            if (err) {
                return alert(err)
            }
            locationButton.disabled = false
            console.log('Location Sent \n"Note that your location is not exact"')
        })
    })
})

socket.emit('join', { username, roomID }, (err) => {
    if (err) {
        alert(err)
        window.location.href = '/'
    }
})