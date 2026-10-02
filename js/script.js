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

/* ----------------------------------------------------------------------
   RESEARCH THEMES

   The five panels on research.html, in the order their buttons appear
   there. The drawer menu on a phone lists them under Research, so the
   names have to be kept in step with that page -- it is the one list to
   edit when a theme is added, renamed or reordered.
   ---------------------------------------------------------------------- */
var RESEARCH_THEMES = [
  "Cultural Evolutionary Psychology",
  "Scale, Threat, and Strong Social Norms",
  "Social Cognition in Societies of Strangers",
  "Persistent Diversity in a Globalized World",
  "Algorithm-Mediated Cultural Evolution"
];

// "Scale, Threat, and Strong Social Norms" -> "scale-threat-and-strong-social-norms"
function themeSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

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

/* On a phone the menu is a panel that slides in from the right, over the page.
   It is built here and appended to <body> rather than written into 26 files.
   Body, specifically: the header carries a backdrop-filter, and that makes it
   the containing block for any fixed-position child, so a panel built inside
   it would be trapped in the header's own 82 pixels instead of covering the
   screen. The header keeps its own link list for the wide layout. */
function initNavToggle() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  var drawer = document.createElement("nav");
  drawer.className = "nav-drawer";
  drawer.setAttribute("aria-label", "Primary");

  var close = document.createElement("button");
  close.type = "button";
  close.className = "nav-close";
  close.setAttribute("aria-label", "Close navigation");
  drawer.appendChild(close);

  // Copied after setActiveNavLink() has run, so the current page is marked
  // here too.
  var onResearch = false;
  var themeLinks = null;

  var list = document.createElement("ul");
  nav.querySelectorAll("a").forEach(function (link) {
    var href = link.getAttribute("href");
    var item = document.createElement("li");
    var copy = document.createElement("a");
    copy.href = href;
    copy.textContent = link.textContent;
    if (link.classList.contains("active")) { copy.classList.add("active"); }
    copy.addEventListener("click", function () { setOpen(false); });
    item.appendChild(copy);

    // The research themes hang under Research here rather than standing in a
    // list on the page itself, which is where they sat on a phone before.
    if (/research\.html$/.test(href)) {
      var base = href.replace(/#.*$/, "");
      var subs = document.createElement("ul");
      subs.className = "nav-sub";
      RESEARCH_THEMES.forEach(function (name) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = base + "#" + themeSlug(name);
        a.textContent = name;
        a.addEventListener("click", function () { setOpen(false); });
        li.appendChild(a);
        subs.appendChild(li);
      });
      item.appendChild(subs);
      onResearch = copy.classList.contains("active");
      themeLinks = subs.querySelectorAll("a");
    }

    list.appendChild(item);
  });
  drawer.appendChild(list);

  var backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";

  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);

  /* Which theme is showing changes without the page reloading: a tap on a
     theme here is a jump to a fragment of the page already open. Marking the
     list once while building it left the highlight on whichever theme the
     address carried when the page first loaded. */
  function markTheme() {
    if (!onResearch || !themeLinks) { return; }
    var want = window.location.hash.replace(/^#/, "");
    themeLinks.forEach(function (a, i) {
      var slug = a.getAttribute("href").split("#")[1];
      // With no fragment the page shows the first panel, so mark that one.
      a.classList.toggle("active", want ? slug === want : i === 0);
    });
  }

  function setOpen(open) {
    if (open) { markTheme(); }
    drawer.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  window.addEventListener("hashchange", markTheme);
  markTheme();

  toggle.addEventListener("click", function () {
    setOpen(!drawer.classList.contains("open"));
  });

  close.addEventListener("click", function () { setOpen(false); });
  backdrop.addEventListener("click", function () { setOpen(false); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setOpen(false); }
  });
}

function initTabs() {
  var tabGroups = document.querySelectorAll("[data-tabs]");

  tabGroups.forEach(function (group) {
    var buttons = group.querySelectorAll(".tab-btn");
    var panelWrapper = document.querySelector(group.getAttribute("data-tabs"));
    if (!panelWrapper) return;
    var panels = panelWrapper.querySelectorAll(".tab-panel");

    function show(index, writeHash) {
      buttons.forEach(function (b) { b.classList.remove("active"); });
      panels.forEach(function (p) { p.classList.remove("active"); });
      if (buttons[index]) { buttons[index].classList.add("active"); }
      if (panels[index]) { panels[index].classList.add("active"); }
      // The address bar follows, so a theme can be linked to and reloaded.
      if (writeHash && buttons[index] && window.history.replaceState) {
        window.history.replaceState(null, "",
          "#" + themeSlug(buttons[index].textContent));
      }
    }

    buttons.forEach(function (btn, index) {
      btn.addEventListener("click", function () { show(index, true); });
    });

    // A theme named in the URL opens instead of the first one. This is how the
    // drawer menu reaches a panel from another page.
    function fromHash() {
      var want = window.location.hash.replace(/^#/, "");
      if (!want) { return; }
      for (var i = 0; i < buttons.length; i++) {
        if (themeSlug(buttons[i].textContent) === want) { show(i, false); return; }
      }
    }

    fromHash();
    window.addEventListener("hashchange", fromHash);
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
