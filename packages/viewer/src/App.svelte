<script>
  import DocumentView from "./components/DocumentView.svelte";
  import Modal from "svelte-simple-modal";
  import { setContext } from "svelte";

  let tasks = [];
  setContext("tasks", () => tasks);

  window.addEventListener(
    "message",
    (event) => {
      tasks = event.data.tasks;
    },
    false
  );
</script>

<Modal>
  <DocumentView />
</Modal>
