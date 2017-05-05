var Container = function (x) {
    this.__value = x;
};

Container.of = function (x) {
    return new Container(x);
};

// (a -> b) -> Container a -> Container b
Container.prototype.map = function (f) {
    return Container.of(f(this.__value));
};

var Maybe = function (x) {
    this.__value = x;
};

Maybe.of = function (x) {
    return new Maybe(x);
};

Maybe.prototype.isNothing = function (x) {
    return (this.__value === null || this.__value === undefined);
};

// (a -> b) -> Maybe a -> Maybe b
Maybe.prototype.map = function (f) {
    return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value));
};

var Left = function(x) {
    this.__value = x;
};

Left.of = function(x) {
    return new Left(x);
};

Left.prototype.map = function(f) {
    return this;
};

var Right = function(x) {
    this.__value = x;
};

Right.of = function(x) {
    return new Right(x);
};

Right.prototype.map = function(f) {
    return Right.of(f(this.__value));
};

// Each function should return the same type
var Either = R.curry((f, g, e) => {
    switch (e.constructor) {
        case Left:
            return f(e.__value);
        case Right:
            return g(e.__value);
    }
});

var IO = function(f) {
    this.__value = f;

    // its better to assign a more descriptive variable to the value
    // so when the value is returned its clear an impure action is occurring
    this.unsafePerformIO = f;
};

IO.of = function(x) {
    return new IO(function() {
        return x;
    });
};

IO.prototype.map = function(f) {
    return new IO(_.compose(f, this.__value));
};
