// Koa app
const Koa      = require('koa');
const Boom     = require('boom');
const compress = require('koa-compress');
const app      = module.exports = new Koa();

const config   = require('./config');
const router  = require('./router');
const log     = require('./log');

// Compression
app.use(compress({
	threshold: 2048,
}));

// Catch errors and log requests
app.use(async (ctx, next) => {
	try {
		await next();
		const status = ctx.status || 404;
		if (status === 404) {
			throw Boom.notFound();
		} else {
			// add stats and monitoring using datadog
			log.debug({
				request: ctx.request,
				response: ctx.response,
			}, 'request');
		}
	} catch (err) {
		// add stats and monitoring using datadog
		const error = new Boom(err);
		ctx.status = error.output.statusCode;
		ctx.body = error.output.payload;
		log.debug({
			request: ctx.request,
			response: ctx.response,
		}, 'request');
		if (error.output.statusCode === 500) {
			log.error({ error: error.output }, error.message);
		} else {
			log.warn({ error: error.output }, err.message);
		}
	}
});

// Set cross origin headers
app.use(async (ctx, next) => {
	ctx.set('Access-Control-Allow-Origin', '*');
	ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control, X-Requested-With');
	await next();
});

// Add response time to response
app.use(require('koa-response-time')());

// Parse request body and query strings
app.use(require('koa-bodyparser')({
	onerror: function (err, ctx) {
		ctx.throw('body parse error', 422);
	},
}));

// Use routes
app.use(router.routes());
app.use(router.allowedMethods({
	throw: true,
	notImplemented: () => Boom.notImplemented(),
	methodNotAllowed: () => Boom.methodNotAllowed(),
}));

app.listen(config.apiPortInternal);

log.info('Server listening on port', config.apiPortInternal);
