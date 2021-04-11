const pg = require('./../db/db');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const controller ={
 trae: async(req,res)=>{
    const {token}=req.params;
    jwt.verify(token, process.env.JSPASS, async (err, data) => {
        if (err) {
            res.json({ validation: false });
        } else {
            const id=data.id;
            const conection= await pg.connect();
            conection.query("SELECT * FROM compras WHERE usuario=$1",[id])
            .then((data)=>{
             res.json({status:true, ...(data.rows)});
            })
            .catch((err)=>{
                res.json({status:false, err});
            });
        }
    });
 },
 inserta: async(req,res)=>{
    const {nombre, articulos, token}=req.body;
    jwt.verify(token, process.env.JSPASS, async (err, data) => {
        if (err) {
            res.json({ validation: false });
        } else {
            const id=data.id;
            const conection= await pg.connect();
            conection.query("INSERT INTO compras (nombre, articulos, usuario) values($1,$2,$3)",[nombre, articulos, id])
            .then((data)=>{
             res.json({status:true});
            })
            .catch((err)=>{
                res.json({status:false, err});
            });
        }
    });
 }
};
module.exports = controller;