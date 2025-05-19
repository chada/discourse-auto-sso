import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "auto-sso",
  initialize(container) {
    withPluginApi("0.1", (api) => {
      const siteSettings = container.lookup("service:site-settings");
      const autoSsoEnabled = siteSettings.auto_sso_enabled;

      if (!autoSsoEnabled) {
        return;
      }

      api.onPageChange((context) => {
        // eslint-disable-next-line no-console
        console.log("onPageChange", context);

        if (!api.getCurrentUser()) {
          // eslint-disable-next-line no-console
          console.log("user not logged in");

          checkExternalAuth();
        }
      });

      function checkExternalAuth() {
        ajax("http://localhost:3002/api/sso/verify-session", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
          xhrFields: {
            withCredentials: true,
          },
        })
          .then((result) => {
            // eslint-disable-next-line no-console
            console.log("checkExternalAuth result", result);

            if (result.authenticated) {
              api.login(result.user);
            }
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error("checkExternalAuth error", error);
          });
      }
    });
  },
};
