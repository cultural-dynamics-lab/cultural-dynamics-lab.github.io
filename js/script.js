/* ==========================================================================
   Cultural Dynamics Lab - shared behavior
   - Highlights the active nav link based on current page
   - Toggles the mobile nav (the flexible tab nav collapses on narrow screens)
   - Powers the tab switcher used on the Research page
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  setActiveNavLink();
  initNavToggle();
  initTabs();
  initHometownMap();
});

function setActiveNavLink() {
  // A page in a subfolder (people/shiyun-cao.html) is not named after the nav
  // section it belongs to, and its links are written "../people.html". So let
  // a page name its own section, and compare on file name alone.
  var current = document.body.getAttribute("data-nav") ||
    (window.location.pathname.split("/").pop() || "index.html");
  if (current === "") current = "index.html";

  document.querySelectorAll(".site-nav a").forEach(function (link) {
    var href = (link.getAttribute("href") || "").split("/").pop();
    if (href === current) {
      link.classList.add("active");
    }
  });
}

function initNavToggle() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
    var expanded = nav.classList.contains("open");
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
}

function initTabs() {
  var tabGroups = document.querySelectorAll("[data-tabs]");

  tabGroups.forEach(function (group) {
    var buttons = group.querySelectorAll(".tab-btn");
    var panelWrapper = document.querySelector(group.getAttribute("data-tabs"));
    if (!panelWrapper) return;
    var panels = panelWrapper.querySelectorAll(".tab-panel");

    buttons.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        panels.forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        if (panels[index]) panels[index].classList.add("active");
      });
    });
  });
}

function initHometownMap() {
  var map = document.querySelector("[data-hometown-map]");
  if (!map) return;

  var markers = map.querySelectorAll("[data-map-member]");
  var name = map.querySelector("[data-map-name]");
  var role = map.querySelector("[data-map-role]");
  var location = map.querySelector("[data-map-location]");
  var rosterLink = map.querySelector("[data-map-roster]");
  var select = map.querySelector("[data-map-select]");

  function selectMarker(marker) {
    markers.forEach(function (item) {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    marker.classList.add("active");
    marker.setAttribute("aria-pressed", "true");

    if (name) name.textContent = marker.getAttribute("data-name");
    if (role) role.textContent = marker.getAttribute("data-role");
    if (location) location.textContent = marker.getAttribute("data-location");
    if (rosterLink) rosterLink.setAttribute("href", marker.getAttribute("data-roster"));
    if (select) select.value = marker.id;
  }

  markers.forEach(function (marker) {
    marker.addEventListener("click", function () {
      selectMarker(marker);
    });

    marker.addEventListener("focus", function () {
      selectMarker(marker);
    });

    marker.addEventListener("mouseenter", function () {
      selectMarker(marker);
    });
  });

  if (select) {
    select.addEventListener("change", function () {
      var marker = document.getElementById(select.value);
      if (!marker) return;
      selectMarker(marker);
      marker.focus();
    });
  }

  var initialMarker = map.querySelector(".map-marker.active") || markers[0];
  if (initialMarker) selectMarker(initialMarker);
}
