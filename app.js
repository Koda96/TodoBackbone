//DEFINICIONES
const todoInput = document.querySelector('.todo');
const horario = document.querySelector('.todo-clock');
const todoButton = document.querySelector('.boton');
const micButton = document.querySelector('.vozboton');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');
const botonrandom = document.querySelector('.botonrandom');
const botoncerrar = document.querySelector('.iframe-button');
const digits_only = string => [...string].every(c => '0123456789:'.includes(c));
let lang = 'es-MX';
var url;
var toogle = 0;
var check = 1;

//LISTENERS
document.addEventListener('DOMContentLoaded', getTodos);
botonrandom.addEventListener('click', fetchurl);
todoButton.addEventListener('click', addTodo);
todoList.addEventListener("click", deleteCheck);
filterOption.addEventListener('click', filterTodo);
micButton.addEventListener('click', voicerecognition);
botoncerrar.addEventListener('click', cerrarReproductor);
document.addEventListener('click', startAudio);
document.addEventListener('keydown', keyRecognition);


function addTodo(event){

    //FUNCION PARA QUE NO REFRESHEE LA PAGINA APENAS DAS EL BOTON
    event.preventDefault();

    //CREACION DE LA TAREA
    const todoDiv = document.createElement('div');
    todoDiv.classList.add("todo");

    //SE CREA EL TEXTO EN UN LI 
    const newTodo = document.createElement('li');
    newTodo.innerText = todoInput.value;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    //SE USA EL TIME QUE VIENE DEL TIME-ITEM
    const time = document.createElement('li');
    time.innerText = horario.value;
    time.classList.add("time-item");
    todoDiv.appendChild(time);

    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("complete-button");
    todoDiv.appendChild(completedButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-minus-circle"></i>';
    deleteButton.classList.add("delete-button");
    todoDiv.appendChild(deleteButton);

    todoList.appendChild(todoDiv);

    saveLocalTodos(todoInput.value, horario.value, "undefined");

    console.log(todoList);


    //SPEECH
    TTS(todoInput.value, horario.value);

    todoInput.value = "";
    horario.value = "";
}

function deleteCheck(event){
    const item = event.target;
    //console.log(item.classList);
    if(item.classList[0] === 'delete-button'){
        const todo = item.parentElement;
        todo.classList.add("fall");
        removeLocalTodos(todo);
        todo.addEventListener("transitionend", function(){
            todo.remove();
        });
    }

    if(item.classList[0] == 'complete-button'){
        const todo = item.parentElement;
        todo.classList.toggle("completed")
    }

    if(item.classList[0] == 'video-embed'){
        const todo = item.parentElement;
        console.log(todo.querySelector('.hide').innerHTML);
        document.getElementById("videoej").src = todo.querySelector('.hide').innerHTML;
        document.getElementById("frame-container").style.display="block";
    }
}

function filterTodo(event){
    const todos = todoList.childNodes;

    todos.forEach(function(todo){
        switch(event.target.value){
            case "all":
                todo.style.display = 'flex';
                break;
            case "completed":
                if(todo.classList.contains('completed')){
                    todo.style.display = 'flex';
                }
                else{
                    todo.style.display = 'none';
                }
                break;
            case "uncompleted":
                if(!todo.classList.contains('completed')){
                    todo.style.display = 'flex';
                }
                else{
                    todo.style.display = 'none';
                }
                break;
        }
    });
}

function saveLocalTodos(todo, horario, url){ 
    let todos;
    if(localStorage.getItem('todos') === null){
        todos = [];
    }else{
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    todos.push(todo + "@@" + horario + "##" + url);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function getTodos(){
    let todos;
    let text;
    let hora;
    let url;

    if(localStorage.getItem('todos') === null){
        todos = [];
    }else{
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    todos.forEach(function(todo){
        text = todo.slice(0, todo.indexOf("@"));
        hora = todo.slice(todo.indexOf("@") + 2, todo.indexOf('#'));
        url = todo.slice(todo.indexOf("#") + 2, todo.length);        

        const todoDiv = document.createElement('div');
        todoDiv.classList.add("todo");

        const newTodo = document.createElement('li');
        newTodo.innerText = text;
        newTodo.classList.add("todo-item");
        todoDiv.appendChild(newTodo);

        if (url != "undefined"){
            const todourl = document.createElement('li');
            todourl.innerText = url;
            todourl.classList.add("hide");
            todourl.setAttribute('id', 'url');
            todoDiv.appendChild(todourl);
        }

        const time = document.createElement('li');
        if(hora != "undefined")
            time.innerText = hora;
        time.classList.add("time-item");
        todoDiv.appendChild(time);

        const completedButton = document.createElement('button');
        completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
        completedButton.classList.add("complete-button");
        todoDiv.appendChild(completedButton)

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-minus-circle"></i>';
        deleteButton.classList.add("delete-button");
        todoDiv.appendChild(deleteButton);   
        
        if (url != "undefined"){
            const videoEmbed = document.createElement('button');
            videoEmbed.innerHTML = '<i class="fab fa-youtube"></i>';
            videoEmbed.classList.add("video-embed");
            todoDiv.appendChild(videoEmbed);
        }

        todoList.appendChild(todoDiv);
    });
}

function removeLocalTodos(todo){
    let todos;
    if(localStorage.getItem('todos') === null){
        todos = [];
    }
    else{
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    const todoIndex = todo.children[0].innerText;
    todos.splice(todos.indexOf(todoIndex), 1);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function voicerecognition(event){
    let speechRec = new p5.SpeechRec(lang);
    
    if(event)
        event.preventDefault();

    let text;
    let hora;
    speechRec.start();
    console.log("Listening");
    speechRec.onResult = gotSpeech2;

    function gotSpeech2(){
        if(speechRec.resultValue){
            text = speechRec.resultString.slice(0, speechRec.resultString.indexOf("a las"));
            hora = speechRec.resultString.slice(speechRec.resultString.lastIndexOf("a las")+6, speechRec.resultString.length);
            var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(hora);

            if(speechRec.resultString.includes("a las") && isValid){
                writeSpeech(text, hora);
            }
            else{
                writeSpeech(speechRec.resultString,"undefined");
            }
        }
    }
}

function writeSpeech(text, hora){

    console.log("Writing");
    const todoDiv = document.createElement('div');
    todoDiv.classList.add("todo");
    const newTodo = document.createElement('li');
    newTodo.innerText = text; //SE UTILIZA EL STRING TEXT RECIBIDO POR LA FUNCION VOICERECOGNITION
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);
    const time = document.createElement('li');

    if(hora != "undefined")
        time.innerText = hora; //SE UTILIZA EL STRING HORA RECIBIDO POR LA FUNCION VOICERECOGNITION
    
    time.classList.add("time-item");
    todoDiv.appendChild(time);
    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("complete-button");
    todoDiv.appendChild(completedButton)
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-minus-circle"></i>';
    deleteButton.classList.add("delete-button");
    todoDiv.appendChild(deleteButton);
    todoList.appendChild(todoDiv);
    saveLocalTodos(text, hora, "undefined");

    console.log("Writing succesful");

    TTS(text, hora);
}

function TTS(palabra, hora){

    //VALIDACION DE HORA PARA MANTENER INTEGRIDAD
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(hora);
    let speech = new p5.Speech();


    //INPUT DE VOZ PARA INTERACTUAR CON EL FORMULARIO, SI SE DICE ESCRIBIR SE VA A CREAR UN LI EN EL LISTADO DE TODO, SI SE DICE
    //HABLAR, SE ACTIVA LA FUNCION TTS, LA FUNCION TTS SE ACTIVA POR DEFECTO SI SE DICE ESCRIBIR.
    if(palabra === "Escribiendo" || palabra === "Hablando")
        document.getElementById("checkvoice").checked = true;

    console.log("Talking");
    
    if (document.getElementById("checkvoice").checked){
        if(isValid && hora != "undefined")
            speech.speak(palabra + "a las" + hora + " minutos.");
        else
            speech.speak(palabra);
    }
}

function startAudio(){
    //FUNCION PARA CUMPLIR LA POLITICA DE NAVEGADOR CHROME p5.sound.js:175 The AudioContext was not allowed to start.
    //It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu
    let audio = new AudioContext();
    console.log("Audio loaded and resumed")
    audio.resume();
}

function keyRecognition(event){
    let speechRec = new p5.SpeechRec(lang);
    //event.preventDefault();
    if(event.keyCode=="86"){
        if(toogle %2 == 0){
            console.log("Listening");
            speechRec.start();
        }
        if(toogle %2 != 0){
            console.log("Not Listening");
            speechRec.stop();
        }
        ++toogle;
        speechRec.onResult = gotSpeech;
        function gotSpeech(){
            gotSpeech3(speechRec);
        }
        console.log(toogle);
    }
}

function gotSpeech3(speechRec){
    console.log(speechRec.resultString);
    if(speechRec.resultString === "Escribir" || speechRec.resultString === "escribir"){
        TTS("Escribiendo","undefined");
        toogle = 0;
        voicerecognition();
    }
    
    if(speechRec.resultString === "Hablar" || speechRec.resultString === "hablar"){
        check = check == 1 ? 2 : 1;
        TTS("Hablando","undefined");
        toogle = 0;
        if(check == 2)        
            document.getElementById("checkvoice").checked = true;
        if(check == 1)
            document.getElementById("checkvoice").checked = false;
    }
}

function fetchurl(event){
    let tasks, x;
    event.preventDefault();
    var url = "http://localhost:3000/tasks";
    $.getJSON(url, function (data){
        //console.log(data);
        x = Math.floor(Math.random() * Object.keys(data).length);

        const todoDiv = document.createElement('div');
        todoDiv.classList.add("todo");

        const newTodo = document.createElement('li');
        newTodo.innerText = data[x].description;
        newTodo.classList.add("todo-item");
        todoDiv.appendChild(newTodo);

        const todourl = document.createElement('li');
        todourl.innerText = data[x].url;
        todourl.classList.add("hide");
        todourl.setAttribute('id', 'url');
        todoDiv.appendChild(todourl);

        const completedButton = document.createElement('button');
        completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
        completedButton.classList.add("complete-button");
        todoDiv.appendChild(completedButton)

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-minus-circle"></i>';
        deleteButton.classList.add("delete-button");
        todoDiv.appendChild(deleteButton);

        const videoEmbed = document.createElement('button');
        videoEmbed.innerHTML = '<i class="fab fa-youtube"></i>';
        videoEmbed.classList.add("video-embed");
        todoDiv.appendChild(videoEmbed);

        todoList.appendChild(todoDiv);
        saveLocalTodos(data[x].description, "undefined", data[x].url);

        TTS(data[x].description, "undefined")
    });
}

function cerrarReproductor(event){
    event.preventDefault();
    document.getElementById("frame-container").style.display="none";
}