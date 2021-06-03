const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const screenshot = require('screenshot-desktop')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// User joins
function userJoin(username, id) {
  const user = { username, id };
  users.push(user);

  return user;
}

// Get users except sender
function getUsers(id) {
  return users.filter(user => user.id !== id);
}

// User leaves
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

app.get('/screen',(req,res)=>{
	screenshot({format: 'png'}).then((img) => {res.send('<img src="data:image/png;base64, '+img.toString('base64')+'" style="position:absolute;left:0;top:0;width:100%;height:100%">')})
})
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  socket.on('join', ({ username }) => {
    const user = userJoin(username, socket.id);

    console.log(user);
    console.log(getUsers(socket.id));
    socket.broadcast.emit('newUser', user);
    socket.emit('joinedUsers', { users: getUsers(socket.id) });
  });

  // Listen for mouse position
  socket.on('mousePos', pos => {
    // Broadcast client's mouse position
    socket.broadcast.emit('mousePos', { mousePos: pos, id: socket.id });
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.emit('userLeave', { username: user.username, id: user.id });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

const users = [];


if (process.argv[0].indexOf("electron")!=-1){
const electron = require('electron');
const appli = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;

function createWindow () {
	
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    icon: './public/favicon.png',
    maximized: true,
    transparent: true,
	frame:false,
	webPreferences : {scrollBounce:false}
});
  mainWindow.loadURL('http://localhost:3000/?username=server'); // on doit charger un chemin absolu
  mainWindow.setIgnoreMouseEvents(true)
  mainWindow.maximize(true)
  mainWindow.setAlwaysOnTop(true)
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

appli.on('ready', createWindow);
appli.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    appli.quit();
  }
});

  appli.on('browser-window-created',function(e,window) {
      window.setMenu(null);
  });
}