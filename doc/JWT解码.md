# JWT 解码

## 功能概述
在浏览器里拆开 JWT 的头部和载荷，把 `exp`、`iat`、`nbf` 显示成可读时间，并标出是否过期。填写密钥后可用 Web Crypto 校验 HS256、HS384、HS512 签名。

## 关键技术栈
- Web Crypto `crypto.subtle` HMAC
- `src/lib/jwt.ts` 的 Base64URL 编解码
- 不把令牌发到服务器

## 关键组件
- `JWTDecoder.vue`
- `decodeJwt`、`verifyJwtHs`、`signJwtHs`

## 实现思路
按点号拆成三段。时间戳乘 1000 后和当前时间比较，`now >= exp` 视为已过期。校验时用密钥导入 HMAC，比对签名字节。`none` 算法只解码，不当作已通过校验。

## 功能总结
用来查看自己的调试令牌。密钥只留在当前页面内存里。
