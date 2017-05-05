const assert = chai.assert;
const _ = R;

describe('Curry', () => {

    it('can be used to partially apply function calls', () => {
        function curry(fn) {
            const slice = Array.prototype.slice;

            /**
             * get the passed arguments excluding the function itself
             */
            const stored_args = slice.call(arguments, 1);

            /**
             * return a function that gets the new arguments
             * passed to it (with no function parameter), concatenates
             * them with the stored arguments (in a closure), then
             * applies all arguments using the original function
             */
            return function () {
                const new_args = slice.call(arguments);
                const args = stored_args.concat(new_args);

                return fn.apply(null, args);
            };
        }

        const add = (x, y) => x + y;
        const curryAdd = curry(add, 5);
        let result = curryAdd(5);
        assert.equal(result, 10);
    });

    it('can be used with map', () => {
        // by just getting the curried function, it can be applied with any list
        // map accepts a function used to iterate, and an array to iterate over
        const tripleList = _.map(_.multiply(3));
        const result = tripleList([1, 2, 3]);
        assert.deepEqual(result, [3, 6, 9]);
    });

    it('can be used with reduce', () => {
        const greater = function (a, b) {
            return a > b ? a : b;
        };

        /**
         * since reduce takes 3 args, by just passing it 2, you get
         * the curried function back that can later be applied
         */
        const max = _.reduce(greater, Number.NEGATIVE_INFINITY);
        assert.equal(max([1, 7, -1, 3000, 2, 4800]), 4800);
        assert.equal(max([-1, -7, -1000, -3000, -2, -4800]), -1);
    });

    it('can be used to simplify functions and reduce pointing', () => {
        /*
         points basically mean arguments,
         so this kind of programming reduces
         the need to create functions that specifically
         take arguments and do stuff
         */

        // standard function takes an argument and returns something
        const words1 = function (str) {
            return _.split(' ', str);
        };

        // curry function
        const words2 = _.split(' ');

        assert.deepEqual(words1('Mo fo'), ['Mo', 'fo']);
        assert.deepEqual(words2('Mo fo'), ['Mo', 'fo']);

    });

    it('allows forking', () => {

        /*
        fork takes in 2 functions and an argument, uses that argument in each
        function, then passes the result of those to lastly
        */
        const fork = _.curry((lastly, f, g, x) => lastly(f(x), g(x)));

        /*
        so in avg, the function gets the length of the array, gets the sum of the array
        then divides the two
         */
        const avg = fork(_.divide, _.sum, _.length);
        assert.equal(3, avg([1,2,3,4,5]));
    });

    describe('examples', () => {
        it('make split work on an array of strings', () => {
            const words = _.split(' ');

            // map expects a function to use on each element, and an array.
            // words produces an array
            const sentences = _.map(words);

            // should output array of arrays
            const result = sentences(['a b c', 'd e f', 'g h i']);

            assert.deepEqual([
                ['a','b','c'],
                ['d','e','f'],
                ['g','h','i']
            ], result);

        });

        it('refactor function to remove all arguments', () => {
            const filterEven = xs => (
                _.filter(x => x % 2 === 0, xs)
            );
            // curried function doesn't need the array passing in straight away
            const filterEven2 = _.filter(x => x % 2 === 0);

            const result1 = filterEven([1,2,3,4]);
            const result2 = filterEven2([1,2,3,4])
            assert.deepEqual([2,4], result1);
            assert.deepEqual([2,4], result2);
        });

        it('refactor max to remove points', () => {
            const _keepHighest = (x, y) => x >= y ? x : y;

            const max = xs => (
                _.reduce((acc, x) => (
                    _keepHighest(acc, x)
                ), -Infinity, xs)
            );

            // reduce takes 3 params - reduce function, starting value, array
            const max2 = _.reduce((acc, x) => (
                _keepHighest(acc, x)
            ), -Infinity);

            const result1 = max([1,5,3,200,-4]);
            const result2 = max2([1,5,3,2,-4000,6,1,54]);

            assert.equal(200, result1);
            assert.equal(54, result2);

        });

        it('refactor array slice to be functional and curried', () => {
            // //[1, 2, 3].slice(0, 2)
            // should take a start and end
            // const slice = (start, end) => _.slice(start, end);
            const slice5Chars = _.slice(0,5);

            assert.equal('Bobba', slice5Chars('BobbaFett'));

        });
        
        it('extend slice to create "take" function', () => {
            // take accepts a character limit and a string
            const take = _.curry((charLimit, str) => _.slice(0, charLimit, str));

            assert.equal('Sim', take(3)('Simon'));
        });
    });


})

