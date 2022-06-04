import esbuild from "esbuild";

esbuild.build({
	entryPoints: ["index.jsx"],
	outfile: "index.js",
	bundle: true,
	minify: true
});
