/* envio y recepción de Formulario a server node.js
UTN - Programación Web Full Stack
UNIDAD 3 TRABAJO PRÁCTICO 4 
David Graterol   */

const express = require('express');
const mysql = require("mysql");
const util = require ("util");
const PATH = require('path');
const app = express();
var bodyParser = require('body-parser');
const port = 3000;
const http = require('http');
app.use(express.json());  //permite el mapeo de la peticion  json a objeto js
//conexión con mysql
app.use(express.static(__dirname + '/public' ));
app.use(bodyParser.urlencoded({extended: false}));
//app.use(express.static(path.join(__dirname,'./public')));
// a manera de prueba uso el app.route para el metodo GET y coloco directo en Localhost
app.route('/')

.get(function (req, res) {
    res.sendFile(PATH.join(__dirname+"/formulario.html"));
  });

const conexion = mysql.createConnection({   //string de conexión
  host: "localhost",
  user: "root",
  password: "",
  database: "utn"
});
conexion.connect((error)=>{
if (error){
  throw error;
}
  console.log("Conexión con la base de datos establecida");
});

//empleo el puerto 3000 para la comunicación con el server
app.listen(port, ()=> {
  console.log('Example app listening on port ', port);
  });

//Desarrollo de la logica de negocio
const qy= util.promisify(conexion.query).bind(conexion); 
//permite el uo de asyn-await en la conexion mysql

//metodo GET para consultar toda la tabla de alumnos
app.get("/alumnos", async(req, res) => {
try {
  const query = "SELECT * FROM alumnos";
  const respuesta =await qy(query);
  res.send({"respuesta": respuesta});
}
catch(e){
  console.error(e.message);
  res.status(413).send({"error": e.message});
  
}});
//metodo get para consultar 1 alumno
app.get("/alumnos/:id", async(req, res) => {
  try {
    const query = "SELECT * FROM alumnos WHERE id = ?";
    const respuesta =await qy(query, [req.params.id]);
    console.log(respuesta);
    res.send({"respuesta": respuesta});
  }
  catch(e){
    console.error(e.message);
    res.status(413).send({"error": e.message});
  }
});


//metodo POST para agregar un nuevo alumno
app.post("/alumnos", async(req, res) => {
  try {
    //valido que me mande correctamente la información
   if (!req.body.nombre){
     throw new Error("falta enviar el nombre");
   }
   const nombre = req.body.nombre;
   const apellido = req.body.apellido;
   const edad = req.body.edad;
   const telefono = req.body.telefono;
   const dni = req.body.dni;
   const pais = req.body.pais;
   const fechanac = req.body.fechanac;

   let query = "SELECT * FROM `alumnos`"; 
   let respuesta = await qy(query, [nombre]);
   if (respuesta.leng > 0){
    throw new Error("ese nombre ya existe");
   }

   //guardo nuevo alumno en base de datos

  query ="INSERT INTO alumnos (nombre, apellido, edad, telefono, dni, pais, fechanac)  VALUE (?,?,?,?,?,?,?)";
  respuesta = await qy(query, [nombre, apellido, edad, telefono, dni, pais, fechanac]); 
  console.log(respuesta);
  res.send({"respuesta":respuesta.insertId});
  }
  catch(e){
    console.error(e.message);
    res.status(413).send({"error": e.message});
    
  }
});


//metodo POST para agregar un nuevo alumno
app.post("/formulario", async(req, res) => {
  try {
    //valido que me mande correctamente la información
   if (!req.body.nombre){
     throw new Error("falta enviar el nombre");
   }
   const nombre = req.body.nombre;
   const apellido = req.body.apellido;
   const edad = req.body.edad;
   const telefono = req.body.telefono;
   const dni = req.body.dni;
   const pais = req.body.pais;
   const fechanac = req.body.fechanac;

   let query = "SELECT * FROM `alumnos`"; 
   let respuesta = await qy(query, [nombre]);
   if (respuesta.leng > 0){
    throw new Error("ese nombre ya existe");
   }

   //guardo nuevo alumno en base de datos

  query ="INSERT INTO alumnos (nombre, apellido, edad, telefono, dni, pais, fechanac)  VALUE (?,?,?,?,?,?,?)";
  respuesta = await qy(query, [nombre, apellido, edad, telefono, dni, pais, fechanac]); 
  console.log(respuesta);
  res.send({"respuesta":respuesta.insertId});
  }
  catch(e){
    console.error(e.message);
    res.status(413).send({"error": e.message});
    
  }
});



app.put("/alumnos/:id", async (req, res) =>{
  try {
    if (!req.body.nombre){
      throw new Error ("No enviaste el nombre");
    }
    
    let query = "SELECT * FROM alumnos WHERE nombre = ? AND id <> ?";
    let respuesta = await qy(query, [req.body.nombre, req.params.id]);
   // console.log("respuesta: ",respuesta);
    if (respuesta.length > 0) {
      throw new Error ("El nombre del alumno que quieres poner ahora ya existe");
    }

    query = "UPDATE alumnos SET nombre = ? WHERE id = ?";
    respuesta = await qy(query, [req.body.nombre, req.params.id]);
    //console.log(respuesta);
    res.send({"respuesta": respuesta.affectedRows});
  }
  catch(e){
    console.error(e.message);
    res.status(413).send({"Error": e.message});
    
  }

});


app.delete("/alumnos/:id", async (req, res) => {
try{
  let query = "SELECT * FROM alumnos WHERE id = ?";
  let respuesta = await  qy(query, [req.params.id]);
  if (respuesta.length > 0){
    throw new Error ("Esta categoria tiene productos asociados, no se puede borrar");
  }

  query = "DELETE FROM alumnos WHERE id = ?";
  respuesta = await qy(query, [req.params.id]);
  res.send({"respuesta": respuesta.affectedRows});

}
catch(e){
    console.error(e.message);
    res.status(413).send({"Error": e.message});
    
  }

});


