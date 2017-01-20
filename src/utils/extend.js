var _build = function(name, main, extensions) {
  var build = _build,

    builtClass = build._ctor(main, cfg),
    buildCfg = build._cfg(main, cfg, extensions),

    _mixCust = build._mixCust,

    dynamic = builtClass._yuibuild.dynamic,

    i, l, extClass, extProto,
    initializer,
    destructor;

  // Augment/Aggregate
  for (i = 0, l = extensions.length; i < l; i++) {
    extClass = extensions[i];

    extProto = extClass.prototype;

    initializer = extProto[INITIALIZER];
    destructor = extProto[DESTRUCTOR];
    delete extProto[INITIALIZER];
    delete extProto[DESTRUCTOR];

    // Prototype, old non-displacing augment
    Y.mix(builtClass, extClass, true, null, 1);

    // Custom Statics
    _mixCust(builtClass, extClass, buildCfg);

    if (initializer) {
      extProto[INITIALIZER] = initializer;
    }

    if (destructor) {
      extProto[DESTRUCTOR] = destructor;
    }

    builtClass._yuibuild.exts.push(extClass);
  }

  if (px) {
    Y.mix(builtClass.prototype, px, true);
  }

  if (sx) {
    Y.mix(builtClass, build._clean(sx, buildCfg), true);
    _mixCust(builtClass, sx, buildCfg);
  }

  builtClass.prototype.hasImpl = build._impl;

  if (dynamic) {
    builtClass.NAME = name;
    builtClass.prototype.constructor = builtClass;

    // Carry along the reference to `modifyAttrs()` from `main`.
    builtClass.modifyAttrs = main.modifyAttrs;
  }

  return builtClass;
};
module.exports = _build;
