(async function () {
	const search = Object.fromEntries(new URLSearchParams(document.location.search).entries());
	const path = document.location.pathname;
	const text = document.body.innerText;

	const storage = chrome.storage.sync;

	// retrieve all cache from storage
	const cache = await new Promise((resolve, resolve) => {
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

			resolve(items.values.join(""));
		});
	}).then((data) => JSON.parse(data)); // TODO: un-compress data
})();
