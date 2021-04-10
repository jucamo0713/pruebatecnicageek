create sequence sq_usuarios;
create table usuarios(
id int8 not null primary key default nextval('sq_usuarios'),
correo varchar not null unique,
contraseña varchar not null,
direccion varchar not null,
barrio varchar not null,
ciudad varchar not null,
departamento varchar not null
);
create sequence sq_compra;
create table compras(
id int8 not null primary key default nextval('sq_compra'),
nombre varchar not null,
fecha date not null default Date(Now()),
articulos json not null,
usuario int8 not null
);
create table productos(
id varchar not null primary key,
descripcion varchar not null,
precio int8 not null,
existencias int8 not null
);
alter table compras add 
constraint "fk_comprador" foreign key (usuario) 
references usuarios(id) on update restrict on delete restrict;