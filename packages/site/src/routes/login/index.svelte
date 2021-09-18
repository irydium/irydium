<script lang="ts">
  import { login } from "../../state/serverActions";
  import { user } from "../../state/sessionStore";

  const isLoggedIn =
    process.browser &&
    new URLSearchParams(window.location.search).get("logged_in");

  $: {
    if (!$user && !isLoggedIn) {
      login("/login?logged_in=1");
    } else if ($user) {
      window.opener.loginSuccess();
      window.opener.focus();
      window.close();
    }
  }
</script>

<p>Logging in...</p>

<style>
  p {
    padding: 20px;
  }
</style>
