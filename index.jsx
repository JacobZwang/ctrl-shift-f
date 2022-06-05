import React from "react";
import ReactDOM from "react-dom";

(async function () {
	const pageSearchParams = Object.fromEntries(
		new URLSearchParams(document.location.search).entries()
	);
	const pagePath = document.location.pathname;
	const pageText = document.body.innerText.replace(/\s+/g, " ").trim();

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
