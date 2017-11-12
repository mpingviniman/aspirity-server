const Router = require('koa-router');
const ObjectID = require('mongodb').ObjectID;
const router = new Router({
  prefix: '/api'
});

/**
 * Create array from 0 to n
 * @param n
 */
let range = n => Array.from(Array(n).keys());

/**
 * Check object
 * @type {{title: number, priority, state}}
 */
const Schema = {
  'title': 50,
  'priority': range(3),
  'state': range(4)
};

/**
 * Check object property
 * @param todo object to check
 * @returns {*}
 */
let checkObject = todo => {
  let result = {}; // object without extra property

  if (Object.keys(todo).length === 0 && todo.constructor === Object) {
    return {'error': 'Not found object'};
  }

  if (!todo.hasOwnProperty('title') || typeof todo.title !== 'string' || todo.title.length > Schema.title) {
    return {'error': 'title invalid'};
  } else {
    result.title = todo.title;
  }

  if (!todo.hasOwnProperty('priority') || typeof todo.priority !== 'number' ||
    todo.priority.length in Schema.priority) {
    return {'error': 'priority invalid'};
  } else {
    result.priority = todo.priority;
  }

  if (!todo.hasOwnProperty('state') || typeof todo.priority !== 'number' || todo.state.length in Schema.state) {
    return {'error': 'state invalid'};
  } else {
    result.state = todo.state;
  }

  try {
    let date = new Date(todo.term);
    if (date <= new Date()) {
      return {'error': 'term invalid'};
    } else {
      result.term = date;
    }
  } catch (e) {
    console.log(e);
    return {'error': 'term invalid'};
  }
  result.position = todo.position;
  return result;
};

/**
 * Get Todos
 * @param ctx
 * @returns {Promise.<void>}
 */
const getTodos = async ctx => {
  ctx.body = await ctx.app.todos.find().sort({position: 1}).toArray();
};

/**
 * Get Todo by _id
 * @param ctx
 * @returns {Promise.<void>}
 */
const getTodo = async ctx => {
  try {
    ctx.body = await ctx.app.todos.findOne({'_id': ObjectID(ctx.params.id)});
  } catch (error) {
    ctx.body = {'error': 'Not Found'};
    ctx.status = 404;
  }
};

/**
 * Create Todo
 * @param ctx
 * @returns {Promise.<void>}
 */
const createTodo = async ctx => {
  let res = checkObject(ctx.request.body);
  if (res.error !== undefined) {
    ctx.body = res;
    ctx.status = 403;
  } else {
    ctx.body = await ctx.app.todos.insert(res);
  }
};

/**
 * Update Todo by _id
 * @param ctx
 * @returns {Promise.<void>}
 */
const putTodo = async ctx => {
  console.log(ctx.request.body);
  let res = checkObject(ctx.request.body);
  if (res.error !== undefined) {
    ctx.body = res;
    ctx.status = 403;
  } else {
    try {
      ctx.body = await ctx.app.todos.update({'_id': ObjectID(ctx.params.id)}, res);
    } catch (error) {
      ctx.body = {'error': 'Not Found'};
      ctx.status = 404;
    }
  }
};

/**
 * Delete Todo by _id
 * @param ctx
 * @returns {Promise.<void>}
 */
const delTodo = async ctx => {
  try {
    ctx.body = await ctx.app.todos.deleteOne({'_id': ObjectID(ctx.params.id)});
  } catch (error) {
    ctx.body = {'error': 'Not Found'};
    ctx.status = 404;
  }
};

// path routes
router
  .get('/', getTodos)
  .get('/todo/:id', getTodo)
  .post('/todo', createTodo)
  .put('/todo/:id', putTodo)
  .delete('/todo/:id', delTodo);

module.exports = router;
