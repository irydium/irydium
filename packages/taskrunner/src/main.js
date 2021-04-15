// structure:
// [
// { incomingEdges: [...], type: <type>, payload: [...]}
// ]

export const TASK_TYPE = {
  LOAD_SCRIPTS: 0,
  DOWNLOAD: 1,
  JS: 2,
};

export const TASK_STATE = {
  PENDING: 0,
  EXECUTING: 1,
  COMPLETE: 2,
};

// shamelessly stolen from iodide (technically MPL)
function loadScriptFromBlob(blob) {
  // for async script loading from blobs, see:
  // https://developer.mozilla.org/en-US/docs/Games/Techniques/Async_scripts
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const url = URL.createObjectURL(blob);
    script.src = url;
    document.head.appendChild(script);

    script.onload = () => resolve(`scripted loaded`);
    script.onerror = (err) => reject(new Error(err));
  });
}

function getDependencies(task, tasks) {
  return tasks.filter((task2) => task.inputs.includes(task2.id));
}

async function runTask(tasks, task) {
  task.state = TASK_STATE.EXECUTING;
  switch (task.type) {
    case TASK_TYPE.LOAD_SCRIPTS:
      task.payload.forEach(async (script) => {
        const scriptBlob = await (await fetch(script)).blob();
        await loadScriptFromBlob(scriptBlob);
      });
      break;
    case TASK_TYPE.DOWNLOAD:
      task.value = await (await fetch(task.payload)).json();
      break;
    case TASK_TYPE.JS:
      // create a map of task ids->input values to preserve expected ordering
      const inputValues = getDependencies(task, tasks).reduce((acc, task) => {
        acc[task.id] = task.value;
        return acc;
      }, {});
      task.value = await task.payload.apply(
        null,
        task.inputs.map((inputId) => inputValues[inputId])
      );
      break;
  }

  task.state = TASK_STATE.COMPLETE;
  await Promise.all(
    tasks
      .filter((task) => task.state === TASK_STATE.PENDING)
      .filter((task) => {
        return getDependencies(task, tasks).every(
          (task) => task.state === TASK_STATE.COMPLETE
        );
      })
      .map(async (task) => {
        await runTask(tasks, task);
      })
  );

  return task;
}

export async function runTasks(tasks) {
  await Promise.all(
    tasks
      .filter((task) => !task.inputs || !task.inputs.length)
      .map(async (task) => {
        await runTask(tasks, task);
      })
  );
  return tasks;
}