describe('Compose', () => {
    it('allows functions to be combined', () => {
        const toUpperCase = x => x.toUpperCase();
        const exclaim = x => `${x}!`;

        const shout = _.compose(exclaim, toUpperCase);

        assert.equal('HI THERE!', shout('hi there'));
    });

    it('example 2', () => {
        /**
         * this composed function splits words in a string
         * and returns an array of their lengths
         */
        const splitUpper = _.compose(_.map(_.toUpper), _.split(' '));

        assert.deepEqual(splitUpper('mary had a little ramb'), ['MARY', 'HAD', 'A', 'LITTLE', 'RAMB']);
    });

    it('allows data to be extracted easily from hierarchical objects ', () => {

        const get = _.curry(function (x, obj) {
            return obj[x];
        });

        const articles = [
            {
                title: 'Article 1',
                url: 'http://www.url.com',
                author: {
                    name: 'Simon Kerr',
                    email: 'email@email.com'
                }
            },
            {
                title: 'Article 2',
                url: 'http://www.url.com',
                author: {
                    name: 'Max McGee',
                    email: 'maxemail@email.com'
                }
            }
        ];

        const getName = _.compose(get('name'), get('author'));

        const names = _.map(getName);

        /*
         could also be  implemented as
         but not as efficient since there are now 2 loops introduced
         remembering compose is evaluated right to left helps here.
         For each list item, author object is returned, and this is composed
         with the get function to get 'name' of that object
         */
        // const names = _.compose(_.map(get('name')), _.map(get('author')));

        // function to say whether given string is an author
        const isAuthor = (name, articles) => _.compose(_.contains(name), names)(articles);

        assert.deepEqual(names(articles), ['Simon Kerr', 'Max McGee']);
        assert.isTrue(isAuthor('Simon Kerr', articles));
        assert.isFalse(isAuthor('Blah Blah', articles));
    });

    it('works with pointfree programming', () => {
        const snakeCase = _.compose(_.replace(/\s+/ig, '_'), _.toLower);
        assert.equal('simon_kerr', snakeCase('Simon Kerr'));
    });

    it('pointfree example 2', () => {
        // laid out like this, it works bottom to top
        const initials = _.compose(
            _.join('. '),
            _.map(
                _.compose(
                    _.toUpper,
                    _.head
                )
            ),
            _.split(' ')
        );

        assert.equal('S. P. K', initials('simon phillip kerr'));
    });

    describe('debugging', () => {
        it('use a simple "trace" function to debug compositions', () => {
            const trace = _.curry((tag, x) => {
                console.log(tag, x);
                return x;
            });

            var dasherize = _.compose(_.join('-'), _.toLower, trace('after split'), _.split(' '), _.replace(/\s{2,}/ig, ' '));
            //outputs 'after split' Array(5) - it was trying to call toLower on an array

            dasherize = _.compose(_.join('-'), _.map(_.toLower), _.split(' '), _.replace(/\s{2,}/ig, ' '));
            dasherize('The world is a vampire');
        });

    });

    describe('examples', () => {
        let cars = {};

        beforeEach(() => {
            cars = [{
                name: 'Ferrari FF',
                horsepower: 660,
                dollar_value: 700000,
                in_stock: true,
            }, {
                name: 'Spyker C12 Zagato',
                horsepower: 650,
                dollar_value: 648000,
                in_stock: false,
            }, {
                name: 'Jaguar XKR-S',
                horsepower: 550,
                dollar_value: 132000,
                in_stock: false,
            }, {
                name: 'Audi R8',
                horsepower: 525,
                dollar_value: 114200,
                in_stock: false,
            }, {
                name: 'Aston Martin One-77',
                horsepower: 750,
                dollar_value: 1850000,
                in_stock: true,
            }, {
                name: 'Pagani Huayra',
                horsepower: 700,
                dollar_value: 1300000,
                in_stock: false,
            }];
        });

        it('1 - rewriting a pointed function', () => {
            var isLastInStock = function(cars) {
                var last_car = _.last(cars);
                return _.prop('in_stock', last_car);
            };

            const isLastInStock2 = _.compose(_.prop('in_stock'), _.last);

            assert.equal(isLastInStock(cars), false);
            assert.equal(isLastInStock2(cars), false);


        });

        it('2 - getting the name of the first car', () => {
            const nameOfFirstCar = _.compose(_.prop('name'), _.head);

            assert.equal(nameOfFirstCar(cars), 'Ferrari FF');
        });

        it('3 - refactor averageDollarValue', () => {
            var _average = function(xs) {
                return _.reduce(_.add, 0, xs) / xs.length;
            };

            var averageDollarValue = function(cars) {
                var dollar_values = _.map(function(c) {
                    return c.dollar_value;
                }, cars);
                return _average(dollar_values);
            };


            const averageDollarValue2 = _.compose(_average,_.map(c => c.dollar_value));

            assert.equal(averageDollarValue(cars), 790700);
            assert.equal(averageDollarValue2(cars), 790700);
        });

        it('4 - Sanitized car names', () => {
            var _underscore = _.replace(/\W+/g, '_');

            var sanitizeNames = _.map(_.compose(_underscore, _.toLower, _.prop('name')));
            assert.deepEqual([
                'ferrari_ff',
                'spyker_c12_zagato',
                'jaguar_xkr_s',
                'audi_r8',
                'aston_martin_one_77',
                'pagani_huayra'
            ], sanitizeNames(cars));
        });

        it('5 - refactor function using compose', () => {
            var availablePrices = function(cars) {
                var available_cars = _.filter(_.prop('in_stock'), cars);
                return available_cars.map(function(x) {
                    return x.dollar_value;
                }).join(', ');
            };

            const availablePrices2 = _.compose(_.join(', '), _.map(_.prop('dollar_value')), _.filter(_.prop('in_stock')))

            assert.equal('700000, 1850000', availablePrices(cars));
            assert.equal('700000, 1850000', availablePrices2(cars));

        });

        it('6 - refactor to pointfree', () => {
            const trace = _.curry((tag, x) => {
                console.log(tag, x);
                return x;
            });

            var fastestCar = function(cars) {
                var sorted = _.sortBy(function(car) {
                    return car.horsepower;
                }, cars);
                var fastest = _.last(sorted);
                return fastest.name + ' is the fastest';
            };

            const concatSentence = _.curry((str1, str2) => `${str2} ${str1}`);

            const fastestCar2 = _.compose(concatSentence('is the fastest'), _.prop('name'), _.last, _.sortBy(x => x.horsepower));

            assert.equal('Aston Martin One-77 is the fastest', fastestCar(cars));
            assert.equal('Aston Martin One-77 is the fastest', fastestCar2(cars));

        });


    });


});

