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
						fontSize: "14px",
						position: "fixed",
						width: "30em",
						left: "50vw",
						transform: "translateX(-50%)",
						top: "0",
						zIndex: "10000",
						boxSizing: "border-box",
						borderRadius: "3pt",
						boxShadow: "0 2px 4px 0 rgba(0,0,0,0.2)",
						overflow: "hidden",
						backgroundColor: "#f7f7f7"
					}}
				>
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
						style={{
							width: "100%",
							boxSizing: "border-box",
							backgroundColor: "white",
							border: "none",
							outline: "none",
							lineHeight: "1",
							fontSize: "1em",
							padding: "1.15em",
							borderRadius: "3pt",
							color: "black"
						}}
					/>
					<div
						style={{
							maxHeight: "16em",
							overflowY: "scroll",
							overscrollBehavior: "contain"
						}}
					>
						{results.map((result, i) => (
							<a
								href={result.path}
								style={{
									textDecoration: "none",
									display: "block",
									width: "100%",
									padding: "0.5em",
									borderBottom:
										i - 1 === results.length ? "1px solid grey" : "none",
									fontSize: "0.85em",
									color: "grey",
									boxSizing: "border-box",
									paddingRight: "1.15em",
									paddingLeft: "1.15em"
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
