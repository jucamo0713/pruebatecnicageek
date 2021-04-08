const express = require('express');
const router = express.Router();
const pg = require('./../db/db');
const usuarios = require('./../controllers/usuarios.js');
const compras = require('../controllers/compras');
const productos = require('../controllers/productos');

router.post('/verificarcorreo',usuarios.autenticar);
router.post('/login',usuarios.login);
router.post('/register',usuarios.registrar);
router.get('/tokendes/:token',usuarios.token_verify);
router.put('/changepass',usuarios.changepassword);
router.put('/update',usuarios.update);
router.post('/icompra',compras.inserta);
router.get('/gHistorial/:token',compras.trae);
router.put('/icompra',productos.existencia);
router.get('/gProductos',productos.traer);
module.exports = router;
