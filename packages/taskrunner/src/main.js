// structure:
// [
// { incomingEdges: [...], type: <type>, payload: [...]}
// ]

export const TASK_TYPE = {
  DOWNLOAD: 0,
  JS: 1,
};

export const TASK_STATE = {
  PENDING: 0,
  EXECUTING: 1,
  COMPLETE: 2,
};

function getDependencies(task, tasks) {
  return tasks.filter((task2) => task.inputs.includes(task2.id));
}

async function runTask(tasks, task) {
  task.state = TASK_STATE.EXECUTING;
  switch (task.type) {
    case TASK_TYPE.DOWNLOAD:
      task.value = await (await fetch(task.payload)).json();
      break;
    case TASK_TYPE.JS:
      const inputValues = getDependencies(task, tasks).map(
        (task) => task.value
      );
      task.value = await task.payload.apply(null, inputValues);
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
