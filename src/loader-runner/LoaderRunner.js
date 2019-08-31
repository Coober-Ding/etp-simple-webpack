var loadLoader = function (executer) {
	var _module = executer.module
	if (!_module) {
		throw new Error(executer.name + " not installed")
	}
  executer.normal = _module;
  executer.pitch = _module.pitch;
  executer.raw = _module.raw;
  if(typeof executer.normal !== "function" && typeof executer.pitch !== "function")
    throw new Error("Module '" + executer.name + "' is not a loader (must have normal or pitch function)");
}

// loader构造器
function createLoaderExecuter(loader) {
	var executer = {
		name: loader.name,
    module: loader.module,
		options: loader.options,
		normal: null,
		pitch: null,
		raw: null,
		pitchExecuted: false,
		normalExecuted: false
	};
	// do some copy
	loadLoader(executer)
	return executer;
}

function runSyncOrAsync(fn, context, input, callback) {
	var isSync = true;
	var isDone = false;
	var isError = false; // internal error
	var reportedError = false;
	context.async = function async() {
		if(isDone) {
			if(reportedError) return; // ignore
			throw new Error("async(): The callback was already called.");
		}
		isSync = false;
		return innerCallback;
	};
	var innerCallback = context.callback = function() {
		if(isDone) {
			if(reportedError) return; // ignore
			throw new Error("callback(): The callback was already called.");
		}
		isDone = true;
		isSync = false;
		try {
			callback.apply(null, arguments);
		} catch(e) {
			isError = true;
			throw e;
		}
	};
	try {
		var result = (function LOADER_EXECUTION() {
			return fn.apply(context, [input]);
		}());
		if(isSync) {
			isDone = true;
			if(result === undefined)
				return callback();
			// 处理promise的异步
			if(result && typeof result === "object" && typeof result.then === "function") {
				return result.catch(callback).then(function(r) {
					callback(null, r);
				});
			}
			return callback(null, result);
		}
	} catch(e) {
		if(isError) throw e;
		if(isDone) {
			// loader is already "done", so we cannot use the callback function
			// for better debugging we print the error on the console
			if(typeof e === "object" && e.stack) console.error(e.stack);
			else console.error(e);
			return;
		}
		isDone = true;
		reportedError = true;
		callback(e);
	}

}

function iteratePitchingLoaders(loaderContext, callback) {
	// abort after last loader
	if(loaderContext.loaderIndex >= loaderContext.loaderExecuters.length)
		return processResource(loaderContext, callback);

	var currentLoaderObject = loaderContext.loaderExecuters[loaderContext.loaderIndex];

	// iterate
	if(currentLoaderObject.pitchExecuted) {
		loaderContext.loaderIndex++;
		return iteratePitchingLoaders(loaderContext, callback);
	}

	// load loader module
	loadLoader(currentLoaderObject)
	var fn = currentLoaderObject.pitch;
	currentLoaderObject.pitchExecuted = true;
	if(!fn) return iteratePitchingLoaders(loaderContext, callback);

	runSyncOrAsync(
		fn,
		loaderContext, [],
		function(err, result) {
			if(err) return callback(err);
			if(result) {
				loaderContext.loaderIndex--;
				iterateNormalLoaders(loaderContext, result, callback);
			} else {
				iteratePitchingLoaders(loaderContext, callback);
			}
		}
	);

}

function processResource(loaderContext, callback) {
	// set loader index to last loader
	loaderContext.loaderIndex = loaderContext.loaderExecuters.length - 1;

	var resource = loaderContext.resource;
	if(resource.code) {
		iterateNormalLoaders(loaderContext, resource.code, callback);
	} else {
		iterateNormalLoaders(loaderContext, null, callback);
	}
}

function iterateNormalLoaders(loaderContext, input, callback) {
	if(loaderContext.loaderIndex < 0)
		return callback(null, input);

	var currentLoaderObject = loaderContext.loaderExecuters[loaderContext.loaderIndex];

	// iterate
	if(currentLoaderObject.normalExecuted) {
		loaderContext.loaderIndex--;
		return iterateNormalLoaders(loaderContext, input, callback);
	}

	var fn = currentLoaderObject.normal;
	currentLoaderObject.normalExecuted = true;
	if(!fn) {
		return iterateNormalLoaders(loaderContext, input, callback);
	}

	runSyncOrAsync(fn, loaderContext, input, function(err, result) {
		if(err) return callback(err);
		iterateNormalLoaders(loaderContext, result, callback);
	});
}


function runLoaders(options, callback) {
	// read options
	var resource = options.resource;
	var loaders = options.loaders || [];
	var compileOption = options.compileOption
	var loaderContext = {};

	loaderExecuters = loaders.map(createLoaderExecuter);
	
	loaderContext.loaderIndex = 0;
	loaderContext.loaderExecuters = loaders;
	loaderContext.resource = resource
	loaderContext.async = null;
	loaderContext.callback = null;
	loaderContext.compileOption = compileOption

	iteratePitchingLoaders(loaderContext, function(err, result) {
		if(err) {
			return callback(err);
		}
		callback(null, result);
	});
};

module.exports.runLoaders = runLoaders