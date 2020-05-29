// $("#editor").text(`function test(m) {\n\treturn m;\n}\nconsole.log(test("Hello World"));`);
// var editor = ace.edit("editor");
// editor.session.setMode("ace/mode/javascript"); 
// editor.setTheme("ace/theme/dawn"); 
// editor.session.setTabSize(4);
// editor.session.setUseWrapMode(true);

// //ace editor functions
// (function () {
//     default_log = console.log;
//     default_clear = console.clear;
//     default_error = console.error;
//     default_warn = console.warn;

//     console.log = function (...args) {
//         for (let arg of args) {
//             if (typeof arg == 'object') {
//                 $("#console").append((JSON && JSON.stringify ? JSON.stringify(arg, undefined, 2) : arg) + ' ');
//             } else {
//                 $("#console").append(arg + ' ');
//             }
//         }
//         $("#console").append('\n&raquo;  ');
//         $("#console").get(0).scrollTop = $("#console").get(0).scrollHeight; //scrolled down
//         default_log(...args)
//     }
//     console.error = function (e) {
//         $("#console").append("Error: " + e);
//         $("#console").append('\n&raquo;  ');
//         $("#console").get(0).scrollTop = $("#console").get(0).scrollHeight; //scrolled down
//         default_error(e)
//     }
//     console.warn = function (w) {
//         $("#console").append("Warning: " + w);
//         $("#console").append('\n&raquo;  ');
//         $("#console").get(0).scrollTop = $("#console").get(0).scrollHeight; //scrolled down
//         default_warn(w)
//     }
//     console.clear = function () {
//         $("#console").html("&raquo;  ");
//         default_clear();
//     }
//     clear = console.clear;
// })();
// function keyboard(e){
//     if (e.key === "Shift") console.clear();
//     if (e.key === "Enter") eval(editor.getValue());
// }

// window.addEventListener('keydown', function (e) {
//     if (e.key === "Control") window.addEventListener('keydown', keyboard);
// });
// window.addEventListener('keyup', function (e) {
//     if(e.key === "Control") window.removeEventListener('keydown', keyboard);
// })
// $("[action]").get(0).addEventListener('click', function (){ eval(editor.getValue()); });
// $("[action]").get(1).addEventListener('click', function (){ console.clear(); });

// // selects
// var select = document.getElementById("selectLang");
// // language options available
// var options = ["abap", "abc", "actionscript", "ada", "apache_conf", "asciidoc", "assembly_x86", "autohotkey", "batchfile", "c9search", "c_cpp", "cirru", "clojure", "cobol", "coffee", "coldfusion", "csharp", "css", "curly", "d", "dart", "diff", "dockerfile", "dot", "eiffel", "ejs", "elixir", "elm", "erlang", "forth", "ftl", "gcode", "gherkin", "gitignore", "glsl", "golang", "groovy", "haml", "handlebars", "haskell", "haxe", "html", "html_ruby", "ini", "io", "jack", "jade", "java", "javascript", "json", "jsoniq", "jsp", "jsx", "julia", "latex", "less", "liquid", "lisp", "livescript", "logiql", "lsl", "lua", "luapage", "lucene", "makefile", "markdown", "mask", "matlab", "mel", "mushcode", "mysql", "nix", "objectivec", "ocaml", "pascal", "perl", "pgsql", "php", "powershell", "praat", "prolog", "properties", "protobuf", "python", "r", "rdoc", "rhtml", "ruby", "rust", "sass", "scad", "scala", "scheme", "scss", "sh", "sjs", "smarty", "snippets", "soy_template", "space", "sql", "stylus", "svg", "tcl", "tex", "text", "textile", "toml", "twig", "typescript", "vala", "vbscript", "velocity", "verilog", "vhdl", "xml", "xquery", "yaml"];
// // two themes
// var themes = ["light", "dark"];
// // fill language options
// for(var i = 0; i < options.length; i++) {
//     var opt = options[i];
//     var el = document.createElement("option");
//     el.textContent = opt;
//     el.value = opt;
//     select.appendChild(el);
// }
// var select2 = document.getElementById("selectTheme");
// // fill theme options
// for(var i=0; i<themes.length;i++){
//     var opt = themes[i];
//     var el = document.createElement("option");
//     el.textContent = opt;
//     el.value = opt;
//     select2.appendChild(el);
// }

// // set mode depending on selection
// function langSelect(){
//     var val = select.value
//     editor.session.setMode("ace/mode/"+val);
// }

// // set theme depending on selection
// function themeSelect(){
//     var val = select2.value
//     if(val == "dark"){
//         editor.setTheme("ace/theme/ambiance");
//     }
//     else{
//         editor.setTheme("ace/theme/dawn");
//     }
// }
