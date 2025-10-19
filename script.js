(function () {
  "use strict";
  function downloadCanvas(canvas, filename) {
    try {
      const link = document.createElement("a");
      link.download = filename;

      link.href = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");

      document.body.appendChild(link);

      link.click();

      // Clean up and remove the link
      document.body.removeChild(link);

      console.log(`Successfully triggered download for: ${filename}`);
    } catch (e) {
      console.error(`Failed to download ${filename}:`, e);
    }
  }

  const allPages = document.querySelectorAll(".-cv-page");

  if (allPages.length === 0) {
    console.warn(
      'Tampermonkey script: No elements with class ".-cv-page" found.'
    );
    return;
  }

  console.log(`Observer activated. Watching ${allPages.length} page elements.`);

  const observerCallback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const targetDiv = mutation.target;

        const isLoaded = targetDiv.classList.contains("mode-loaded");
        const isRendered = targetDiv.classList.contains("mode-rendered");

        const alreadyDownloaded = targetDiv.dataset.downloaded === "true";

        if (isLoaded && isRendered && !alreadyDownloaded) {
          targetDiv.dataset.downloaded = "true";

          const canvas = targetDiv.querySelector("canvas");

          if (canvas) {
            const divIndex = Array.from(allPages).indexOf(targetDiv);
            const filename = `image - ${divIndex}.png`;
            downloadCanvas(canvas, filename);
          } else {
            console.warn(
              `Rendered div (index ${divIndex}) has no canvas. Retrying...`
            );
            targetDiv.dataset.downloaded = "false";
          }
        }
      }
    }
  };

  const observerConfig = {
    attributes: true,
    attributeFilter: ["class"],
    subtree: false,
  };

  const observer = new MutationObserver(observerCallback);

  allPages.forEach((pageDiv) => {
    observer.observe(pageDiv, observerConfig);
  });
})();
