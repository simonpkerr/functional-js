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


});

/**
 * Functors allow you to call map over any object
 */
xdescribe('Functors', () => {
    it('can used map to map an object', () => {

        const r = _.map(x => x + 1, Right(2));
        console.log(r);

        /**
         * use _.add(x,y) and map(f, x) to make a function
         * that increments a value inside a functor
         */
        // const get = _.curry((x, o) => o[x]);
        // const showWelcome = compose(_.add('Welcome '), get('name'));
        // const checkActive = user => user.active ? Right(user) : Left('inactive');
        //
        // const result = _.compose(map(showWelcome), checkActive);
        //
        // assert.equal(Left('inactive'), result({ active: false, name: 'Gaz' }));
        // assert.equal(Right('Welcome Simon'), result({ active: true, name: 'Simon' }));

    });

});