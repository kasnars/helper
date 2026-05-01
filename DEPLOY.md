# 一键部署配置说明

## 📦 安装依赖

由于 PowerShell 执行策略限制，请使用 CMD 命令提示符运行：

```cmd
cd d:\code\helper
npm install deploy-cli-service --save-dev
```

或者修改 PowerShell 执行策略后运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install deploy-cli-service --save-dev
```

## ⚙️ 配置文件

配置文件：`deploy.config.js`

### 配置项说明

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `host` | 服务器 IP 地址 | `'192.168.1.100'` |
| `port` | SSH 端口号 | `22` |
| `username` | 登录用户名 | `'root'` |
| `password` | 登录密码 | `'your-password'` |
| `privateKey` | SSH 私钥（与 password 二选一） | `require('fs').readFileSync('/path/to/key')` |
| `path` | 服务器部署路径 | `'/var/www/html'` |
| `buildCommand` | 打包命令 | `'npm run build'` |
| `distPath` | 打包输出目录 | `'dist'` |
| `clean` | 是否清理远程目录 | `false` |

## 🚀 使用方法

### 部署到开发环境
```bash
npm run deploy:dev
```

### 部署到生产环境
```bash
npm run deploy:prod
```

## 📝 执行流程

运行部署命令后，会自动执行以下步骤：

1. ✅ 执行 `npm run build` 打包项目
2. ✅ 连接到配置的服务器
3. ✅ 上传 `dist` 文件夹到指定路径
4. ✅ 显示上传进度和结果

## 🔒 安全建议

1. **使用 SSH 密钥**而不是密码认证（更安全）
2. **不要将包含密码的配置文件提交到 Git**
3. 使用 `.gitignore` 忽略敏感配置：

```gitignore
# 在 .gitignore 中添加
deploy.config.js
```

然后创建配置模板：
```javascript
// deploy.config.example.js
module.exports = {
  dev: {
    host: 'your-server-ip',
    username: 'your-username',
    password: 'your-password',
    path: '/your/path'
  }
}
```

## 🛠️ 高级配置

### 使用 SSH 密钥
```javascript
module.exports = {
  prod: {
    host: 'your-server-ip',
    port: 22,
    username: 'root',
    privateKey: require('fs').readFileSync('C:/Users/YourName/.ssh/id_rsa'),
    path: '/var/www/html'
  }
}
```

### 自定义打包命令
```javascript
module.exports = {
  dev: {
    buildCommand: 'npm run build:dev',  // 使用特定的构建命令
    distPath: 'dist',
    // ...
  }
}
```

### 启用目录清理（谨慎使用）
```javascript
module.exports = {
  prod: {
    clean: true,  // 会删除远程目录中的旧文件
    // ...
  }
}
```

## ⚠️ 注意事项

1. 确保服务器已安装并运行 SSH 服务
2. 确保有写入目标路径的权限
3. 首次部署建议先在测试环境验证
4. 生产环境建议先备份再部署
5. 检查防火墙是否允许 SSH 端口访问

## 🐛 常见问题

**Q: 连接失败？**
- 检查服务器 IP 和端口是否正确
- 确认 SSH 服务正在运行
- 检查防火墙设置

**Q: 权限错误？**
- 确认用户有写入目标目录的权限
- 尝试使用 `sudo` 或更改目录权限

**Q: 上传速度慢？**
- 调整 `sftp.concurrency` 增加并发数
- 检查网络带宽

## 📚 更多信息

- [deploy-cli-service 文档](https://www.npmjs.com/package/deploy-cli-service)
- [SSH 密钥配置指南](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
