const express = require('express');
const cors = require('cors');
require('dotenv').config();

const monthsRoutes = require('./routes/months');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/months', monthsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server rodando na porta ${port}`);
});
