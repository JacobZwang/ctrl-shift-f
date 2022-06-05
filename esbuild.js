import esbuild from "esbuild";
import fs from "fs";

esbuild
	.build({
		entryPoints: ["index.jsx"],
		outfile: "index.js",
		bundle: true,
		minify: true
	})
	.then(() => {
		fs.rmSync("./bundle", {
			recursive: true
		});
		fs.mkdirSync("./bundle", {});
		fs.copyFileSync("./index.js", "./bundle/index.js");
		fs.copyFileSync("./popup.html", "./bundle/popup.js");
		fs.copyFileSync("./manifest.json", "./bundle/manifest.json");
	});
