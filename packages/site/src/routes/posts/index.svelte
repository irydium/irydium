<script lang="ts">
  import {
    createLoginWindow,
    logout,
    getDocumentSummariesForUser,
  } from "../../state/serverActions";
  import { user } from "../../state/sessionStore";

  let posts = [];

  async function _login() {
    createLoginWindow();
  }

  async function _logout() {
    try {
      await logout();
    } catch (error) {
      alert(error.error_description || error.message);
    }
  }

  async function _getPosts() {
    try {
      posts = await getDocumentSummariesForUser();
    } catch (error) {
      alert(error.message);
      // FIXME: handle this better
    }
  }

  $: $user && $user.id && _getPosts();
</script>

<svelte:head>
  <title>Posts</title>
</svelte:head>
<div class="body">
  <h1>Your posts</h1>
  {#if $user}
    {$user.email}
    (<button on:click={_logout}>Logout</button>)

    <ul>
      {#each posts as post}
        <li><a href="/repl?id={post.id}">{post.title}</a></li>
      {/each}
    </ul>
  {:else}
    Please
    <button on:click={_login}>log in</button>
    to see your posts.
  {/if}
</div>

<style>
  .body {
    padding: 6rem;
  }
</style>
