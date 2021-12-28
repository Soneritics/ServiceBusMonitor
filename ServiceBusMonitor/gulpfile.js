/// <binding BeforeBuild='build' Clean='clean' />
const { src, dest } = require("gulp");
const del = require("del");

const nodeRoot = "./node_modules";
const targetPath = "./wwwroot/lib";

function clean(cb) {
    del([targetPath + "/**/*"]);
    cb();
}

function build(cb) {
    src(nodeRoot + "/bootstrap/dist/js/*").pipe(dest(targetPath + "/bootstrap/js"));
    src(nodeRoot + "/bootstrap/dist/css/*").pipe(dest(targetPath + "/bootstrap/css"));
    src(nodeRoot + "/bootstrap/dist/fonts/*").pipe(dest(targetPath + "/bootstrap/fonts"));

    src(nodeRoot + "/jquery/dist/jquery.min.js").pipe(dest(targetPath + "/jquery"));

    src(nodeRoot + "/file-saver/dist/FileSaver.min.js").pipe(dest(targetPath + "/file-saver"));

    cb();
}

exports.build = build;
exports.clean = clean;
