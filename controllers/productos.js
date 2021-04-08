const pg = require('./../db/db');
const fs = require('fs');
const Productosfile = fs.readFileSync("./info_prueba.json", "utf8");
let productos = JSON.parse(Productosfile);
(async () => {
    let querystring = "INSERT INTO productos (id,descripcion,precio, existencias) VALUES ";
    let n = 0;
    for (const i in productos) {
        if (n != 0) {
            querystring += ",";
        }
        querystring += `('${i}','${productos[i].descripcion}',${productos[i].precio},${productos[i].existencia})`;
        n++;
    }
    let conection = await pg.connect();
    conection.query("delete from productos");
    if (n > 0) {
        conection.query(querystring).then(() => { console.log("exito"); conection.release(); });
    }
})()
const controller = {
    existencia: async(req, res, next) => {
        const { id, existencia } = req.body;
        let conection = await pg.connect();
        conection.query("update productos set existencias=((SELECT existencias from productos where id=$1)-$2) where id=$1", [id, existencia])
            .then(() => {
                conection.release();
                res.json({ status: true });
            })
            .catch(err => {
                conection.release();
                res.json({ status: false, err });
                console.log(err);
            });
        productos[id].existencias = productos[id].existencias - existencia;
        const json_productos = JSON.stringify(productos);
        fs.writeFileSync("./info_prueba.json", json_productos, "utf-8");
    },
    traer:async(req, res, next)=>{
        let conection = await pg.connect();
        conection.query("SELECT * from productos WHERE existencias>0")
            .then((data) => {
                conection.release();
                res.json(data.rows);
            })
            .catch(err => {
                conection.release();
                res.json({ status: false, err });
                console.log(err);
            });
    }
};
module.exports = controller;