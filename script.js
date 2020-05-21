var haveEvents = 'ongamepadconnected' in window;
var controllers = {};
var selected_controller_index = "";
var run_animation_loop = false;
var axes_display = document.getElementById("axes_display");

//controller.id is not supported on safari, make compatablity replacement

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
  //auto switches to newly connected game pad if none is currently selected
  if (controller_select.value == "") {
    controller_select.value = gamepad.index;
    selection_update_handler()
  }
}

function display_game_pad() {
  var controller = controllers[selected_controller_index]
  //loop through all axis inputs and create a bar
  for (var i = 0; i < controller.axes.length; i++) {
    var axis_display = document.createElement("div");
    axis_display.className = "axis_display";
    var label = document.createElement("h4");
    label.innerHTML = String(i+1);
    axis_display.appendChild(label);
    var bar_container = document.createElement("div");
    bar_container.className = "bar_container";
    axis_display.appendChild(bar_container);
    var bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = "0%";
    bar.id = "channel_div" + String(i+1);
    bar_container.appendChild(bar);
    axes_display.appendChild(axis_display);
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
    var bars = axes_display.getElementsByClassName("bar");
    //loops through all classes named "bar" within axes_display and updates values
    for (i = 0; i < controller.axes.length; i++) {
      var axis_display = bars[i];
      var percent = controller.axes[i] * 100 / 2 + 50;
      axis_display.innerHTML =  Math.round(percent) + "%";
      axis_display.style.width = percent + "%";
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