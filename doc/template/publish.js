/**
 * Publishing function for JSDOC3
 * 
 */
(function() {

var fs       = require("fs"),
    template = require('jsdoc/template'),
    helper = require('jsdoc/util/templateHelper');

var view = new template.Template(__dirname + "/templates/josm-scripting-plugin/tmpl");
var out = java.lang.System.out;
	
var path = function(components){
	var File = java.io.File;
	switch(arguments.length) {
	case 0: return undefined;
	case 1: return arguments[0];
	default: 
		var file = new File(arguments[0]);
		for (var i=1; i< arguments.length; i++) file = new File(file, arguments[i]);
		return file.toString();
	}
};

function safeHtmlFilename(fn) {
	return fn.replace(/[^a-zA-Z0-9$\-_\.]/g, "_") + ".html";
};

function isString(value) {
	return typeof value === "string" || value instanceof String;
}

function mkdirs(file, parent) {
	var File = java.io.File;
	var f;
	if (isString(file)) {
		f = new File(file);
	} else if (file instanceof File) {
		f = file; 
	} else {
		f = new File(String(file));
	}
	if (!!parent) {
		f = f.getParentFile();
	}
	f.mkdirs();
};

function each(array, delegate) {
	for (var i=0; i<array.length; i++) delegate(array[i], i);
};

function resolveJosmClassReferences(str) {
    var MessageFormat = java.text.MessageFormat;
	str = str.replace(/(?:\[(.+?)\])?\{@josmclass +(.+?)\}/gi,
       function(match, content, longname) {
		  var fqclassname = longname.replace(/\//g, ".");  
		  var classname = fqclassname.replace(/.*\.([^\.]+)$/, "$1"); 
		  var url = "http://josm.openstreetmap.de/doc/" + fqclassname.replace(/\./g, "/") + ".html";
		  content = content || classname;
		  return MessageFormat.format("<a href=''{0}'' alt=''{1}''>{2}</a>", url, fqclassname, content)
       }
    );
    return str;
 };
 
 function resolveLinks(str) {
    if (!str) return str;
    return helper.resolveLinks(
        resolveJosmClassReferences(str) 
    ); 
 };
 
 function resolveType(type) {
	 var URL_PREFIXES = {
		"org.openstreetmap.josm": "http://josm.openstreetmap.de/doc/",
		"java."                 : "http://docs.oracle.com/javase/6/docs/api/",
		"javax.swing."          : "http://docs.oracle.com/javase/6/docs/api/"
	 };
	 function docPrefix(type) {
		 for (var prefix in URL_PREFIXES) {
			 if (type.indexOf(prefix) == 0) return URL_PREFIXES[prefix];
		 }
		 return undefined;
	 }
	 var MessageFormat = java.text.MessageFormat;
	 if (type == null || type == undefined) return type;
	 var types = String(type).split(",");
	 var resolved = [];
	 for (var i=0; i< types.length; i++){
		 var type = types[i];
		 type = type.replace(/^\s+/,"").replace(/\+$/, ""); // trim
		 var prefix = docPrefix(type);
		 if (prefix) {
			 var classname = type.replace(/.*\.([^\.]+)$/, "$1"); 
			 var url = prefix + type.replace(/\./g, "/") + ".html";
			 type = MessageFormat.format("<a href=''{0}'' alt=''{1}''>{2}</a>", url, type, classname)
		 }
		 resolved.push(type);		 
	 }
	 return resolved.join("|"); 
 };

/**
 * Turn the data about your docs into file output.
 * @global
 * @param {TAFFY} data - A TaffyDB collection representing
 *                       all the symbols documented in your code.
 * @param {object} opts - An object with options information.
 */
publish = function(data, opts) {
dump(opts);
	

function publishDoclet(doclet, config) {
	var filepath = path(opts.destination, config.path, safeHtmlFilename(doclet.name));
	mkdirs(filepath, true /* for parent */);
	var fragment = view.render(config.template, {
		doclet: doclet,
	    data: data,
	    resolveJosmClassReferences: resolveJosmClassReferences,
	    resolveType: resolveType,
	    resolveLinks: resolveLinks
	});
	var html = view.render('page.tmpl', {
		title: config.title + " " + doclet.name,
		paths: {
			stylesheets: "http://gubaer.github.com/josm-scripting-plugin/content/stylesheets/",
			javascripts: "http://gubaer.github.com/josm-scripting-plugin/content/javascript/"
		},
		body: fragment
	});
	out.println(config.title + " <" + doclet.name + ">: writing to <" + filepath + ">");
	fs.writeFileSync(filepath, html);
};

function dump(obj) {
	if (!obj) return;
	out.println("***********************************************");
	for (var p in obj) {
		if (! obj.hasOwnProperty(p)) continue;
		out.println(p + "-->" + obj[p]);
	}
}

var mixins = data.get({kind: "mixin"});	
each(mixins, function(mixin) {
	publishDoclet(mixin, {
		title: "Mixin",
		path: "mixins",
		template: 'type.tmpl'
	});
});	   

var classes = data.get({kind: "class"});	
each(classes, function(cls) {
	if (cls.name == cls.memberof) return;
	publishDoclet(cls, {
		title: "Class",
		path: "classes",
		template: 'type.tmpl'
	});
});
var classes = data.get({kind: "namespace"});	
each(classes, function(cls) {
	publishDoclet(cls, {
		title: "Namespace ",
		path: "namespaces",
		template: 'type.tmpl'
	});
});	   

var classes = data.get({kind: "module"});	
each(classes, function(module) {
	publishDoclet(module, {
		title: "Module ",
		path: "modules",
		template: 'module.tmpl'
	});;
});	   


}; // publish
}());
