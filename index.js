/* envio y recepción de Formulario a server node.js
UTN - Programación Web Full Stack
UNIDAD 3 TRABAJO PRÁCTICO 4 
David Graterol   */

"use strict"
const express = require('express');
const mysql = require("mysql");
const util = require ("util");
//const PATH = require('path');
const app = express();
const port = 3000;
app.use(express.json());  //permite el mapeo de la peticion  json a objeto js


//conexión con mysql

const conexion = mysql.createConnection({   //string de conexión
  host: "localhost",
  user: "root",
  password: "",
  database: "listacompras"
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


/**
 * Categorias de productos
 * GET para deolver todas las categorias
 * GET id para devolver uno
 * POST guardar una categoria
 * PUT para modificar una categoria existente
 * DELETE para borrar una categoria
 * 
 * ruta -> /categoria
 */
//codigo para solicitar ruta
app.get("/categoria", async(req, res) => {
try {
  const query = "SELECT * FROM categoria";
  
  const respuesta =await qy(query);

  res.send({"respuesta": respuesta});


}
catch(e){
  console.error(e.message);
  res.status(413).send({"error": e.message});
  
}

});

app.get("/categoria/:id", async(req, res) => {
  try {
    const query = "SELECT * FROM categoria WHERE id = ?";
    
    const respuesta =await qy(query, [req.params.id]);
    console.log(respuesta);
    res.send({"respuesta": respuesta});
  
  
  }
  catch(e){
    console.error(e.message);
    res.status(413).send({"error": e.message});
    
  }
});

app.post("/categoria", async(req, res) => {
  try {
    //valido que me mande correctamente la información
   if (!req.body.nombre){
     throw new Error("falta enviar el nombre");
   }

   const nombre = req.body.nombre;
  //verifico que no existe previamente esa categoria
 //toUppercase permite indiscrimiar mayusculas o minusculas

   let query = "SELECT id FROM categoria WHERE nombre = ?";
   
   let respuesta = await qy(query, [nombre]);

   if (respuesta.leng > 0){
    throw new Error("esa categoria ya existe");
   }

   //guardo nueva categoria

  query ="INSERT INTO categoria (nombre) VALUE (?)";
  respuesta = await qy(query, [nombre]); 
   //console.log(respuesta);
  res.send({"respuesta":respuesta.insertId});
  }
  catch(e){
    console.error(e.message);
    res.status(413).send({"error": e.message});
    
  }
});


app.put("/categoria/:id", async (req, res) =>{
  try {
    if (!req.body.nombre){
      throw new Error ("No enviaste el nombre");
    }
    
    let query = "SELECT * FROM categoria WHERE nombre = ? AND id <> ?";

    let respuesta = await qy(query, [req.body.nombre, req.params.id]);
   // console.log("respuesta: ",respuesta);
    if (respuesta.length > 0) {
      throw new Error ("El nombre de la categoria que quieres poner ahora ya existe");
    }

    query = "UPDATE categoria SET nombre = ? WHERE id = ?";

    respuesta = await qy(query, [req.body.nombre, req.params.id]);
      //console.log(respuesta);
     res.send({"respuesta": respuesta.affectedRows});
  }
  catch(e){
    console.error(e.message);
    res.status(413).send({"Error": e.message});
    
  }

});


app.delete("/categoria/:id", async (req, res) => {
try{
  let query = "SELECT * FROM producto WHERE id_categoria = ?";

  let respuesta = await  qy(query, [req.params.id]);

  if (respuesta.length > 0){
    throw new Error ("Esta categoria tiene productos asociados, no se puede borrar");
  }

  query = "DELETE FROM categoria WHERE id = ?";

  respuesta = await qy(query, [req.params.id]);

  res.send({"respuesta": respuesta.affectedRows});

}
catch(e){
    console.error(e.message);
    res.status(413).send({"Error": e.message});
    
  }

});


/**
 * Produtos
 * 
 * Ruta -> /producto
 */

app.post("/producto", async (req, res) => {
  try{
      if (!req.body.nombre || !req.body.id_categoria){
        throw new Error("No enviaste los datos obligatorios que son nombre y categoria");
      }

      let query = "SELECT * FROM categoria WHERE id = ?";
      let respuesta = await qy(query, [req.body.id_categoria]);

      if (respuesta.length == 0){
        throw new Error ("Esa Categoria no existe");
      }

      query = "SELECT * FROM producto WHERE nombre = ?";
      respuesta = await  qy(query, [req.body.nombre]);

      if (respuesta.length > 0){
        throw new Error ("Ese nombre ya existe");
      }

      let descripcion = "";
      if (req.body.descripcion){
        descripcion = req.body.descripcion;
      }

      query = "INSERT INTO producto (nombre, descripcion, id_categoria) VALUES (?,?,?)";
      console.log(respuesta);
      respuesta = await qy(query, [req.body.nombre, descripcion, req.body.id_categoria]);
      res.send({"respuesta":respuesta.insertId});

  }


  catch(e){
    console.error(e.message);
    res.status(413).send({"Error": e.message});
    
  }

});

 /**
  * Lista de compras 
  * 
  * Ruta -> /lista
  */

