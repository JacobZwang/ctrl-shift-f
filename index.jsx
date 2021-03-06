import React from "react";
import ReactDOM from "react-dom";

(async function () {
	// if (document.querySelector("[src='./ctrl-shift-f-demo.js']")) return;

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
			store.put({
				path: pagePath,
				text: pageText
			});
		};

		req.onsuccess = (event) => {
			const db = event.target.result;
			const transaction = db.transaction(["pages"], "readwrite");
			const store = transaction.objectStore("pages");
			store.put({
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
			let [open, setOpen] = React.useState(false);
			let [activeIndex, setActiveIndex] = React.useState(0);

			React.useEffect(() => {
				let controlDown = false;
				let shiftDown = false;

				function handleKeyDown(e) {
					if (e.key === "Meta" || e.key === "Control") {
						controlDown = true;
					} else if (e.key === "Shift") {
						shiftDown = true;
					} else if (e.key === "f" || e.key === "F") {
						if (controlDown && shiftDown) {
							e.preventDefault();
							setOpen(true);
							setInputFocus();
						}
					} else if (e.key === "Escape") {
						setOpen(false);
					}
				}
				window.addEventListener("keydown", handleKeyDown);

				function handleKeyUp(e) {
					if (e.key === "Meta" || e.key === "Control") {
						controlDown = false;
					} else if (e.key === "Shift") {
						shiftDown = false;
					}
				}
				window.addEventListener("keyup", handleKeyUp);

				return () => {
					window.removeEventListener("keydown", handleKeyDown);
					window.removeEventListener("keyup", handleKeyDown);
				};
			}, []);

			const useFocus = () => {
				const htmlElRef = React.useRef(null);
				const setFocus = () => {
					htmlElRef.current && htmlElRef.current.focus();
				};

				return [htmlElRef, setFocus];
			};
			const [inputRef, setInputFocus] = useFocus();

			return (
				<div
					id="container"
					style={{
						top: open ? "0" : "-50px"
					}}
				>
					<div id="controller">
						<input
							type="text"
							ref={inputRef}
							onFocus={(e) => {
								setActiveIndex(0);
								e.target.select();
							}}
							onKeyDown={(e) => {
								if (!open) return;
								if (e.key === "Escape") setOpen(false);
								e.stopPropagation();
							}}
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
										if (!cursor) return;

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
						<span
							style={{
								color: "gray",
								display: "inline-flex",
								alignContent: "center"
							}}
						>
							{activeIndex ? (
								<>{activeIndex}/</>
							) : (
								<span
									style={{
										marginRight: "4px",
										whiteSpace: "nowrap"
									}}
								>
									<kbd>tab</kbd>
								</span>
							)}
							{results.length}
						</span>
						<span>
							<button
								tabIndex={-1}
								onClick={() => {
									setOpen(false);
								}}
							>
								???
							</button>
						</span>
					</div>
					<div
						id="results"
						style={{
							maxHeight: open ? "16rem" : "0rem"
						}}
					>
						{results.map((result, i) => (
							<a
								href={result.path}
								onFocus={(e) => {
									setActiveIndex(i + 1);
									e.target.scrollIntoView(true);
								}}
							>
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
						<a
							href="/"
							style={{ height: 0, padding: 0 }}
							onFocus={() => {
								setInputFocus();
							}}
						></a>
					</div>
				</div>
			);
		};

		ReactDOM.render(<SearchUI />, root);

		const style = document.createElement("style");
		shadow.appendChild(style);
		const css = String.raw;
		style.textContent = css`
			* {
				box-sizing: border-box;
				transition: background-color 0.2s ease-in-out;
			}

			kbd {
				// background-color: #e8e8e8;
				padding: 0 0.25em;
				border-radius: 2pt;
				border: 1pt solid #e8e8e8;
			}

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
				text-align: left;
				transition: background-color 0ms;
			}

			a:last-child {
				border-bottom: none;
			}

			a:hover {
				background-color: #f5f5ff;
			}

			a:focus {
				background-color: #efefff;
			}

			#container {
				font-size: 13px;
				position: fixed;
				width: 35em;
				left: 50vw;
				transform: translateX(-50%);
				top: 0;
				z-index: 10000;
				border-radius: 3pt;
				box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
				overflow: hidden;
				background-color: #f7f7f7;
				transition: top 0.1s ease-in-out;
			}

			#results {
				overflow-y: scroll;
				overscroll-behavior: contain;
				transition: max-height 0.2s ease-in-out;
			}

			input {
				width: 100%;
				background-color: white;
				border: none;
				outline: none;
				line-height: 1;
				font-size: 1em;
				padding: 1.15em;
				border-radius: 3pt;
				color: black;
			}

			#controller {
				width: 100%;
				background-color: white;
				display: inline-flex;
				align-items: center;
				gap: 0.5em;
			}

			button {
				background-color: transparent;
				height: 32px;
				width: 32px;
				border-radius: 50%;
				display: block;
				border: none;
				color: black;
				font-size: 14px;
				outline: none;
				margin-right: 0.5rem;
			}

			button:hover,
			button:focus {
				background-color: #e8e8e8;
			}
		`;
	})();
})();
