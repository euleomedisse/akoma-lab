/* Akoma · página de links: ripple, toque e respeita reduced-motion */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function reduced() {
    return reduce.matches;
  }

  function addRipple(event) {
    if (reduced()) return;
    var btn = event.currentTarget;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.25;
    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = event.clientX - rect.left - size / 2 + "px";
    ripple.style.top = event.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", function () {
      ripple.remove();
    });
  }

  var buttons = document.querySelectorAll(".btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("pointerdown", addRipple);
  }
})();
