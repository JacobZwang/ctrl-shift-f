import React from "react";
import ReactDOM from "react-dom";

(async function () {
	const pageSearchParams = Object.fromEntries(
		new URLSearchParams(document.location.search).entries()
	);
	const pagePath = document.location.pathname;
	const pageText = document.body.innerText.replace(/\s+/g, " ").trim();

	// add current page to store
	(function () {
		const req = window.indexedDB.open("cache-search", 3);
		req.onupgradeneeded = (event) => {
			const db = event.target.result;
			const store = db.createObjectStore("pages", { keyPath: "path" });
			store.add({
				path: pagePath,
				text: pageText
			});
		};

		req.onsuccess = (event) => {
			const db = event.target.result;
			const transaction = db.transaction(["pages"], "readwrite");
			const store = transaction.objectStore("pages");
			store.add({
				path: pagePath,
				text: pageText
			});
		};
	})();

	// ui for search input and results
	(function () {
		const shadowElement = document.createElement("div");
		document.body.appendChild(shadowElement);
		let shadow = shadowElement.attachShadow({ mode: "open" });

		let root = document.createElement("div");
		shadow.appendChild(root);

		let search = "";

		const SearchUI = () => {
			let [results, setResults] = React.useState([]);

			return (
				<div id="container">
					<input
						onInput={(e) => {
							search = e.target.value;
							results = [];
							if (search.length < 1) {
								setResults([]);
								return;
							}

							const req = window.indexedDB.open("cache-search", 3);
							req.onsuccess = (event) => {
								const db = event.target.result;
								const transaction = db.transaction(["pages"], "readwrite");
								const store = transaction.objectStore("pages");
								store.openCursor().onsuccess = (event) => {
									const cursor = event.target.result;

									results = [
										...results,
										...Array.from(
											cursor.value.text.matchAll(new RegExp(search, "gi"))
										)?.map((match) => ({
											path: cursor.value.path,
											contextBefore: cursor.value.text.substring(
												match.index - 50,
												match.index
											),
											contextAfter: cursor.value.text.substring(
												match.index + search.length,
												match.index + search.length + 50
											)
										}))
									];
									setResults(results);
									cursor.continue();
								};
							};
						}}
					/>
					<div id="results">
						{results.map((result, i) => (
							<a href={result.path}>
								<span
									style={{
										display: "block",
										color: "blue",
										textDecoration: "underline"
									}}
								>
									<span style={{ opacity: 0.25 }}>{window.origin}</span>
									{result.path}
								</span>
								{result.contextBefore}
								<span style={{ color: "black", fontWeight: "bold" }}>{search}</span>
								{result.contextAfter}
							</a>
						))}
					</div>
				</div>
			);
		};

		ReactDOM.render(<SearchUI />, root);

		const style = document.createElement("style");
		shadow.appendChild(style);
		const css = String.raw;
		style.textContent = css`
			a {
				text-decoration: none;
				display: block;
				width: 100%;
				padding: 0.5em;
				border-bottom: 1px solid #d0d0d0;
				font-size: 0.85em;
				color: grey;
				box-sizing: border-box;
				padding-right: 1.15em;
				padding-left: 1.15em;
				outline: none;
			}

			a:last-child {
				border-bottom: none;
			}

			a:focus {
				background-color: #efefff;
			}

			a:hover {
				background-color: #e8e8ff;
			}

			#container {
				font-size: 14px;
				position: fixed;
				width: 35em;
				left: 50vw;
				transform: translateX(-50%);
				top: 0;
				z-index: 10000;
				box-sizing: border-box;
				border-radius: 3pt;
				box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
				overflow: hidden;
				background-color: #f7f7f7;
			}

			#results {
				max-height: 16em;
				overflow-y: scroll;
				overscroll-behavior: contain;
			}

			input {
				width: 100%;
				box-sizing: border-box;
				background-color: white;
				border: none;
				outline: none;
				line-height: 1;
				font-size: 1em;
				padding: 1.15em;
				border-radius: 3pt;
				color: black;
			}
		`;
	})();
})();
