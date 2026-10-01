// ============================================================================
// 后台外壳：MUI（Material UI）布局（client）
// ----------------------------------------------------------------------------
// MUI 是 Google Material Design 实现，大厂常用。特点：组件多、规范统一，但包体偏大。
// 必须包 ThemeProvider + CssBaseline（重置样式）。暗色通过 theme.palette.mode 切换。
// ============================================================================
'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { createTheme } from '@mui/material/styles';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Link from 'next/link';

export default function MuiTheme({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  // useMemo 缓存 theme：mode 变了才重建主题对象。
  // 注：MUI v6+ 更推荐 colorSchemes + useColorScheme（CSS 变量方案），这里用最易理解的 palette.mode。
  const theme = useMemo(
    () => createTheme({ palette: { mode: dark ? 'dark' : 'light' } }),
    [dark],
  );

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline 等价于 Tailwind 的 preflight：统一各浏览器默认样式 */}
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* 顶栏：position fixed 后，主内容要加 marginTop 避开它 */}
        <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              My Admin
            </Typography>
            <FormControlLabel
              control={<Switch checked={dark} onChange={(e) => setDark(e.target.checked)} />}
              label="暗色"
            />
          </Toolbar>
        </AppBar>

        {/* 侧边栏：variant="permanent" 常驻。sx 里给抽屉纸设置固定宽度 */}
        <Drawer
          variant="permanent"
          sx={{
            width: 220,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: 220, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <List>
            <ListItemButton component={Link} href="/admin">
              <ListItemText primary="仪表盘" />
            </ListItemButton>
            <ListItemButton component={Link} href="/admin/users">
              <ListItemText primary="用户管理" />
            </ListItemButton>
          </List>
        </Drawer>

        {/* 主内容：mt:8 避开固定顶栏（Toolbar 高度 ≈ 64px = 8*8） */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
