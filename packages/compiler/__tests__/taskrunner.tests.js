import { TASK_TYPE, TASK_STATE, runTasks, updateTask } from "../src/taskrunner";

global.fetch = jest.fn(() =>
  Promise.resolve({
    headers: { get: () => "application/json" },
    json: () => Promise.resolve(42),
  })
);

describe("basic tests for runTasks", () => {
  it("can handle one fetch operation", async () => {
    const tasks = [
      {
        id: "foo_com",
        type: TASK_TYPE.DOWNLOAD,
        payload: "https://foo.com",
        state: TASK_STATE.PENDING,
      },
    ];

    const taskRun = runTasks(tasks);

    expect(tasks).toEqual([
      {
        id: "foo_com",
        type: TASK_TYPE.DOWNLOAD,
        payload: "https://foo.com",
        state: TASK_STATE.EXECUTING,
      },
    ]);

    await taskRun;

    expect(tasks).toEqual([
      {
        id: "foo_com",
        type: TASK_TYPE.DOWNLOAD,
        payload: "https://foo.com",
        state: TASK_STATE.COMPLETE,
        value: 42,
      },
    ]);
  });

  it("one fetch operation, followed by a simple operation", async () => {
    const accumulatr = async (x) => x + 1;

    const tasks = [
      {
        id: "foo_com",
        type: TASK_TYPE.DOWNLOAD,
        payload: "https://foo.com",
        state: TASK_STATE.PENDING,
      },
    ];
    tasks.push({
      id: "js_task",
      type: TASK_TYPE.JS,
      payload: accumulatr,
      state: TASK_STATE.PENDING,
      inputs: [tasks[0].id],
    });

    const taskRun = runTasks(tasks);

    expect(tasks).toEqual([
      {
        id: "foo_com",
        type: TASK_TYPE.DOWNLOAD,
        payload: "https://foo.com",
        state: TASK_STATE.EXECUTING,
      },
      {
        id: "js_task",
        type: TASK_TYPE.JS,
        payload: accumulatr,
        state: TASK_STATE.PENDING,
        inputs: [tasks[0].id],
      },
    ]);

    await taskRun;

    expect(tasks).toEqual([
      {
        id: "foo_com",
        type: TASK_TYPE.DOWNLOAD,
        payload: "https://foo.com",
        state: TASK_STATE.COMPLETE,
        value: 42,
      },
      {
        id: "js_task",
        type: TASK_TYPE.JS,
        payload: accumulatr,
        state: TASK_STATE.COMPLETE,
        inputs: [tasks[0].id],
        value: 43,
      },
    ]);
  });

  it("can handle an empty tasks", async () => {
    const tasks = [];
    await runTasks(tasks);
    expect(tasks).toEqual([]);
  });
});

describe("basic tests for updateTask", () => {
  it("sets one task to pending", () => {
    const tasks = [
      {
        id: "foo",
        type: TASK_TYPE.VARIABLE,
        payload: 41,
        state: TASK_STATE.COMPLETE,
        value: 41,
      },
    ];

    updateTask(tasks, tasks[0].id, 42);
    expect(tasks).toEqual([
      {
        id: "foo",
        type: TASK_TYPE.VARIABLE,
        payload: 42,
        state: TASK_STATE.PENDING,
      },
    ]);
  });

  it("updates downstream tasks too", () => {
    const tasks = [
      {
        id: "foo",
        type: TASK_TYPE.VARIABLE,
        payload: 41,
        state: TASK_STATE.COMPLETE,
        value: 41,
      },
      {
        id: "foo_downstream1",
        type: TASK_TYPE.JS,
        inputs: ["foo"],
        state: TASK_STATE.COMPLETE,
        value: 42,
      },
      {
        id: "foo_downstream2",
        type: TASK_TYPE.JS,
        inputs: ["foo"],
        state: TASK_STATE.COMPLETE,
        value: 43,
      },
      {
        id: "bar",
        type: TASK_TYPE.JS,
        state: TASK_STATE.COMPLETE,
        value: 2,
      },
    ];
    updateTask(tasks, tasks[0].id, 42);
    expect(tasks).toEqual([
      {
        id: "foo",
        type: TASK_TYPE.VARIABLE,
        payload: 42,
        state: TASK_STATE.PENDING,
      },
      {
        id: "foo_downstream1",
        inputs: ["foo"],
        type: TASK_TYPE.JS,
        state: TASK_STATE.PENDING,
      },
      {
        id: "foo_downstream2",
        inputs: ["foo"],
        type: TASK_TYPE.JS,
        state: TASK_STATE.PENDING,
      },
      {
        id: "bar",
        type: TASK_TYPE.JS,
        state: TASK_STATE.COMPLETE,
        value: 2,
      },
    ]);
  });
});
