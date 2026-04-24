name: Directus 宝塔迁移执行追踪

overview:
- 目标：在现有阿里云 + 宝塔 + MySQL + CDN 环境中，分阶段完成 mint_bio 新闻模块向 Directus 后台的最低可行版迁移。
- 工作方式：长期维护本文件，每次执行前先读取，每次执行后更新当前阶段、进展、阻塞与下一步。
- 当前确认方案：`Directus + 现有阿里云服务器/数据库 + 工程外媒体目录 + 现有 CDN`。

todos:
- [x] 完成环境盘点与备份方案确认
- [x] 完成宝塔站点与 Directus 部署
- [~] 完成数据库与媒体目录配置（本地卷完成，`/assets/*` CDN 缓存未做）
- [ ] 完成内容模型与权限配置
- [ ] 完成历史数据迁移
- [ ] 完成官网读接口适配
- [ ] 完成前端切流与验收

## Current Status
- 当前状态：`Phase 1 - 环境盘点与备份` 已收口；`Phase 2 - 宝塔站点与 Directus 部署` 已整体收官。
- 当前入口：生产域名 `https://cms.mint-bio.cn`（`cms.mint-bio.cn` → 101.200.45.52 → 宝塔 Nginx → `127.0.0.1:8055` Directus 容器）。
- 验收通过：HTTPS (Let's Encrypt R13, 有效期至 `2026-07-21`) + 301 强跳 + WebSocket 升级 + `PUBLIC_URL` 全链路生效 + 上传目录权限收紧至 `www:www/755-644`。后台上传测试图片回显的资源 URL 为 `https://cms.mint-bio.cn/assets/<uuid>`，协议与域名正确。
- 阶段判断：Phase 2 已收官。下一轮主线可进入 Phase 3（CDN 接入 / `/assets/*` 缓存策略 / 图片验证），或先处理安全收尾（8055 公网端口收敛 + `ADMIN_*` 凭据移至 `.env`）。




## Current Phase
- `phase_2_directus_deployment` = `done`
- `phase_3_database_and_storage` = `partial`（本地卷已打通，`/assets/*` CDN 缓存策略未做）



## Confirmed Background
- 现有阿里云服务器已部署网站后台。
- 现有环境使用宝塔面板管理站点与 MySQL。
- 已有 CDN 与域名可复用。
- 不希望引入新增订阅成本。
- 后续主要由非技术运营维护，要求浏览器可操作、无本地环境依赖。
- 新闻复杂度不高，当前重点是快速、稳定、低成本落地。

## Confirmed Decisions
- 采用 `Directus` 自建，不采用 SaaS CMS。
- 官网前端继续保留当前 Vue 项目，改为运行时读新接口。
- 媒体文件存放在工程外目录，不放在前端仓库内。
- 一期不引入 `COS`，后续按资源增长再升级。
- 推荐官网读接口与 Directus 管理接口解耦。

## Phase Checklist

### Phase 1 - 环境盘点与备份
- [x] 确认宝塔中现有站点和域名映射（`mint-bio.cn` -> `/www/wwwroot/mint-bio.cn`）
- [x] 确认可在宝塔中新增 `cms` 子域名站点入口（`cms.mint-bio.cn` 可录入；仍待 DNS 解析与证书申请验证）
- [x] 确认 MySQL 版本、账号权限、可否新建独立数据库（本地 `MySQL 5.7.40`，宝塔具备新增数据库入口）
- [x] 确认是否支持 Docker；若不支持则准备 Node + PM2 路线（当前 `Docker` / `Node.js` / `npm` / `pm2` 均未安装）
- [x] 确认服务器可用目录与磁盘空间（根分区剩余约 `27G`）
- [x] 确认当前数据库备份与站点备份方式（当前无现成备份，需先补手工备份）
- [ ] 记录现网回滚入口


### Phase 2 - 宝塔站点与 Directus 部署
- [x] 创建或规划 `cms` 站点入口
- [x] 部署 Directus 服务
- [x] 配置宝塔反向代理到 Directus
- [x] 配置 HTTPS
- [x] 验证后台可访问

### Phase 3 - 数据库与媒体目录配置
- [x] 创建独立 CMS 数据库
- [x] 配置 Directus 数据库连接
- [x] 创建工程外上传目录
- [x] 配置上传目录权限
- [ ] 配置 `/assets/*` 访问与 CDN 缓存
- [x] 验证图片上传与访问


### Phase 4 - 内容模型与权限配置
- [ ] 建立 `news_categories`
- [ ] 建立 `news_articles`
- [ ] 配置 `content_blocks`
- [ ] 配置 `Editor` / `Admin` 权限
- [ ] 验证运营可完成新闻新增与发布

### Phase 5 - 历史数据迁移
- [ ] 冻结旧字段映射关系
- [ ] 导入分类
- [ ] 导入历史图片/视频
- [ ] 导入新闻文章
- [ ] 完成抽检与修正

### Phase 6 - 官网读接口适配
- [ ] 输出 `GET /api/news/latest`
- [ ] 输出 `GET /api/news/list`
- [ ] 输出 `GET /api/news/detail/:slug`
- [ ] 输出 `GET /api/news/categories`
- [ ] 验证返回结构与前端需求一致

### Phase 7 - 前端切流与验收
- [ ] 首页切新接口
- [ ] 列表页切新接口
- [ ] 详情页切新接口
- [ ] 移动端联调
- [ ] 验证 CDN 资源访问
- [ ] 保留旧 JSON 回滚开关
- [ ] 正式切流

## Blockers / Risks
- 当前阻塞：无。
- 风险 1：`8055` 端口目前仍对 `0.0.0.0` 暴露（`docker-proxy` 层），理论上任何人若进入服务器网络均可绕过宝塔反代直连 Directus。下一轮必须用阿里云安全组或 iptables 对 8055 做收敛（仅允许本机 / 仅允许 127.0.0.1）。
- 风险 2：若后续升级 Directus（当前 `11.14.1`，上游已 `11.17.3`）或重装容器，`www:www / 755-644` 权限会保持，但要注意升级 compose 时的 env 注入方式是否仍一致。
- 风险 3：若未来 Docker 网桥网段变化，`172.18.0.%` 的 MySQL 授权可能再次失效；首启稳定后可再评估是否改为更宽但受控的 host 策略。
- 风险 4：Directus 占位页曾因浏览器对早期 917 字节的 `index.html` 生成过 ETag 缓存而回显，非服务端问题；若日后出现类似"域名首页变静态页"需先排除浏览器/CDN 缓存。

## Next Actions
1. 阿里云安全组 / iptables 收敛 `8055` 端口：仅允许本机回环，公网一律拒绝；验证宝塔反代仍可用、直接访问 `http://<公网IP>:8055/` 为超时。
2. 进入 Phase 3 剩余项：为 `https://cms.mint-bio.cn/assets/*` 配置 CDN 回源与缓存策略（根据 Directus 的 transformation 参数做合理的 Vary / cache key）。
3. 进入 Phase 4：内容建模 `news_categories` / `news_articles` / `content_blocks`，并配置 `Editor` / `Admin` 角色权限。
4. （可选）评估是否将 Directus 升级到 `11.17.3` 后再进入 Phase 4，避免建模后再升级带来的迁移风险。












## Execution Log
- 2026-03-22：完成新闻系统现状分析，确认新闻后台改造方向。
- 2026-03-22：完成 CMS 选型分析，确认采用最低可行版 `Directus + 现有阿里云服务器/数据库 + 工程外媒体目录 + 现有 CDN`。
- 2026-03-22：输出详细实施蓝图 `news-cms-mvp-blueprint.md`。
- 2026-03-22：补充确认现有环境使用宝塔面板，判断宝塔对方案为利好因素，并创建长期迁移执行追踪文件与专用技能。
- 2026-03-23：根据宝塔截图与服务器命令输出，确认现网站点为 `mint-bio.cn`，站点目录 `/www/wwwroot/mint-bio.cn`，宝塔本地 MySQL 为 `5.7.40`，现有库 `cooperate`。
- 2026-03-23：确认服务器当前未安装 `Docker`、`Node.js`、`npm`、`pm2`，根分区剩余约 `27G`；判定数据库可优先走“复用现有 MySQL + 独立新库”，部署则需先补运行时。
- 2026-03-23：根据宝塔“添加站点”界面，确认宝塔侧可创建 `cms.mint-bio.cn` 站点入口；根据系统命令确认服务器为 `Alibaba Cloud Linux 3.2104 U12.2`。
- 2026-03-23：确认当前无现成站点/数据库备份，因此将下一步优先级调整为“先补最小备份，再建站并安装 Docker”。
- 2026-03-23：`cms.mint-bio.cn` 站点与独立数据库已创建，但 `docker compose up -d` 拉取 `directus/directus:11.14.1` 时访问 `registry-1.docker.io` 超时；当前将 Phase 2 阻塞收敛为“先修复镜像拉取”。
- 2026-03-23：镜像拉取问题已解除，`mintbio-directus` 容器可启动；但本机执行 `curl http://127.0.0.1:8055/server/health` 返回 `Recv failure: Connection reset by peer`，当前将 Phase 2 阻塞收敛为“确认容器内 Directus 进程状态与宿主机 MySQL 连通性”。
- 2026-03-23：已在 MySQL 中确认 `mintbio_cms` 仅有 `127.0.0.1` / `localhost` 授权，并新增 `172.18.0.%` host 记录；当前剩余问题是本轮曾使用占位符密码，需要按 `docker-compose.yml` 的真实 `DB_PASSWORD` 再次执行 `ALTER USER` 或 `GRANT`，完成密码对齐后重启 Directus 复验。
- 2026-03-23：已完成密码对齐，`mintbio-directus` 当前处于 `Up`，`/server/health` 已从连接 reset 收敛为 `HTTP 503`；日志显示 `storage:local:responseTime in ERROR state`，错误为 `EACCES: permission denied, open '/directus/uploads/directus-health-file'`。
- 2026-03-23：宿主机已对 `uploads` / `extensions` 目录执行 `chmod -R 777`，且容器内 `touch /directus/uploads/.perm-test` 返回 `ok`；当前进一步怀疑固定健康文件 `directus-health-file` 存在历史权限残留，需要删除后只观察重启后的最新日志与健康检查结果。
- 2026-03-23：等待并清理后，本机 `curl -i http://127.0.0.1:8055/server/health` 已恢复为 `HTTP/1.1 200` 与 `{"status":"ok"}`；当前确认 Directus 服务本身可用，后续进入 `PUBLIC_URL` / `SECRET` 收口以及宝塔反向代理、HTTPS 配置阶段。
- 2026-04-22：Phase 2 收官 Part 1（HTTPS）：在宝塔 `cms.mint-bio.cn` 站点申请 Let's Encrypt 证书成功（R13，`notAfter=2026-07-21`），开启强制 HTTPS；`curl -I http://cms.mint-bio.cn/` 返回 `301 -> https://cms.mint-bio.cn/`。期间订正文档事实：环境描述由"腾讯云"改为"阿里云"，SKILL 与 plan 文档同步修正。
- 2026-04-22：Phase 2 收官 Part 2（反向代理新增）：确认之前"宝塔反代已做"的记忆是错的，`https://cms.mint-bio.cn/` 当时返回的是宝塔默认占位页（917 字节）。在宝塔站点反向代理面板新建 `directus` 反代指向 `http://127.0.0.1:8055`，`发送域名=$host`；验证后 `https://cms.mint-bio.cn/` 改为返回 `HTTP/2 302 Location: ./admin`、`x-powered-by: Directus`。
- 2026-04-22：Phase 2 收官 Part 3（反代头补丁）：新建 `/www/server/panel/vhost/nginx/extension/cms.mint-bio.cn/directus-extra.conf`，追加 `proxy_set_header X-Forwarded-Proto $scheme;` / `client_max_body_size 100M` / `proxy_read_timeout 86400` / `proxy_send_timeout 86400`；利用宝塔全局 `0.websocket.conf` 已定义的 `$connection_upgrade`，原生反代块里的 `Upgrade` / `Connection` 升级头自动生效。`nginx -t` 通过、`nginx -s reload` 成功。
- 2026-04-22：Phase 2 收官 Part 4（compose 收口）：备份 `/srv/mintbio/directus/docker-compose.yml`；用 Python 脚本在 `WEBSOCKETS_ENABLED` 行之后新增 `PUBLIC_URL: "https://cms.mint-bio.cn"`，并把 `SECRET` 从 16 字节占位符替换为 `openssl rand -base64 48` 生成的 64 字节随机串；`SECRET` 明文落盘至 `/root/mintbio-backups/directus-secret.txt`（`chmod 600`，root only），不入仓库。`docker compose up -d` 重建容器后，启动日志不再出现 `"SECRET" env variable is shorter` 与 `"PUBLIC_URL" should be a full URL` 两类 WARN，`GraphQL Subscriptions` / `WebSocket Server` / `Server started` 三条关键 INFO 均正常。
- 2026-04-22：Phase 2 收官 Part 5（目录权限收紧）：确认容器内 Directus 以 `uid=1000 gid=1000 (node)` 运行；宿主机 uid 1000 对应宝塔 `www` 用户（命名巧合，不影响安全边界）。`chown -R 1000:1000 + find -type d -exec chmod 755 + -type f -exec chmod 644` 后，目录由 `root:root 777` 收紧为 `www:www 755`；容器内 `touch /directus/uploads/.perm-test-*` 与 `extensions` 写测试均通过；本机与域名健康检查均 `200`。
- 2026-04-22：Phase 2 收官 Part 6（端到端验收）：`docker ps` = `Up`；三类 WARN 计数均为 `0`；容器内 `$PUBLIC_URL=https://cms.mint-bio.cn`、`$SECRET length=64`、`$WEBSOCKETS_ENABLED=true`；`https /` → 302、`https /admin/` → 200、`https /server/health` → 200、`http /` → 301；Let's Encrypt 证书 subject=`cms.mint-bio.cn`、issuer=`Let's Encrypt R13`、至 `2026-07-21`。浏览器端登录后台上传测试图片 `.png` 成功，右侧 Open in New Window 打开的直链为 `https://cms.mint-bio.cn/assets/<uuid>`（协议 + 域名正确），图片正常显示；宿主机 `uploads/` 新生成 `<uuid>.png` 与两份变换后的 `.avif` 缩略图，owner=`www:www`、mode=`644`。Phase 2 完全收官。










