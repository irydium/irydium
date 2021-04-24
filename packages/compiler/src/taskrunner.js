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

function loadScript(url) {
  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.src = url;
    document.head.append(script);
    script.onload = () => {
      console.log(`Loaded ${url}`);
      resolve(`scripted loaded`);
    };
    script.onerror = (err) => reject(new Error(err));
  });
}

function getDependencies(task, tasks) {
  return tasks.filter((task2) => task.inputs.includes(task2.id));
}

async function runTask(tasks, task) {
  task.state = TASK_STATE.EXECUTING;
  console.log(`Running: ${task.id}`);
  switch (task.type) {
    case TASK_TYPE.LOAD_SCRIPTS:
      for (const script of task.payload) {
        // FIXME: we should load them in parallel, but evaluate them synchronously
        console.log(`Loading ${script}`);
        await loadScript(script);
      }
      break;
    case TASK_TYPE.DOWNLOAD:
      task.value = await fetch(task.payload).then((r) => {
        const mimeType = r.headers.get("Content-Type").split(";")[0];
        // FIXME: should probably also allow to specify that something is json in header
        // and use that here as a hint
        if (mimeType === "application/json") return r.json();
        return r.blob();
      });
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
  console.log(`Done: ${task.id}`);

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
  return await Promise.all(
    tasks
      .filter((task) => !task.inputs || !task.inputs.length)
      .map(async (task) => {
        await runTask(tasks, task);
      })
  );
}
