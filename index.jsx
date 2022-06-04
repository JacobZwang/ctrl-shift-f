import React from "react";
import ReactDOM from "react-dom";

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

		let root = document.createElement("div");
		shadow.appendChild(root);

		const SearchUI = () => {
			const [search, setSearch] = React.useState("");

			return (
				<div
					style={{
						position: "fixed",
						width: "20rem",
						backgroundColor: "white",
						left: "50vw",
						transform: "translateX(-50%)",
						top: "0",
						zIndex: "10000",
						padding: "0.5rem",
						boxSizing: "border-box"
					}}
				>
					<input
						onInput={(e) => setSearch(e.target.value)}
						style={{
							width: "100%",
							boxSizing: "border-box"
						}}
					/>
					<div
						style={{
							maxHeight: "8rem",
							overflowY: "scroll"
						}}
					>
						{Array.from(pageText.matchAll(new RegExp(search, "g"))).map((result) => (
							<a
								style={{
									display: "block",
									width: "100%",
									padding: "0.25rem",
									borderBottom: "1px solid grey",
									fontSize: "0.75rem",
									color: "grey"
								}}
							>
								{pageText.substring(result.index - 50, result.index)}
								<span style={{ color: "black", fontWeight: "bold" }}>{search}</span>
								{pageText.substring(
									result.index + search.length,
									result.index + search.length + 50
								)}
							</a>
						))}
					</div>
				</div>
			);
		};

		ReactDOM.render(<SearchUI />, root);
	})();
})();
