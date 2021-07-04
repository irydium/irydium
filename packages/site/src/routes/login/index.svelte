<script lang="ts">
  import { login } from "../../state/serverActions";
  import { user } from "../../state/sessionStore";

  $: {
    if (!$user) {
      login("/login");
    } else {
      window.opener.loginSuccess();
      window.opener.focus();
      window.close();
    }
  }
</script>

<p>Logging in...</p>
