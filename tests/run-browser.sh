#!/usr/bin/env bash
# 用 agent-browser 对 /basic 页面做浏览器级全量冒烟：
# 渲染 → 验证码图 → 树形新增(走页面表单) → 刷新树 → 验证码校验(真实码) → 图片上传
# 依赖：TEST_BASE 指向运行中的 Next 服务（默认 http://localhost:3210）
set -uo pipefail

BASE="${TEST_BASE:-http://localhost:3210}"

# 确保 agent-browser 在 PATH（全局安装常见位置兜底）
if ! command -v agent-browser >/dev/null 2>&1; then
  export PATH="$PATH:/c/Users/Administrator/AppData/Local/pnpm:$HOME/AppData/Local/pnpm"
fi
command -v agent-browser >/dev/null 2>&1 || { echo "FAIL: agent-browser 不在 PATH"; exit 1; }

ab() { agent-browser "$@"; }
fail() { echo "FAIL: $1"; agent-browser close --all >/dev/null 2>&1 || true; exit 1; }

# 干净会话，避免复用旧 tab
agent-browser close --all >/dev/null 2>&1 || true
ab open "$BASE/basic" >/dev/null || fail "页面打开失败"
ab wait --load load

# 1) 关键区块渲染
ab wait --text "Basic 基座能力演示" || fail "标题区块缺失"
ab wait --text "图形验证码" || fail "验证码区块缺失"
ab wait --text "树形展示" || fail "树形区块缺失"

# 2) 验证码图实际渲染（data URI 的 SVG）
CAP=$(ab eval 'const i=document.querySelector("img[alt=captcha]"); i?i.src.slice(0,20):""')
echo "$CAP" | grep -q "data:image/svg" || fail "验证码图未渲染 ($CAP)"

# 3) 树形新增：走页面表单（标题 + parentId=0 + 新增）
ab find placeholder "标题" fill "浏览器冒烟节点"
ab find placeholder "parentId（0=根，可做树）" fill "0"
ab find role button click --name "新增"
ab wait --text "浏览器冒烟节点" || fail "新增 todo 未出现在列表"

# 4) 刷新树：该节点应出现在树形区
ab find role button click --name "刷新树"
ab wait --text "浏览器冒烟节点" || fail "刷新树后节点未出现"

# 5) 验证码校验：换一张拿最新码，从服务端磁盘读取真实 code 再校验
ab find role button click --name "换一张"
ab wait 300
CODEFILE=$(ls -t data/captcha/*.json 2>/dev/null | head -1)
[ -n "$CODEFILE" ] || fail "未找到验证码文件"
CODE=$(node -e "process.stdout.write(String(require('./$CODEFILE').code))")
[ -n "$CODE" ] || fail "验证码 code 为空"
ab find placeholder "输入" fill "$CODE"
ab find role button click --name "校验"
ab wait --text "✅ 校验通过" || fail "验证码校验未通过 (code=$CODE)"

# 6) 图片上传：上传一张 PNG，图片网格应多一张
printf '\x89PNG\r\n\x1a\n' > /tmp/ab_up.png
head -c 200 /dev/urandom >> /tmp/ab_up.png
BEFORE=$(ab eval 'document.querySelectorAll("img").length')
ab upload "input[type=file]" /tmp/ab_up.png
ab wait --fn "document.querySelectorAll('img').length > $BEFORE" || fail "上传后图片数量未增加"
ab wait 400

echo "browser-smoke OK"
agent-browser close --all >/dev/null 2>&1 || true
