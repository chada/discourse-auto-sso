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

      // Todo: Listen to the logout event and log out the user from the external auth service

      // on page change, check if the user is logged in
      api.onPageChange(() => {
        if (!api.getCurrentUser()) {
          checkExternalAuth();
        }
      });

      function checkExternalAuth() {
        ajax(siteSettings.auto_sso_verify_session_url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          xhrFields: {
            withCredentials: true,
          },
        }).then((result) => {
          if (result.authenticated) {
            // 让用户自动登录
            const user = result.user;
            const ssoUrl = "/session/sso";
            const payload = {
              email: user.email,
              name: user.name,
              username: user.email.split("@")[0], // 使用邮箱前缀作为用户名
              external_id: user.id,
              avatar_url: user.image,
              require_activation: false,
            };

            // 构建 SSO 登录 URL
            const queryString = Object.keys(payload)
              .map(
                (key) =>
                  `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`
              )
              .join("&");

            window.location.href = `${ssoUrl}?${queryString}`;
          }
        });
      }
    });
  },
};
