# frozen_string_literal: true

# name: discourse-auto-sso
# about: 使用 next-auth session 实现自动 SSO
# version: 0.1
# authors: Charles Chiu

enabled_site_setting :auto_sso_enabled
enabled_site_setting :auto_sso_verify_session_url

after_initialize do
  # 添加自动 SSO 检查
  module ::AutoSSO
    class Engine < ::Rails::Engine
      engine_name "auto_sso"
      isolate_namespace AutoSSO
    end
  end
end
