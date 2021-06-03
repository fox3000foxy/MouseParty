const displayCursorContainer = document.querySelector('.cursor-container');
const userList = document.querySelector('.users');

const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// User joins
socket.emit('join', { username });

// Listen for mouse position
displayCursorContainer.addEventListener('pointermove', e => {
  const mousePos = {
    x: e.pageX / document.documentElement.clientWidth,
    y: e.pageY / document.documentElement.clientHeight
  };

  // Emit mouse position to server
  socket.emit('mousePos', mousePos);
});

// Get joined users
socket.on('joinedUsers', ({ users }) => {
  users.forEach(user => {
    displayCursor(user.username, user.id);
    outputUsername(user.username);
  });
});

// Get new user
socket.on('newUser', user => {
  displayCursor(user.username, user.id);
  outputUsername(user.username);
});

// Mouse position from server
socket.on('mousePos', ({ mousePos, id }) => {
  console.log(mousePos, id);
  updateCursorPos(mousePos, id);
});

// User leave
socket.on('userLeave', ({ username, id }) => {
  document.getElementById(id).remove();
  document.getElementById(username).remove();
  if (!userList.children) {
    userList.style.display = 'none';
  }
});

// Display cursor
function displayCursor(username, id) {
	if(username=="server") return;
  const [r, g, b] = randomColor();

  const div = document.createElement('div');
  div.id = id;
  div.classList.add('cursor');
  div.innerHTML = `
  <img src="cursor.png" style="width:16px;height:16px"></img>
  <div></div>
  `;
  // <div class="username">${username}</div>
  div.children[0].style.stroke = `rgba(${r}, ${g}, ${b})`;
  div.children[1].style.background = `rgba(${r}, ${g}, ${b}, 0.7)`;
  displayCursorContainer.appendChild(div);
}

// Update cursor position
function updateCursorPos(pos, id) {
  const div = document.getElementById(id);
  if (div) {
    div.style.left = `${pos.x * document.documentElement.clientWidth}px`;
    div.style.top = `${pos.y * document.documentElement.clientHeight}px`;
  }
}

// Output usernames
function outputUsername(username) {
  const [r, g, b] = randomColor();
  const li = document.createElement('li');
  li.id = username;
  li.classList.add('user-icon');
  li.style.background = `rgba(${r}, ${g}, ${b})`;
  li.style.display = `none`;
  li.innerText = username[0];
  userList.appendChild(li);
  userList.style.display = 'flex';
}

// Generate random color
function randomColor() {
  return [
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)
  ];
}
