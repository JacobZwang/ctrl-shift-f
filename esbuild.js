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
		if (fs.existsSync("./ctrl-shift-f-bundle")) {
			fs.rmSync("./ctrl-shift-f-bundle", {
				recursive: true
			});
		}

		fs.mkdirSync("./ctrl-shift-f-bundle", {});
		fs.copyFileSync("./index.js", "./ctrl-shift-f-bundle/index.js");
		fs.copyFileSync("./popup.html", "./ctrl-shift-f-bundle/popup.html");
		fs.copyFileSync("./manifest.json", "./ctrl-shift-f-bundle/manifest.json");
	});
