const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require("cors");

require('dotenv').config();

/*Ajustes*/
app.set('port', process.env.PORT || 5000);

const routes = require('./routes/routes');
/*Middlewares*/
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({origin: '*'}));
app.use('/', routes);
/*Ajustes del servidor*/
app.listen(app.get('port'), () => {
	console.log(`servidor corriendo en el puerto ${app.get('port')}`);
});
