const Koa = require('koa');
const logger = require('koa-logger');
const router = require('./routes');
const BodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const app = module.exports = new Koa();
app.use(cors({
  origin: '*'
}));
app.use(logger());
app.use(BodyParser());
app.use(router.routes());

if (!module.parent) {
  require('./mongo')(app);
  app.listen(4000);
}
