const pg = require('./../db/db');
const encrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const smtpTransport = require('nodemailer-smtp-transport');
const nodemailer = require('nodemailer');
require('dotenv').config();
let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.CORREO,
        pass: process.env.PASS
    }
}));
const controller = {
    autenticar: (req, res, next) => {
        const { correo, codigo } = req.body;
        const mailOptions = {
            from: 'cosmetics',
            to: correo,
            subject: 'Codigo de Verificacion',
            text: `Tu codigo de verificacion es: ${codigo}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.json({ status: false, error });
                console.log(error);
            } else {
                res.json({ status: true, info });
            }
        });
    },
    registrar: async (req, res, next) => {
        try {
            const { contraseña, correo, direccion, barrio, ciudad, departamento } = req.body;
            const random = Math.round(Math.random() * 6, 5);
            await encrypt.hash(contraseña, random, async (err, cry) => {
                if (err) {
                    res.json({ status: false, err })
                    console.log(err);
                } else {
                    let conection = await pg.connect();
                    await conection.query('INSERT INTO usuarios ( contraseña, correo, direccion,barrio,ciudad,departamento) VALUES($1, $2, $3, $4, $5, $6) returning *', [cry, correo, direccion, barrio, ciudad, departamento])
                        .then((data) => {
                            conection.release();
                            const jsonData = data.rows[0];
                            let token = jwt.sign(jsonData, process.env.JSPASS);
                            res.json({ token, status: true });
                        })
                        .catch((err) => {
                            conection.release();
                            res.json({ status: false, err });
                            console.log(err);
                        });
                }
            });
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    login: async (req, res, next) => {
        try {
            const { correo, contraseña } = req.body;
            let conection = await pg.connect();
            await conection.query('SELECT * FROM usuarios WHERE correo= $1', [correo])
                .then(async (data) => {
                    conection.release();
                    if (data.rows[0]) {
                        const cry = await encrypt.compare(contraseña, data.rows[0].contraseña);
                        if (cry) {
                            let jsonData = data.rows[0];
                            let token = jwt.sign(jsonData, process.env.JSPASS);
                            res.json({ token, status: true })
                        } else {
                            res.json({ status: false, err: "The password is invalid" });
                        }
                    } else {
                        res.json({ status: false, err: "User/email not exist" });
                    }
                })
                .catch((err) => {
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (err) {
            res.json({ status: false, err });
            console.log(err);
        }
    },
    token_verify: async (req, res) => {
        let { token } = req.params;
        jwt.verify(token, process.env.JSPASS, async (err, data) => {
            if (err) {
                res.json({ validation: false });
            } else {
                res.json(data);
            }
        });
    },
    update: async (req, res) => {
        try {
            let { id, correo, direccion, barrio, ciudad, departamento } = req.body;
            let query = "UPDATE usuarios SET correo= $2, direccion= $3, barrio= $4,ciudad = $5, departamento = $6 where id= $1 RETURNING *";
            let conection = await pg.connect();
            await conection.query(query, [id, correo, direccion, barrio, ciudad, departamento])
                .then((data) => {
                    conection.release();
                    let token = jwt.sign(data.rows[0], process.env.JSPASS);
                    res.json({ token, status: true });
                }).catch((err) => {
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (error) {
            res.json({ status: false, error });
            console.log(error);
        }
    },
    changepassword: async (req, res) => {
        try {
            let { id, contraseña, nueva } = req.body;
            await conection.query('SELECT * FROM usuarios WHERE id= $1', [id])
                .then(async (data) => {
                    if (data.rows[0]) {
                        const cry = await encrypt.compare(contraseña, data.rows[0].contraseña);
                        if (cry) {
                            const random = Math.round(Math.random() * 6, 5);
                            await encrypt.hash(nueva, random, async (err, cry2) => {
                                if (err) {
                                    res.json({ status: false, err })
                                    console.log(err);
                                } else {
                                    let query = "UPDATE usuarios SET contraseña= $2 where id= $1 RETURNING *";
                                    await conection.query(query, [id, cry2])
                                        .then((data) => {
                                            conection.release();
                                            let token = jwt.sign(data.rows[0], process.env.JSPASS);
                                            res.json({ token, status: true });
                                        }).catch((err) => {
                                            conection.release();
                                            res.json({ status: false, err });
                                            console.log(err);
                                        })
                                }
                            });
                        } else {
                            res.json({ status: false, err: "The password is invalid" });
                        }
                    }
                })
                .catch((err) => {
                    conection.release();
                    res.json({ status: false, err });
                    console.log(err);
                })
        } catch (error) {
            res.json({ status: false, error });
            console.log(error);
        }
    }

};
module.exports = controller;