(async function () {
	// retrieve all cache from storage
	const cache = await new Promise((resolve, reject) => {
		/* Cache from all pages is compressed together for smallest total size.
        It is equally split across all keys to avoid max key size limitation. */

		chrome.storage.sync.get(null, (items) => {
			// this is how documentation says to detect errors
			// https://developer.chrome.com/docs/extensions/reference/storage/#asynchronous-preload-from-storage
			if (chrome.runtime.lastError) {
				throw new Error("could not cache page", {
					cause: chrome.runtime.lastError
				});
			}

			resolve(Object.values(items).join(""));
		});
	}).then((data) => JSON.parse(data || "{}")); // TODO: un-compress data

	const pageSearchParams = Object.fromEntries(
		new URLSearchParams(document.location.search).entries()
	);
	const pagePath = document.location.pathname;
	const pageText = document.body.innerText.replace(/\s+/g, " ").trim();

	// ui for search input and results
	(function () {
		const shadowElement = document.createElement("div");
		document.body.appendChild(shadowElement);
		let shadow = shadowElement.attachShadow({ mode: "open" });

		const containerElement = document.createElement("div");
		shadow.appendChild(containerElement);
		Object.assign(containerElement.style, {
			position: "fixed",
			width: "20rem",
			backgroundColor: "white",
			left: "50vw",
			transform: "translateX(-50%)",
			top: "0",
			zIndex: "10000",
			padding: "0.5rem",
			boxSizing: "border-box"
		});

		const inputElement = document.createElement("input");
		containerElement.appendChild(inputElement);
		Object.assign(inputElement.style, {
			width: "100%",
			boxSizing: "border-box"
		});

		const resultsElement = document.createElement("div");
		Object.assign(resultsElement.style, {
			maxHeight: "8rem",
			overflowY: "scroll"
		});
		containerElement.appendChild(resultsElement);

		inputElement.addEventListener("input", (e) => {
			if (e.target.value.length < 1) return;

			resultsElement.innerHTML = "";
			const matches = Array.from(pageText.matchAll(new RegExp(e.target.value, "g"))).forEach(
				(match) => {
					const link = document.createElement("a");
					resultsElement.appendChild(link);
					link.innerText = pageText.substring(match.index - 25, match.index + 25);
					Object.assign(link.style, {
						display: "block",
						width: "100%",
						padding: "0.25rem",
						borderBottom: "1px solid grey"
					});
				}
			);
		});
	})();
})();
