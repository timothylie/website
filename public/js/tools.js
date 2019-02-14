exports.toggleDarkLight = function() {
  var body = document.getElementById("body");
  var currentClass = body.className;
  body.className = currentClass == "dark" ? "light" : "dark";
}

exports.saySomething = "Hello World";