/**
 * Functors allow you to call map over any object
 */
describe('Functors', () => {

    describe('Containers', () => {

        it('use containers that can hold any value', () => {
            assert.equal(2, Container.of(2).__value);
            assert.equal('hot dog', Container.of('hot dog').__value);
        });

        it('can used map to map an object', () => {
            assert.equal(4, Container.of(2).map(two => two + 2).__value);
            assert.equal('FLAMETHROWER', Container.of('flamethrower').map(val => val.toUpperCase()).__value);

            // create a container of the word 'bombs', map over it and concatenate it with the word ' away'
            // this returns another Container, which is mapped over to get the length
            assert.equal(10, Container.of('bombs').map(_.concat(' away')).map(_.prop('length')).__value);
        });
    });

    describe('Maybe', () => {

        var map = _.curry(function(f, functor) {
            return functor.map(f);
        });

        it('can be used to safely handle values that can be null or undefined', () => {
            const result1 = Maybe.of('Simon Phillip Kerr').map(_.match(/i/ig));
            assert.deepEqual(['i', 'i', 'i'], result1.__value);

            const result2 = Maybe.of(null).map(_.match(/i/ig));
            assert.equal(null, result2.__value);

            const result3 = Maybe.of({
                id: 1,
                name: 'Simon',
                month: 'April'
            })
                .map(_.prop('age'))
                .map(_.add(10));

            assert.equal(null, result3.__value);

            const result4 = Maybe.of({
                id: 1,
                name: 'Bob',
                month: 'April',
                age: 22
            })
                .map(_.prop('age'))
                .map(_.add(10));

            assert.equal(32, result4.__value);
        });

        it('can be used to safely get values', () => {
            const safeHead = xs => Maybe.of(xs[0]);

            const streetName = _.compose(map(_.prop('street')), safeHead, _.prop('addresses'));

            const result1 = streetName({
                addresses: []
            });
            assert.equal(null, result1.__value);

            const result2 = streetName({
                addresses: [{
                    street: 'blah street'
                }]
            });

            assert.equal('blah street', result2.__value);
        });

    });

    describe('Either', () => {

        it('Right maps over the Container as normal', () => {
            assert.equal('brain', Right.of('rain').map(str => `b${str}`).__value);
        });

        it('Left ignores any map and just returns the container', () => {
            assert.equal('rain', Left.of('rain').map(str => `b${str}`).__value);
        });

        it('can be used to conditionally process, or else handle an error', () => {
            const getAge = _.curry((year, yob) => {
                const isValid = /\d{4}/.test(yob) && yob <= year;

                if (!isValid) {
                    return Left.of('Could not calculate age');
                }

                return Right.of(year - yob);
            });

            const getAgeFrom2017 = getAge(2017);

            const result1 = getAgeFrom2017(2000);
            assert.equal(17, result1.__value);

            const result2 = getAgeFrom2017('blah');
            assert.equal('Could not calculate age', result2.__value);
        });
    });

    /**
     * IO is used to wrap an impure function and return a pure one (?)
     */
    describe('IO', () => {

        it('can be used to safely manage impure elements', () => {
            var io_window = new IO(() => window);

            io_window.map(win => win.innerWidth);
            
            // console.log(io_window);
            // assert.isAbove(io_window.__value(), 0);
        });

        it('can be used to get html elements from the dom', () => {
            $ = selector => new IO(() => document.querySelectorAll(selector));

            const div = document.createElement('div');
            div.innerHTML = '<div id="myDiv">I am a div</div>';
            document.body.appendChild(div);

            const element = $('#myDiv').map(_.head).map(el => el.innerHTML);

            assert.equal('I am a div', element.__value());

            document.body.removeChild(div);
        });

        it('can be used to access impure elements', () => {

            // imagine this is the url
            const window = {
                location: {
                    href: 'http://www.com.com/?searchTerm=blah&location=uk'
                }
            };

            const url = new IO(() => window.location.href);

            // toPairs :: String -> [[String]]
            const toPairs = _.compose(_.map(_.split('=')), _.split('&'));

            // params :: String -> [[String]]
            const params = _.compose(toPairs, _.last, _.split('?'));

            // findParam :: String -> IO Maybe [String]
            const findParam = key => _.map(_.compose(Maybe.of, _.filter(_.compose(_.equals(key), _.head)), params), url);

            /// Impure code

            const search = findParam('searchTerm').unsafePerformIO();

            assert.deepEqual(['searchTerm', 'blah'], search.__value[0]);


        });
    });

    describe('Task', () => {
        it('can be used for asynchronous actions', (done) => {
            var getPost = id => new Task((rej, res) => {
                setTimeout(() => {

                    id > 0
                        ? res({
                            id: 1,
                            title: 'Love them tasks',
                        })
                        : rej('invalid id')
                }, 300);
            });

            // compositions and maps can still take place and nothing happens until fork is called
            const getTitle = getPost(1).map(_.prop('title'));
            getTitle.fork(console.error, (data) => {
                assert.equal('Love them tasks', data);
                done();
            });
        });
        
        it('does not break flow when Task is rejected', (done) => {
            var getPost = id => new Task((rej, res) => {
                setTimeout(() => {
                    id > 0
                        ? res({
                        id: 1,
                        title: 'Love them tasks',
                    })
                        : rej('invalid id')
                }, 300);
            });

            // since the Task is rejected, it no longer tries to get the title prop
            const getInvalidTitle = getPost(-1).map(_.prop('title'));
            getInvalidTitle.fork((data) => {
                assert.equal('invalid id', data);
                done();
            }, console.log);


        });
    });

    describe('Exercises', () => {
        it('1 - increment a value in a functor', () => {
            // Use _.add(x,y) and _.map(f,x) to make a function that increments a value
            // inside a functor.

            const increment = val => Container.of(val).map(_.add(1));

            const two = increment(1);
            assert.equal(2, two.__value);
        });

        it('2 - Use _.head to get the first element of a list', () => {
            var xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);

            var firstEl = xs.map(_.head);
            assert.equal('do', firstEl.__value);

        });
        
        it('3 - Use safeProp and _.head to find the first initial of the user.', () => {
            var safeProp = _.curry(function(x, o) {
                return Maybe.of(o[x]);
            });

            var user = {
                id: 2,
                name: 'Albert',
            };

            var nameProp = safeProp('name');
            var ex3 = nameProp(user).map(_.head);
            assert.equal('A', ex3.__value);

        });
        
        it('4 - Use Maybe to rewrite a function without an if statement.', () => {
            var ex4 = (n) => {
                if (n) {
                    return parseInt(n);
                }
            };

            var ex4b = n => Maybe.of(n).map(parseInt);

            assert.equal(5, ex4b('5').__value);
            assert.equal(null, ex4b(null).__value);
        });
        
        it('5 - Write a function that will getPost then toUpperCase the posts title.', (done) => {
            var getPost = i => new Task((rej, res) => {
                setTimeout(() => {
                    res({
                        id: i,
                        title: 'Love them tasks',
                    });
                }, 300);
            });

            /**
             *  the getPost function is used as if everything will be ok.
             *  If it is, the title prop is returned, then upper cased.
             */
            var uppercasePostTitles = i => getPost(i).map(_.compose(_.toUpper, _.prop('title')));

            /**
             * when fork is called, 2 functions are supplied for the rejection
             * or the resolution.
             */
            uppercasePostTitles(1).fork(console.error, data => {
                assert.equal('LOVE THEM TASKS', data);
                done();
            });
        });
        
        it('6 - Write a function that uses checkActive() and showWelcome() to grant access or return the error.', () => {
            var showWelcome = _.compose(_.concat( "Welcome "), _.prop('name'));

            var checkActive = function(user) {
                return user.active ? Right.of(user) : Left.of('Your account is not active');
            };

            var login = checkActive.map(showWelcome);
                // _.compose(showWelcome, checkActive);

            console.log(login({ active: true, name: 'Simon' }));
        });
    });
});