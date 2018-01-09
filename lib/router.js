const Router = require('koa-router');
const API    = require('./api');
const config = require('./config');

const api = new API(config);
const router = new Router({
	prefix: config.apiPath,
});

// root route (used as health check)
router.get('/', async (ctx, next) => {
	ctx.body = { status: 'ok' };
});

// App config
router.get('/app', async (ctx, next) => {
	ctx.body = await api.getApp(ctx.query);
});

// Login
router.post('/users/login', async(ctx, next) => {
	ctx.body = await api.loginUser(ctx.request.body);
});

// Secure api access by using jwt tokens
router.use(api.tokenMiddleware());

router.get('/events', async(ctx, next) => {
	ctx.body = await api.getEvents(ctx.query);
});

module.exports = router;
