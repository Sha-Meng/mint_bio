# 官网留资 CRM 接入上线说明

## 1. 目前实现框架

官网“洽谈合作 / 联系我们”表单已经接入后端，前端无需新增页面。

当前链路：

```text
官网前端
  -> POST /api/contact/submit
  -> Nginx /api/ 反向代理
  -> http://127.0.0.1:8080
  -> Go 服务 contact_api
  -> MySQL contacts 表
```

服务器上已确认：

```text
后端目录：/root/go_projects/contact_api
源码文件：/root/go_projects/contact_api/main.go
可执行文件：/root/go_projects/contact_api/contact_api
监听端口：8080
接口路径：/api/contact/submit
```

Nginx 当前配置：

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:8080;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

前端提交字段：

```json
{
  "name": "姓名",
  "email": "邮箱",
  "phone": "手机号",
  "message": "需求描述"
}
```

当前后端逻辑：

```text
解析请求
校验字段
写入 contacts 表
返回 {"message": "提交成功"}
```

## 2. 接入原则

本次 CRM 接入建议保持以下内容不变：

```text
前端不变
接口路径 /api/contact/submit 不变
Nginx 代理不变
服务器不变
contacts 表原有写入逻辑不变
前端成功响应格式不变
```

只需要在 Go 后端 `main.go` 中，**contacts 表写入成功后，追加同步 CRM 的逻辑**。

推荐顺序：

```text
1. 先保存到本地 contacts 表
2. 再同步到 CRM
3. CRM 同步失败只记录日志，不影响官网提交成功
```

这样即使 CRM 临时不可用，官网留资也不会丢。

## 3. CRM 方需要提供

对接前，需要 CRM 方提供：

```text
CRM 创建线索 API 地址
测试环境和正式环境地址
鉴权方式，例如 Token、appKey + secret、OAuth
请求 Header 要求
请求 Body 示例
成功响应示例
失败响应示例
字段映射表
必填字段和枚举值
手机号/邮箱重复时的处理规则
是否需要服务器 IP 白名单
```

建议字段映射：

| 官网字段 | 含义 | CRM 字段 |
| --- | --- | --- |
| `name` | 姓名 | 由 CRM 方提供 |
| `email` | 邮箱 | 由 CRM 方提供 |
| `phone` | 手机号 | 由 CRM 方提供 |
| `message` | 需求描述 | 由 CRM 方提供 |
| `source` | 线索来源 | 官网洽谈合作 |

## 4. 后端怎么修改

进入后端目录：

```bash
cd /root/go_projects/contact_api
```

编辑：

```text
main.go
```

在当前数据库写入成功后追加 CRM 同步。

现有代码位置类似：

```go
_, err = db.Exec("INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
        req.Name, req.Email, req.Phone, req.Message)
if err != nil {
        http.Error(w, "数据库写入失败", http.StatusInternalServerError)
        return
}
```

修改为：

```go
_, err = db.Exec("INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
        req.Name, req.Email, req.Phone, req.Message)
if err != nil {
        http.Error(w, "数据库写入失败", http.StatusInternalServerError)
        return
}

if err := syncToCRM(req); err != nil {
        log.Printf("CRM 同步失败: %v", err)
}
```

然后新增 `syncToCRM` 函数。下面是模板，实际字段按 CRM 文档调整：

```go
func syncToCRM(req ContactRequest) error {
        apiURL := os.Getenv("CRM_API_URL")
        token := os.Getenv("CRM_TOKEN")

        if apiURL == "" || token == "" {
                return fmt.Errorf("CRM 配置缺失")
        }

        payload := map[string]string{
                "name":    req.Name,
                "email":   req.Email,
                "phone":   req.Phone,
                "message": req.Message,
                "source":  "官网洽谈合作",
        }

        body, err := json.Marshal(payload)
        if err != nil {
                return err
        }

        client := &http.Client{Timeout: 5 * time.Second}
        crmReq, err := http.NewRequest("POST", apiURL, bytes.NewReader(body))
        if err != nil {
                return err
        }

        crmReq.Header.Set("Content-Type", "application/json")
        crmReq.Header.Set("Authorization", "Bearer "+token)

        resp, err := client.Do(crmReq)
        if err != nil {
                return err
        }
        defer resp.Body.Close()

        if resp.StatusCode < 200 || resp.StatusCode >= 300 {
                return fmt.Errorf("CRM 返回状态码: %d", resp.StatusCode)
        }

        return nil
}
```

对应需要在 `import` 里补充：

```go
"bytes"
"os"
"time"
```

注意：CRM 的 Token、Secret 不要写死在代码里，建议用环境变量或服务配置文件。

## 5. 上线步骤

### 5.1 备份

```bash
cd /root/go_projects/contact_api
cp main.go main.go.bak.$(date +%Y%m%d%H%M%S)
cp contact_api contact_api.bak.$(date +%Y%m%d%H%M%S)
```

### 5.2 配置 CRM 环境变量

示例：

```bash
export CRM_API_URL="https://crm.example.com/api/leads"
export CRM_TOKEN="replace-with-real-token"
```

如果服务由 systemd 管理，建议写到 systemd service 的 `Environment` 中。

### 5.3 编译

```bash
go build -o contact_api.new main.go
```

### 5.4 确认当前启动方式

```bash
ps -ef | grep contact_api
systemctl status contact_api
systemctl status contact-api
```

如果不是 systemd 管理，先确认是否由宝塔、supervisor、nohup 或其他方式守护，不要直接盲目 kill。

### 5.5 替换可执行文件

```bash
mv contact_api contact_api.old.$(date +%Y%m%d%H%M%S)
mv contact_api.new contact_api
chmod +x contact_api
```

### 5.6 重启服务

如果是 systemd：

```bash
systemctl restart contact_api
```

如果不是 systemd，按服务器现有方式重启 `contact_api`。

## 6. 验证

确认 8080 端口正常：

```bash
ss -ltnp | grep ':8080'
```

测试接口：

```bash
curl -X POST http://127.0.0.1:8080/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","email":"test@example.com","phone":"13800138000","message":"CRM同步测试"}'
```

期望返回：

```json
{"message": "提交成功"}
```

上线后确认：

```text
contacts 表新增记录
CRM 后台新增线索
官网前端提交正常
服务器日志没有异常
CRM 失败时只记录日志，不影响接口成功返回
```

## 7. 回滚

如果上线异常，恢复备份：

```bash
cd /root/go_projects/contact_api
mv contact_api contact_api.bad.$(date +%Y%m%d%H%M%S)
cp contact_api.bak.备份时间 contact_api
chmod +x contact_api
```

然后按原方式重启服务。

如源码也要回滚：

```bash
cp main.go.bak.备份时间 main.go
```

## 8. 结论

CRM 接入不需要改官网前端，也不需要改 Nginx。

只需修改：

```text
/root/go_projects/contact_api/main.go
```

在现有 `contacts` 表写入成功后，追加 CRM 同步逻辑，并保持原接口响应不变。
