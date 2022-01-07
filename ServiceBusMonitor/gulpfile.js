/// <binding BeforeBuild='build' Clean='clean' />
const { src, dest } = require("gulp");
const del = require("del");

const nodeRoot = "./node_modules";
const targetPath = "./wwwroot/lib";

function clean(cb) {
    del([
        targetPath + "/**/*",
        "./wwwroot/js/ServiceBusMonitor.js",
        "./wwwroot/js/ServiceBusMonitor.js.map"
    ]);

    cb();
}

function build(cb) {
    src(nodeRoot + "/bootstrap/dist/js/*").pipe(dest(targetPath + "/bootstrap/js"));
    src(nodeRoot + "/bootstrap/dist/css/*").pipe(dest(targetPath + "/bootstrap/css"));
    src(nodeRoot + "/bootstrap/dist/fonts/*").pipe(dest(targetPath + "/bootstrap/fonts"));

    src(nodeRoot + "/jquery/dist/jquery.min.js").pipe(dest(targetPath + "/jquery"));

    src(nodeRoot + "/file-saver/dist/*").pipe(dest(targetPath + "/file-saver"));

    src(nodeRoot + "/@fortawesome/fontawesome-free/js/*").pipe(dest(targetPath + "/fontawesome/js"));
    src(nodeRoot + "/@fortawesome/fontawesome-free/css/*").pipe(dest(targetPath + "/fontawesome/css"));
    src(nodeRoot + "/@fortawesome/fontawesome-free/webfonts/*").pipe(dest(targetPath + "/fontawesome/webfonts"));

    cb();
}

exports.build = build;
exports.clean = clean;
