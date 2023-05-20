const tasks = [];
let time = 0;
let timer = null;
let timerBreak = null;
let current = null;
let workDuration = 25 * 60; // Duración predeterminada de la sesión de trabajo (25 minutos)
let breakDuration = 5 * 60; // Duración predeterminada de la sesión de descanso (5 minutos)
let paused = false;

const bAdd = document.querySelector('#bAdd');
const itTask = document.querySelector('#itTask');
const form = document.querySelector('#form');
const taskName = document.querySelector('#time #taskName');
const pauseButton = document.querySelector('#pauseButton');
const backgroundMusic = document.querySelector('#bg-music');
backgroundMusic.play();

const finishButton = document.querySelector('#finishButton');
finishButton.addEventListener('click', () => {
    const taskIndex = tasks.findIndex((task) => task.id == current);
    tasks[taskIndex].completed = true;
    paused = true;
    clearInterval(timer);
    clearInterval(timerBreak);
    timer = null;
    timerBreak = null;
    time = workDuration;
    current = null;
    taskName.innerHTML = '';
    finishButton.disabled = true;
    bAdd.disabled = false;
    renderTasks();
    const completedDiv = document.querySelector('.task .completed');
    completedDiv.innerHTML = 'Terminada ✔';
});



renderTime();
renderTasks();

form.addEventListener('submit' , e => {
    e.preventDefault();
    if (itTask.value != ''){
        createTask(itTask.value);
        itTask.value = '';
        renderTasks();
    }

    const workInput = document.querySelector('#work-duration');
    const breakInput = document.querySelector('#break-duration');
    workDuration = workInput.value * 60;
    breakDuration = breakInput.value * 60;

});

pauseButton.addEventListener('click', () => {
    paused = !paused;
  
    if (paused) {
      pauseButton.textContent = 'Continuar';
      bAdd.disabled = false;
    } else {
      pauseButton.textContent = 'Pausa';
      if (current) {
        bAdd.disabled = true;
      }
    }
  });
  

function createTask(value){

    const newTask = {
        id: (Math.random() * 100).toString(36).slice(3),
        title: value,
        completed: false
    }

    tasks.unshift(newTask);
}

function createTask(value){
        const newTask = {
            id: (Math.random() * 100).toString(36).slice(3),
            title: value,
            completed: false,
            created: Date.now(),
            sessions: 0
        }
        tasks.push(newTask);
}


function renderTasks(){
    const html = tasks.sort((a, b) => a.created - b.created).map(task => {
        return `
            <div class='task'>
                <div class='completed'>${task.completed ? `<span class='done'>En Proceso ⌛...</span>` : `<button class='start-button' data-id='${task.id}'>Empezar</button>`}</div>
                <div class='title'>${task.title}:</div>
                <div class='sessions'>${task.sessions} sesiones</div>
            </div>
        `;
    });

    const tasksContainer = document.querySelector('#tasks');
    tasksContainer.innerHTML = html.join('');

    const startButtons = document.querySelectorAll('.task .start-button');

    startButtons.forEach(button => {
        button.addEventListener('click' , e => {
            if (!timer){
                    const id = button.getAttribute('data-id');
                startButtonHandler(id);
                button.textContent = 'En Proceso ⌛...' ;
            }
        });
    })
}

function startButtonHandler(id) {
    time = workDuration;
    current = id;
    const taskIndex = tasks.findIndex((task) => task.id == id);
    taskName.textContent = tasks[taskIndex].title;
    paused = false;
    renderTime();
    timer = setInterval(() => {
        timerHandler(id);
    }, 1000);

    pauseButton.disabled = false;
    bAdd.disabled = true;
    finishButton.disabled = false;

}

function timerHandler(id) {
    if (!paused) {
        time--;
        renderTime();
    }

    if (time == 0) {
        clearInterval(timer);
        markCompleted(id);
        timer = null;
        renderTasks();
        startBreak();

        const audio = new Audio('/alarma/Sonido de alarma de reloj.mp3');
        audio.play();
    }
}

function startBreak(){
    time = breakDuration;
    taskName.textContent = 'Break';
    renderTime();
    timerBreak = setInterval(() => {
        timerBreakHandler();
    }, 1000);
}

function timerBreakHandler(){
    if (!paused) {
        time--;
        renderTime();
    }

    if (time == 12) { // Si quedan 12 segundos, reproducir la alarma
        const audio = new Audio('/alarma/Sonido de alarma de reloj.mp3');
        audio.play();
    }

    if (time == 0) {
        clearInterval(timerBreak);
        tasks.find(task => task.id == current).sessions++;
        renderTasks();
        startButtonHandler(current);
        timerBreak = null;
    }
}


function renderTime(){
    const timeDiv = document.querySelector('#time #value');
    const minutes = parseInt(time / 60);
    const seconds = parseInt(time % 60);

    timeDiv.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function markCompleted(id){
    const taskIndex = tasks.findIndex((task) => task.id == id);
    tasks[taskIndex].completed = true;
}