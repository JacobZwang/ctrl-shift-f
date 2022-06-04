(async function () {
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

	inputElement.addEventListener("input", (e) => {
		console.log(e.target.value);
	});

	const pageSearchParams = Object.fromEntries(
		new URLSearchParams(document.location.search).entries()
	);
	const pagePath = document.location.pathname;
	const pageText = document.body.innerText;

	let search = "jacob";
	const matches = Array.from(pageText.matchAll(new RegExp(search, "g"))).forEach((match) => {
		console.log(match);
	});

	const storage = chrome.storage.sync;

	// retrieve all cache from storage
	const cache = await new Promise((resolve, reject) => {
		/* Cache from all pages is compressed together for smallest total size.
        It is equally split across all keys to avoid max key size limitation. */

		storage.get(null, (items) => {
			// this is how documentation says to do detect errors.
			// https://developer.chrome.com/docs/extensions/reference/storage/#asynchronous-preload-from-storage
			if (chrome.runtime.lastError) {
				throw new Error("could not cache page", {
					cause: chrome.runtime.lastError
				});
			}

			resolve(Object.values(items).join(""));
		});
	});
	// .then((data) => JSON.parse(data)); // TODO: un-compress data
})();
