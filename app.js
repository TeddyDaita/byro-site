// Retire the previous marketplace's hash routes without breaking saved links.
(() => {
  function redirectRetiredRoute() {
    const route = location.hash;
    if (!route.startsWith("#/")) return;
    const path = route.slice(2).split("?")[0];
    const section = /^(about|careers|press)$/.test(path)
      ? "about"
      : /^(sell|industrial|api)$/.test(path)
        ? "manufacturers"
        : /^(support|account|cart|checkout|order-confirmed|app)$/.test(path)
          ? "contact"
          : path
            ? "approach"
            : "top";
    history.replaceState(
      null,
      "",
      location.pathname + location.search + "#" + section,
    );
    const target = document.getElementById(section);
    if (target) target.scrollIntoView({ behavior: "instant" });
  }
  redirectRetiredRoute();
  window.addEventListener("hashchange", redirectRetiredRoute);
})();
