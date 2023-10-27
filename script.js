document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const updateTaskBtn = document.getElementById("updateTaskBtn");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const sortByDueDateBtn = document.getElementById("sortByDueDateBtn");

  let isUpdating = false;
  let updatingIndex = null;

  document.getElementById("dueDate").addEventListener("change", (e) => {
    e.preventDefault();
    if (
      new Date(e.target.value).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0)
    ) {
      var today = new Date();
      e.target.value = today.toISOString().substr(0, 10);
      alert("Select Valid Date");
    }
  });

  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const typeOfWork = document.getElementById("typeOfWork").value;

    if (isUpdating) {
      updateTask(
        updatingIndex,
        title,
        description,
        dueDate,
        priority,
        typeOfWork
      );
    } else {
      const task = {
        title,
        description,
        dueDate,
        priority,
        typeOfWork,
        completed: false,
      };
      addTask(task);
    }

    taskForm.reset();
    setAddTaskMode();
  });

  taskList.addEventListener("change", function (e) {
    if (e.target.type === "checkbox") {
      const index = e.target.dataset.index;
      toggleCompleted(index);
    }
  });

  taskList.addEventListener("click", function (e) {
    if (e.target.classList.contains("update-btn")) {
      const index = e.target.dataset.index;
      setUpdateTaskMode(index);
    } else if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;
      deleteTask(index);
    }
  });

  updateTaskBtn.addEventListener("click", function () {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const typeOfWork = document.getElementById("typeOfWork").value;

    if (isUpdating && updatingIndex !== null) {
      updateTask(
        updatingIndex,
        title,
        description,
        dueDate,
        priority,
        typeOfWork
      );
      taskForm.reset();
      setAddTaskMode();
    }
  });

  sortByPriorityBtn.addEventListener("click", function () {
    sortTasks("priority");
  });

  sortByDueDateBtn.addEventListener("click", function () {
    sortTasks("dueDate");
  });

  function sortTasks(sortBy) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.sort((a, b) => {
      if (sortBy === "priority") {
        return getPriorityValue(b.priority) - getPriorityValue(a.priority);
      } else if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      return 0;
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
  }

  function getPriorityValue(priority) {
    switch (priority) {
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      default:
        return 0;
    }
  }

  function addTask(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
  }

  function updateTask(
    index,
    title,
    description,
    dueDate,
    priority,
    typeOfWork
  ) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks[index].title = title;
    tasks[index].description = description;
    tasks[index].dueDate = dueDate;
    tasks[index].priority = priority;
    tasks[index].typeOfWork = typeOfWork;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
  }

  function displayTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    taskList.innerHTML = "";

    // Group tasks by type of work
    const tasksByTypeOfWork = tasks.reduce((acc, task, index) => {
      if (!acc[task.typeOfWork]) {
        acc[task.typeOfWork] = [];
      }
      acc[task.typeOfWork].push({ ...task, index });
      return acc;
    }, {});

    // Display tasks by type of work
    for (const typeOfWork in tasksByTypeOfWork) {
      const typeOfWorkElement = document.createElement("div");
      typeOfWorkElement.classList.add("type-of-work");
      typeOfWorkElement.innerHTML = `<h2>${typeOfWork}</h2>`;

      tasksByTypeOfWork[typeOfWork].forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        if (task.completed) {
          taskElement.classList.add("completed");
        }

        taskElement.innerHTML = `
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <p>Due Date: ${task.dueDate}</p>
          <p>Priority: ${task.priority}</p>
          <p>Type of Work: ${task.typeOfWork}</p>
          <input type="checkbox" data-index="${task.index}" ${
          task.completed ? "checked" : ""
        }>
          <button class="delete-btn" data-index="${task.index}">Delete</button>
          <button class="update-btn" data-index="${task.index}">Update</button>
        `;

        typeOfWorkElement.appendChild(taskElement);
      });

      taskList.appendChild(typeOfWorkElement);
    }
  }

  function deleteTask(index) {
    if (confirm("Are You Sure You Want To Delete This Task")) {
      let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      displayTasks();
    }
  }

  function toggleCompleted(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
  }

  function setUpdateTaskMode(index) {
    isUpdating = true;
    updatingIndex = index;
    addTaskBtn.style.display = "none";
    updateTaskBtn.style.display = "inline-block";

    const taskToUpdate = JSON.parse(localStorage.getItem("tasks"))[index];
    document.getElementById("title").value = taskToUpdate.title;
    document.getElementById("description").value = taskToUpdate.description;
    document.getElementById("dueDate").value = taskToUpdate.dueDate;
    document.getElementById("priority").value = taskToUpdate.priority;
    document.getElementById("typeOfWork").value = taskToUpdate.typeOfWork;
  }

  function setAddTaskMode() {
    isUpdating = false;
    updatingIndex = null;
    addTaskBtn.style.display = "inline-block";
    updateTaskBtn.style.display = "none";
  }

  displayTasks();
});
