var haveEvents = 'ongamepadconnected' in window;
var controllers = {};
var selected_controller_index = "";
var run_animation_loop = false;

//controller.id is not supported on safari, make compatablity replacement
//make it auto switch to an input on connection

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
  if (controller_select.value == "") {
    controller_select.value = gamepad.index;
    selection_update_handler()
  }
}

function display_game_pad() {
  var gamepad_display = document.getElementById("gamepad_display");
  axes_display = document.getElementById("axes_display");
  var controller = controllers[selected_controller_index]

  for (var i = 0; i < controller.axes.length; i++) {
    var channel_div = document.createElement("div");
    channel_div.id = "channel_div" + String(i+1)
    var label = document.createElement("h3");
    label.innerHTML = "channel " + String(i+1)
    var progress = document.createElement("progress");
    progress.className = "axis";
    progress.setAttribute("max", "2");
    progress.setAttribute("value", "1");
    channel_div.appendChild(label);
    channel_div.appendChild(progress);
    axes_display.appendChild(channel_div);
  }
  run_animation_loop = true;
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

  var controller = controllers[selected_controller_index];
  if (typeof controller == 'undefined') {
    stop_display()
  }

  if (run_animation_loop){
    var gamepad_display = document.getElementById("axes_display");
    var axes = gamepad_display.getElementsByClassName("axis");

    for (i = 0; i < controller.axes.length; i++) {
      var axes_display = axes[i];
      axes_display.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      axes_display.setAttribute("value", controller.axes[i] + 1);
    }
    requestAnimationFrame(updateStatus);
  }
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

function stop_display() {
  run_animation_loop = false;
  document.getElementById("axes_display").innerHTML = ""
}

function selection_update_handler() {
  var selection = document.getElementById("controller_select").value;
  selected_controller_index = selection;
  if (selection !== "") {
    display_game_pad()
  } else {
    stop_display()
  }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);
document.getElementById("controller_select").addEventListener("change", selection_update_handler);

if (!haveEvents) {
  setInterval(scangamepads, 500);
}