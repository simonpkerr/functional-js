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

    it('allows functions to be composed together', () => {
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


})

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