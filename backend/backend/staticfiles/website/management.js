document.addEventListener("DOMContentLoaded", () => {
  const autoBulletFields = new Set(["description", "introduction", "client_organizations"]);

  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const hasListHtml = (value) => /<\/?(ul|ol|li)\b[\s\S]*>/i.test(value);

  const htmlToText = (value) => {
    const container = document.createElement("div");
    container.innerHTML = value || "";
    return container.textContent || "";
  };

  const textToBulletHtml = (value) => {
    const normalized = (value || "").replace(/\r\n/g, "\n").trim();
    if (!normalized) return "";

    const lineParts = normalized
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const parts = lineParts.length > 1
      ? lineParts
      : (normalized.match(/[^.!?。！？]+[.!?。！？]?/g) || [])
          .map((item) => item.trim())
          .filter(Boolean);

    if (parts.length <= 1) return escapeHtml(normalized);
    return `<ul>${parts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  };

  const richTextToBulletHtml = (value) => {
    if (!value || hasListHtml(value)) return value || "";
    return textToBulletHtml(htmlToText(value));
  };

  const sidebar = document.querySelector(".pc-sidebar");
  document.querySelectorAll("#sidebar-hide, #mobile-collapse").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      sidebar?.classList.toggle("is-open");
      document.body.classList.toggle("sidebar-collapsed");
    });
  });

  document.querySelectorAll("[data-bs-dismiss='alert']").forEach((button) => {
    button.addEventListener("click", () => button.closest(".alert")?.remove());
  });

  const profileToggle = document.querySelector(".header-user-profile > .dropdown-toggle");
  profileToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    profileToggle.closest(".header-user-profile")?.classList.toggle("is-open");
  });

  const renderSingleImagePreview = (input, cardSelector, pickerSelector) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const card = input.closest(cardSelector);
      const picker = card?.querySelector(pickerSelector);
      const status = card?.querySelector(".management-logo-file");
      if (!picker) return;

      const previousUrl = picker.dataset.previewUrl;
      if (previousUrl) URL.revokeObjectURL(previousUrl);

      const previewUrl = URL.createObjectURL(file);
      picker.dataset.previewUrl = previewUrl;
      picker.innerHTML = "";

      const image = document.createElement("img");
      image.src = previewUrl;
      image.alt = file.name;
      picker.appendChild(image);

      if (status) status.textContent = file.name;
    });
  };

  document.querySelectorAll(".management-slide-image-card input[type='file']").forEach((input) => {
    renderSingleImagePreview(input, ".management-slide-image-card", ".management-slide-image-picker");
  });

  document.querySelectorAll(".management-logo-card input[type='file']").forEach((input) => {
    renderSingleImagePreview(input, ".management-logo-card", ".management-logo-picker");
  });

  document.querySelectorAll(".management-multi-image-upload input[type='file']").forEach((input) => {
    input.addEventListener("change", () => {
      const grid = input.closest(".management-multi-image-upload")?.querySelector(".management-selected-image-grid");
      if (!grid) return;

      grid.querySelectorAll("[data-preview-url]").forEach((item) => {
        URL.revokeObjectURL(item.dataset.previewUrl);
      });
      grid.innerHTML = "";

      Array.from(input.files || [])
        .filter((file) => file.type.startsWith("image/"))
        .forEach((file) => {
          const previewUrl = URL.createObjectURL(file);
          const card = document.createElement("div");
          card.className = "management-selected-image-card";
          card.dataset.previewUrl = previewUrl;

          const image = document.createElement("img");
          image.src = previewUrl;
          image.alt = file.name;

          const label = document.createElement("span");
          label.textContent = file.name;

          card.appendChild(image);
          card.appendChild(label);
          grid.appendChild(card);
        });
    });
  });

  document.querySelectorAll("textarea.js-richtext").forEach((textarea) => {
    const wrapper = document.createElement("div");
    wrapper.className = "management-richtext";

    const toolbar = document.createElement("div");
    toolbar.className = "management-richtext-toolbar";

    const editor = document.createElement("div");
    editor.className = "management-richtext-editor";
    editor.contentEditable = "true";
    const fieldName = textarea.name.split("-").pop();
    const shouldAutoBullet = autoBulletFields.has(textarea.name) || autoBulletFields.has(fieldName);
    editor.innerHTML = shouldAutoBullet
      ? richTextToBulletHtml(textarea.value || "")
      : textarea.value || "";
    textarea.value = editor.innerHTML;

    const tools = [
      ["bold", "B"],
      ["italic", "I"],
      ["insertUnorderedList", "•"],
      ["insertOrderedList", "1."],
    ];

    tools.forEach(([command, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "management-richtext-button";
      button.textContent = label;
      button.addEventListener("click", () => {
        editor.focus();
        document.execCommand(command, false);
        textarea.value = editor.innerHTML;
      });
      toolbar.appendChild(button);
    });

    const linkButton = document.createElement("button");
    linkButton.type = "button";
    linkButton.className = "management-richtext-button";
    linkButton.textContent = "Link";
    linkButton.addEventListener("click", () => {
      const url = window.prompt("Холбоос оруулна уу");
      if (!url) return;
      editor.focus();
      document.execCommand("createLink", false, url);
      textarea.value = editor.innerHTML;
    });
    toolbar.appendChild(linkButton);

    editor.addEventListener("input", () => {
      textarea.value = editor.innerHTML;
    });
    textarea.form?.addEventListener("submit", () => {
      textarea.value = editor.innerHTML;
    });

    textarea.classList.add("management-richtext-source");
    textarea.parentNode?.insertBefore(wrapper, textarea);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editor);
    wrapper.appendChild(textarea);
  });
});
