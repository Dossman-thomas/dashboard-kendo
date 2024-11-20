import { env, sequelize } from './config/index.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { routes } from './routes/router.js';
import { response } from './utils/index.js';
import { messages } from './messages/index.js';

const PORT = env.server.port || process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: '*',
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', routes);

// app.use('/', (req, res) => {
//   return res.status(200).send('OK');
// });

app.use((err, req, res, next) => {
  console.error(err);
  return response(res, {
    statusCode: 500,
    message: messages.general.INTERNAL_SERVER_ERROR,
  });
});

// Sync database and start the server after successful connection
(async () => {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
})();
