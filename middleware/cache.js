const {Redis} = require('ioredis');
const redis = new Redis(); // استخدم الإعداد الافتراضي على localhost

module.exports = redis;



// app.post('/heavy-task', async (req, res) => {
//   await jobQueue.add('process', { timestamp: Date.now() });
//   res.send('Task queued');
// });

// module.exports = app;