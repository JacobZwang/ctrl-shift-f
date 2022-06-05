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
						onInput={(e) => {
							search = e.target.value;
							if (search.length < 1) return;

							const req = window.indexedDB.open("cache-search", 3);
							req.onsuccess = (event) => {
								const db = event.target.result;
								const transaction = db.transaction(["pages"], "readwrite");
								const store = transaction.objectStore("pages");
								results = [];
								setResults([]);
								store.openCursor().onsuccess = (event) => {
									const cursor = event.target.result;
									setResults([
										...results,
										...Array.from(
											cursor.value.text.matchAll(new RegExp(search, "g"))
										)?.map((match) => ({
											path: cursor.value.path,
											contextBefore: cursor.value.text.substring(
												match.index - 50,
												match.index
											),
											contextAfter: cursor.value.text.substring(
												match.index + search.length + 1,
												match.index + search.length + 51
											)
										}))
									]);
								};
							};
						}}
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
						{results.map((result) => (
							<a
								href={result.path}
								style={{
									textDecoration: "none",
									display: "block",
									width: "100%",
									padding: "0.25rem",
									borderBottom: "1px solid grey",
									fontSize: "0.75rem",
									color: "grey"
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
					</div>
				</div>
			);
		};

		ReactDOM.render(<SearchUI />, root);
	})();
})();
