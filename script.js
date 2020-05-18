var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
  add_game_pad(e.gamepad);
}

function add_game_pad(gamepad) {
  controllers[gamepad.index] = gamepad;
  var controller_select = document.getElementById("controller_select");
  var option = document.createElement("option")
  option.innerHTML = gamepad.id
  option.value = gamepad.index
  option.id = "controller" + gamepad.index
  controller_select.appendChild(option)
}

function display_game_pad(gamepad) {
  var gamepad_display = document.getElementById("gamepad_display");
  gamepad_display.setAttribute("id", "controller" + gamepad.index);

  var gamepad_name = document.getElementById("gamepad_name");
  gamepad_name.innerHTML = "gamepad: " + gamepad.id

  axis_display = document.getElementById("axis_display");

  for (var i = 0; i < gamepad.axes.length; i++) {
    var channel_div = document.createElement("div");
    channel_div.id = "channel_div" + String(i+1)
    var label = document.createElement("h3");
    label.innerHTML = "channel " + String(i+1)
    var progress = document.createElement("progress");
    progress.className = "axis";
    progress.setAttribute("max", "2");
    progress.setAttribute("value", "1");
    //progress.innerHTML = i;
    channel_div.appendChild(label);
    channel_div.appendChild(progress);
    axis_display.appendChild(channel_div);
  }
  requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
  remove_game_pad(e.gamepad);
}

function remove_game_pad(gamepad) {
  var controller_select = document.getElementById("controller_select");
  var option = document.getElementById("controller" + gamepad.index);
  controller_select.removeChild(option);
  delete controllers[gamepad.index];
}

function updateStatus() {
  if (!haveEvents) {
    scangamepads();
  }

  var i = 0;
  var j;
  //make single controller static, not for loop. Make dropdown selection possibly if feeling fancy pants
  for (j in controllers) {
    var controller = controllers[j];
    var gamepad_display = document.getElementById("axis_display");

    for (i = 0; i < controller.buttons.length; i++) {
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
    }

    var axes = gamepad_display.getElementsByClassName("axis");
    for (i = 0; i < controller.axes.length; i++) {
      var axis_display = axes[i];
      axis_display.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      axis_display.setAttribute("value", controller.axes[i] + 1);
    }
  }
  requestAnimationFrame(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        add_game_pad(gamepads[i]);
      }
    }
  }
}


function selection_update_handler() {
  var selection = document.getElementById("controller_select").value
  if (selection != "defualt_option") {
    console.log(selection)
  }
}


window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);
document.getElementById("controller_select").addEventListener("change", selection_update_handler());

if (!haveEvents) {
  setInterval(scangamepads, 500);
}