function navBurger() {
    var e = document.getElementById("navbar");
    if (e.className === "nav") {
      e.className += " responsive";
    } else {
      e.className = "nav";
    }
} 