const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return { error: "Non-JSON response" };
  }
};

document.querySelectorAll(".try").forEach((block) => {
  const button = block.querySelector(".run-btn");
  const statusBadge = block.querySelector(".status-badge");
  const resultBody = block.querySelector(".result-body");
  const endpoint = block.closest(".endpoint");
  const method = endpoint.querySelector(".method").textContent.trim();
  const rawPath = block.getAttribute("data-path");

  button.addEventListener("click", async () => {
    const params = new URLSearchParams();
    const headers = {};
    let resolvedPath = rawPath;

    block.querySelectorAll("[data-kind][data-name]").forEach((node) => {
      const kind = node.dataset.kind;
      const name = node.dataset.name;
      const value = (
        node instanceof HTMLInputElement ? node.value : node.dataset.value || ""
      ).trim();
      if (!name || !value) return;
      if (kind === "path")
        resolvedPath = resolvedPath.replace("{" + name + "}", value);
      if (kind === "query") params.set(name, value);
      if (kind === "header") headers[name] = value;
    });

    const query = params.toString();
    const url = query ? resolvedPath + "?" + query : resolvedPath;

    statusBadge.textContent = "loading";
    statusBadge.className = "status-badge";
    resultBody.textContent = "Sending request...";

    try {
      const res = await fetch(url, { method, headers });
      const body = await safeJson(res);
      statusBadge.textContent = String(res.status);
      statusBadge.className = "status-badge " + (res.ok ? "ok" : "err");
      resultBody.textContent = JSON.stringify(body, null, 2);
    } catch (error) {
      statusBadge.textContent = "ERR";
      statusBadge.className = "status-badge err";
      resultBody.textContent = JSON.stringify(
        { error: error.message || "Failed request" },
        null,
        2,
      );
    }
  });
});

const animateOpen = (root, body, toggle) => {
  root.classList.add("open");
  toggle.setAttribute("aria-expanded", "true");
  body.style.maxHeight = body.scrollHeight + "px";
  const onEnd = () => {
    if (root.classList.contains("open")) body.style.maxHeight = "none";
    body.removeEventListener("transitionend", onEnd);
  };
  body.addEventListener("transitionend", onEnd);
};

const animateClose = (root, body, toggle) => {
  const current = body.scrollHeight;
  body.style.maxHeight = current + "px";
  requestAnimationFrame(() => {
    root.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    body.style.maxHeight = "0px";
  });
};

document.querySelectorAll(".endpoint").forEach((endpoint) => {
  const toggle = endpoint.querySelector(".endpoint-toggle");
  const body = endpoint.querySelector(".endpoint-body");
  body.style.maxHeight = "0px";

  toggle.addEventListener("click", () => {
    if (endpoint.classList.contains("open")) {
      animateClose(endpoint, body, toggle);
      return;
    }
    animateOpen(endpoint, body, toggle);
  });
});

const closeAllSelects = (except) => {
  document.querySelectorAll(".api-select.open").forEach((select) => {
    if (select === except) return;
    const trigger = select.querySelector(".api-select-trigger");
    select.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  });
};

document.querySelectorAll(".api-select").forEach((root) => {
  const trigger = root.querySelector(".api-select-trigger");
  const text = root.querySelector(".api-select-text");
  const options = root.querySelectorAll(".api-select-option");

  trigger.addEventListener("click", () => {
    const isOpen = root.classList.contains("open");
    closeAllSelects(root);
    root.classList.toggle("open", !isOpen);
    trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const nextValue = option.dataset.value || "";
      root.dataset.value = nextValue;
      text.textContent = option.textContent || "Not set";
      options.forEach((item) => {
        item.classList.toggle("active", item === option);
        item.setAttribute("aria-selected", item === option ? "true" : "false");
      });
      root.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    });
  });
});

document.addEventListener("mousedown", (event) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (target.closest(".api-select")) return;
  closeAllSelects(null);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeAllSelects(null);
});
