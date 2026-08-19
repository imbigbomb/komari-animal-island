import { useEffect, useMemo, useState } from 'react';
import {
  BackTop, Button, Card, Cursor, Divider, Drawer, Footer, Form, FormItem, Icon,
  Image, Input, Loading, Modal, Notification, Progress, Radio, Select, Tag, Time,
  Title, Typewriter, Wallet,
} from 'animal-island-ui';
import item351 from 'animal-island-ui/items/item-351.png';
import item477 from 'animal-island-ui/items/item-477.png';
import { connectLive, loadInitialData, loadPingLatencies } from './api';
import type { LiveState, NodeInfo, PublicSettings } from './types';

type ViewMode = 'grid' | 'list';
type Appearance = 'light' | 'dark';
type LoginValues = { username?: string; password?: string; twoFactor?: string };

const REGION_NAMES: Record<string, string> = {
  CN: '中国大陆', HK: '中国香港', MO: '中国澳门', TW: '中国台湾',
  SG: '新加坡', US: '美国', JP: '日本', KR: '韩国', DE: '德国',
  GB: '英国', FR: '法国', CA: '加拿大', AU: '澳大利亚', RU: '俄罗斯',
  NL: '荷兰', FI: '芬兰', IN: '印度', BR: '巴西',
};

const regionCode = (region = '') => {
  const value = region.trim();
  if (/^[A-Za-z]{2}$/.test(value)) return value.toUpperCase();
  const points = [...value].map((char) => char.codePointAt(0) ?? 0);
  if (points.length === 2 && points.every((point) => point >= 0x1f1e6 && point <= 0x1f1ff)) {
    return String.fromCharCode(...points.map((point) => point - 0x1f1e6 + 65));
  }
  return value || 'UNKNOWN';
};
const regionLabel = (region = '') => {
  const code = regionCode(region);
  return code === 'UNKNOWN' ? '未知地区' : REGION_NAMES[code] || code;
};
const BRAND_COLORS = ['app-green', 'app-yellow', 'app-orange', 'app-blue', 'app-pink', 'app-teal'] as const;

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const percent = (used = 0, total = 0) => total > 0 ? clamp((used / total) * 100) : 0;
const formatPercent = (value = 0) => `${Math.round(value)}%`;
const formatBytes = (value = 0) => {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.max(0, Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1));
  return `${(value / 1024 ** index).toFixed(index > 2 ? 2 : 1)} ${units[index]}`;
};
const formatSpeed = (value = 0) => `${formatBytes(value)}/s`;
const formatMoney = (value = 0) => Number.isInteger(value) ? String(value) : value.toFixed(2);
const liveLatency = (state?: LiveState) => {
  const values = Object.values(state?.ping || {}).filter((value) => Number.isFinite(value) && value >= 0);
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
};
const latencyColor = (latency: number) => latency <= 150 ? 'app-green' : latency <= 300 ? 'app-yellow' : 'app-red';
const hasBilling = (node: NodeInfo) => Number(node.price) > 0 && Number(node.billing_cycle) !== 0;
const billingCycleLabel = (cycle = 0) => {
  if (cycle === -1) return '一次性付费';
  const presets: Record<number, string> = { 30: '每月', 92: '每季', 365: '每年', 730: '每两年' };
  return presets[cycle] || `每 ${cycle} 天`;
};
const renewalLabel = (node: NodeInfo) => {
  if (Number(node.billing_cycle) === -1) return '长期一次性';
  if (!node.expired_at) return '续期日期未设置';
  const date = new Date(node.expired_at);
  if (!Number.isFinite(date.getTime())) return '续期日期未设置';
  return `${node.auto_renewal ? '自动续期' : '到期'} ${date.toLocaleDateString('zh-CN')}`;
};
const remainingValue = (node: NodeInfo) => {
  const price = Number(node.price);
  const cycle = Number(node.billing_cycle);
  const expires = node.expired_at ? new Date(node.expired_at).getTime() : 0;
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(cycle) || cycle === 0) return 0;
  if (cycle === -1) return Math.round(price * 100) / 100;
  if (cycle < 0 || !Number.isFinite(expires) || expires <= Date.now()) return 0;
  return Math.round(price * Math.min(1, (expires - Date.now()) / (cycle * 86400000)) * 100) / 100;
};
const formatUptime = (seconds = 0) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}天 ${hours}时 ${minutes}分`;
};

function Metric({ label, used, total }: { label: string; used?: number; total?: number }) {
  const value = percent(used, total);
  const displayValue = label === 'CPU'
    ? `${Math.round(used || 0)}% / ${(total || 100).toFixed(1)}%`
    : `${formatBytes(used)} / ${formatBytes(total)}`;
  return (
    <div className="node-metric">
      <div className="metric-label"><span>{label}</span><strong>{formatPercent(value)}</strong></div>
      <Progress percent={value} size="small" showInfo={false} />
      <span className="metric-value">{displayValue}</span>
    </div>
  );
}

function NodeCard({ node, live, online, latency, showLatency, onDetails }: {
  node: NodeInfo; live?: LiveState; online: boolean; latency?: number | null; showLatency: boolean; onDetails: () => void;
}) {
  const displayedLatency = liveLatency(live) ?? latency;
  return (
    <Card className="km-node-card" color={online ? 'default' : 'brown'} pattern={online ? 'app-teal' : 'none'}>
      <div className="node-heading">
        <div>
          <span className={`status-dot ${online ? 'online' : ''}`} aria-hidden="true" />
          <strong>{node.name}</strong>
        </div>
        <div className="node-heading-tags">
          {showLatency && displayedLatency != null && <Tag className="latency-tag" size="small" color={latencyColor(displayedLatency)} variant="soft">{displayedLatency} ms</Tag>}
          <Tag size="small" color={online ? 'app-green' : 'brown'} variant="soft">{online ? '在线' : '离线'}</Tag>
        </div>
      </div>
      <div className="node-meta">
        <span>{online ? formatUptime(live?.uptime) : '等待连接'}</span>
        <span>{node.virtualization?.toUpperCase() || 'UNKNOWN'} · {node.region || '未知地区'}</span>
      </div>
      <Metric label="CPU" used={live?.cpu?.usage} total={100} />
      <Metric label="内存" used={live?.ram?.used} total={live?.ram?.total || node.mem_total} />
      <Metric label="硬盘" used={live?.disk?.used} total={live?.disk?.total || node.disk_total} />
      <Metric label="SWAP" used={live?.swap?.used} total={live?.swap?.total || node.swap_total} />
      <div className="network-grid">
        <div><strong>实时网络</strong><span>下载 {formatSpeed(live?.network?.down)}</span><span>上传 {formatSpeed(live?.network?.up)}</span></div>
        <div><strong>总流量</strong><span>接收 {formatBytes(live?.network?.totalDown)}</span><span>发送 {formatBytes(live?.network?.totalUp)}</span></div>
      </div>
      <Button type="dashed" size="small" block icon={<Icon name="icon-map" size={18} />} onClick={onDetails}>
        查看详情
      </Button>
    </Card>
  );
}

function NodeListRow({ node, live, online, onDetails }: {
  node: NodeInfo; live?: LiveState; online: boolean; onDetails: () => void;
}) {
  return (
    <Card className="km-node-row" color={online ? 'default' : 'brown'} pattern={online ? 'app-teal' : 'none'}>
      <div className="row-identity">
        <span className={`status-dot ${online ? 'online' : ''}`} aria-hidden="true" />
        <div><strong>{node.name}</strong><span>{regionLabel(node.region)} · {node.virtualization?.toUpperCase() || 'UNKNOWN'}</span></div>
      </div>
      <div className="row-stat"><span>CPU</span><strong>{formatPercent(live?.cpu?.usage)}</strong></div>
      <div className="row-stat"><span>内存</span><strong>{formatPercent(percent(live?.ram?.used, live?.ram?.total || node.mem_total))}</strong></div>
      <div className="row-stat"><span>硬盘</span><strong>{formatPercent(percent(live?.disk?.used, live?.disk?.total || node.disk_total))}</strong></div>
      <div className="row-stat row-network"><span>网络</span><strong>↓ {formatSpeed(live?.network?.down)} / ↑ {formatSpeed(live?.network?.up)}</strong></div>
      <Tag size="small" color={online ? 'app-green' : 'brown'}>{online ? '在线' : '离线'}</Tag>
      <Button type="dashed" size="small" icon={<Icon name="icon-map" size={18} />} onClick={onDetails}>详情</Button>
    </Card>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PublicSettings>({});
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [live, setLive] = useState<Record<string, LiveState>>({});
  const [online, setOnline] = useState<string[]>([]);
  const [latencies, setLatencies] = useState<Record<string, number | null>>({});
  const [pingTasksActive, setPingTasksActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [demo, setDemo] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [selected, setSelected] = useState<NodeInfo | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [backgroundVariant] = useState(() => {
    const previous = Number.parseInt(localStorage.getItem('animal-bg-variant') || '-1', 10);
    const next = Number.isFinite(previous) ? (previous + 1) % 4 : 0;
    localStorage.setItem('animal-bg-variant', String(next));
    return next;
  });
  const [appearance, setAppearance] = useState<Appearance>(() =>
    localStorage.getItem('appearance') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    let mounted = true;
    loadInitialData().then((data) => {
      if (!mounted) return;
      setSettings(data.settings); setNodes(data.nodes); setLive(data.live); setDemo(data.demo);
      if (data.demo) setOnline(Object.keys(data.live));
      window.setTimeout(() => setLoading(false), 650);
    });
    const disconnect = connectLive((nextOnline, nextLive) => {
      setOnline(nextOnline); setLive(nextLive); setDemo(false);
    }, setConnected);
    return () => { mounted = false; disconnect(); };
  }, []);

  const showLatency = settings.theme_settings?.show_latency === true;

  useEffect(() => {
    if (!showLatency || !nodes.length || demo) {
      setLatencies({});
      setPingTasksActive(false);
      return;
    }
    let active = true;
    const refresh = async () => {
      const result = await loadPingLatencies(nodes.map((node) => node.uuid));
      if (active) {
        setLatencies(result.values);
        setPingTasksActive(result.hasTasks);
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [nodes, demo, showLatency]);

  useEffect(() => {
    document.documentElement.dataset.appearance = appearance;
    localStorage.setItem('appearance', appearance);
  }, [appearance]);

  useEffect(() => {
    document.body.classList.add('animal-cursor--force');
    return () => document.body.classList.remove('animal-cursor--force');
  }, []);

  const regions = useMemo(() => ['all', ...new Set(nodes.map((node) => regionCode(node.region)).filter((code) => code !== 'UNKNOWN'))], [nodes]);
  const visibleNodes = useMemo(() => nodes.filter((node) => {
    const text = `${node.name} ${node.region || ''} ${regionLabel(node.region)} ${node.group || ''}`.toLowerCase();
    return (group === 'all' || regionCode(node.region) === group) && text.includes(query.trim().toLowerCase());
  }), [nodes, group, query]);
  const onlineCount = demo ? Object.keys(live).length : online.length;
  const liveValues = Object.values(live);
  const averageCpu = liveValues.length ? liveValues.reduce((sum, state) => sum + (state.cpu?.usage || 0), 0) / liveValues.length : 0;
  const totalDown = liveValues.reduce((sum, state) => sum + (state.network?.totalDown || 0), 0);
  const totalUp = liveValues.reduce((sum, state) => sum + (state.network?.totalUp || 0), 0);
  const speedDown = liveValues.reduce((sum, state) => sum + (state.network?.down || 0), 0);
  const speedUp = liveValues.reduce((sum, state) => sum + (state.network?.up || 0), 0);
  const current = selected ? live[selected.uuid] : undefined;
  const theme = settings.theme_settings ?? {};
  const brandTitle = theme.brand_title?.trim() || '机机森友会';
  const brandSubtitle = theme.brand_subtitle?.trim() || '集合啦！';
  const brandLogo = theme.brand_logo_url?.trim() || 'https://wsrv.nl/?url=https%3A%2F%2Fi.mij.rip%2F2026%2F08%2F18%2F3b1499d288d87344ca7a7a0de8c1434d.png';
  const validBrandLogo = brandLogo && (/^data:image\/png(?:;base64)?,/i.test(brandLogo) || /\.png(?:$|[?#])/i.test(brandLogo));

  useEffect(() => {
    document.title = brandTitle;
  }, [brandTitle]);

  const openResidentLogin = async () => {
    try {
      const response = await fetch('/api/me', { credentials: 'same-origin' });
      const account = await response.json() as { logged_in?: boolean };
      if (response.ok && account.logged_in) {
        window.location.href = '/admin/dashboard';
        return;
      }
    } catch {
      // 登录弹窗仍可处理临时的账户状态接口故障。
    }
    if (settings.oauth_enable && settings.disable_password_login) {
      window.location.href = '/api/oauth';
      return;
    }
    setLoginError('');
    setRequireTwoFactor(false);
    setLoginOpen(true);
  };

  const login = async (values: LoginValues) => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username?.trim(),
          password: values.password,
          ...(values.twoFactor?.trim() ? { '2fa_code': values.twoFactor.trim() } : {}),
        }),
      });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (response.ok) {
        Notification.success({ message: '欢迎回来，岛民', description: '身份验证成功，正在前往管理后台。' });
        window.location.href = '/admin/dashboard';
        return;
      }
      if (result.message === '2FA code is required') {
        setRequireTwoFactor(true);
        setLoginError('请输入两步验证码后再次登录。');
      } else {
        setLoginError(result.message || '身份验证失败，请检查账号和密码。');
      }
    } catch {
      setLoginError('无法连接验证服务，请稍后重试。');
    } finally {
      setLoginLoading(false);
    }
  };

  const savePreferences = (values: { appearance?: string }) => {
    if (values.appearance === 'light' || values.appearance === 'dark') setAppearance(values.appearance);
    setDrawer(false);
    Notification.success({ message: '偏好已保存', description: '设置已保存在当前浏览器中。' });
  };

  return (
    <Cursor forceAll>
      <Loading active={loading} className="loading-screen" />
      <div className={`km-layout bg-variant-${backgroundVariant}`}>
        <header className="km-navbar">
          <div className="brand">
            {validBrandLogo ? <img className="brand-logo" src={brandLogo} alt="" /> : <Icon name="icon-helicopter" size={60} bounce />}
            <div className="brand-copy">
              <div className="brand-tiles" aria-label={brandTitle}>{[...brandTitle].map((char, index) => <Tag key={`${char}-${index}`} size="medium" color={BRAND_COLORS[index % BRAND_COLORS.length]} variant="solid">{char === ' ' ? '\u00a0' : char}</Tag>)}</div>
              <span>{brandSubtitle}</span>
            </div>
          </div>
          <div className="header-actions">
            <Tag color={connected ? 'app-green' : demo ? 'app-yellow' : 'app-red'} size="small">
              {connected ? '实时连接' : demo ? '预览数据' : '正在重连'}
            </Tag>
            <Button type="primary" size="small" icon={<Icon name="icon-design" size={19} />} onClick={() => setDrawer(true)}>设置</Button>
            <Button type="primary" size="small" icon={<Icon name="icon-variant" size={19} />} onClick={openResidentLogin}>岛民</Button>
            <Time type="hud" />
          </div>
        </header>

        <main className="km-main km-page-instance">
          {theme.show_dashboard !== false && (
            <section className="dashboard-section">
              <Title size="middle" color="app-yellow">监控概览</Title>
              <div className="stats-grid">
                <Card color="app-orange" pattern="app-orange"><Image className="summary-item-icon" src={item351} alt="" width={40} height={40} color="app-orange" preview={false} /><div><span>服务器</span><strong>{onlineCount} / {nodes.length}</strong></div></Card>
                <Card color="app-teal" pattern="app-teal"><Image className="summary-item-icon" src={item477} alt="" width={40} height={40} color="app-teal" preview={false} /><div><span>平均 CPU 使用率</span><strong>{formatPercent(averageCpu)}</strong></div></Card>
                <Card color="app-blue" pattern="app-blue"><Icon name="icon-miles" size={34} /><div className="summary-network"><span>实时网络速率</span><strong><i>↓ 下行</i><b>{formatSpeed(speedDown)}</b></strong><strong><i>↑ 上行</i><b>{formatSpeed(speedUp)}</b></strong></div></Card>
                <Card color="app-pink" pattern="app-pink"><Icon name="icon-critterpedia" size={34} /><div className="summary-network"><span>累计流量</span><strong><i>↓ 下行</i><b>{formatBytes(totalDown)}</b></strong><strong><i>↑ 上行</i><b>{formatBytes(totalUp)}</b></strong></div></Card>
              </div>
            </section>
          )}

          <Divider type="wave-yellow" />
          <section className="server-section km-instance-server-list">
            <div className="section-heading">
              <Title size="middle" color="app-teal">服务器列表</Title>
              <div className="filters">
                <Select options={regions.map((key) => ({ key, label: key === 'all' ? '全部地区' : regionLabel(key) }))} value={group} onChange={setGroup} />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} allowClear onClear={() => setQuery('')} placeholder="搜索服务器…" prefix={<Icon name="icon-map" size={18} />} />
                <Radio size="small" value={view} onChange={(value) => setView(value as ViewMode)} options={[{ label: '卡片', value: 'grid' }, { label: '列表', value: 'list' }]} />
              </div>
            </div>
            {visibleNodes.length ? (
              <div className={`node-grid ${view === 'list' ? 'list-view' : ''}`}>
                {visibleNodes.map((node) => view === 'list'
                  ? <NodeListRow key={`${node.uuid}-${live[node.uuid]?.updated_at || ''}`} node={node} live={live[node.uuid]} online={demo ? Boolean(live[node.uuid]) : online.includes(node.uuid)} onDetails={() => setSelected(node)} />
                  : <NodeCard key={`${node.uuid}-${live[node.uuid]?.updated_at || ''}`} node={node} live={live[node.uuid]} online={demo ? Boolean(live[node.uuid]) : online.includes(node.uuid)} latency={latencies[node.uuid]} showLatency={showLatency && pingTasksActive} onDetails={() => setSelected(node)} />)}
              </div>
            ) : (
              <Card type="dashed" className="empty-state"><Icon name="icon-map" size={54} /><h2>这片岛屿上没有找到服务器</h2><Button type="primary" onClick={() => { setQuery(''); setGroup('all'); }}>清除筛选</Button></Card>
            )}
          </section>
        </main>

        {theme.show_footer !== false && (
          <footer className="km-footer">
            <Button type="primary" block className="footer-link-button" onClick={() => { window.location.href = 'https://github.com/imbigbomb/komari-animal-island'; }}>
              <span>{theme.footer_content || '每台服务器，都是这座岛上的好邻居。'}</span>
              <span>Powered by Komari Monitor.</span>
            </Button>
            <Footer type="sea" />
          </footer>
        )}
      </div>

      <Modal open={Boolean(selected)} width="min(680px, calc(100vw - 64px))" className="detail-modal" maskStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }} title={selected && <div className="detail-header"><div className="detail-heading-copy"><strong>{selected.name}</strong><span>{selected.os || '未知系统版本'}</span></div><div className="detail-tags"><Tag color="app-green">{online.includes(selected.uuid) || demo ? '在线' : '离线'}</Tag><Tag color="app-blue">{regionLabel(selected.region)}</Tag><Tag color="app-blue">{selected.virtualization || '未知虚拟化'}</Tag><Tag color="app-blue">{selected.arch || '未知架构'}</Tag></div></div>} onClose={() => setSelected(null)} footer={<Button type="primary" onClick={() => setSelected(null)}>回到岛屿</Button>} typewriter={false}>
        {selected && <div className="details">
          <div className="detail-copy">
            {selected.public_remark && <p>{selected.public_remark}</p>}
            <div className="detail-info-grid">
              <Card className={`detail-stat-card${hasBilling(selected) ? '' : ' detail-stat-card--full'}`} pattern="app-teal">
                <div className="detail-grid">{showLatency && pingTasksActive && (liveLatency(current) ?? latencies[selected.uuid]) != null && <><span>延迟</span><strong>{liveLatency(current) ?? latencies[selected.uuid]} ms</strong></>}<span>负载</span><strong>{current?.load?.load1?.toFixed(2) || '—'}</strong><span>进程</span><strong>{current?.process ?? '—'}</strong><span>TCP / UDP</span><strong>{current?.connections?.tcp ?? '—'} / {current?.connections?.udp ?? '—'}</strong><span>运行时间</span><strong>{formatUptime(current?.uptime)}</strong></div>
              </Card>
              {hasBilling(selected) && <Card className="detail-stat-card detail-billing" pattern="app-teal">
                <strong>{billingCycleLabel(Number(selected.billing_cycle))} {formatMoney(Number(selected.price))} {selected.currency || '—'}</strong>
                <small>{renewalLabel(selected)}</small>
                <span>剩余价值 {selected.currency || '—'}</span>
                <Wallet value={remainingValue(selected)} size="small" />
              </Card>}
            </div>
          </div>
          <div className="detail-metrics">
            <Metric label="CPU" used={current?.cpu?.usage} total={100} />
            <Metric label="内存" used={current?.ram?.used} total={current?.ram?.total || selected.mem_total} />
            <Metric label="硬盘" used={current?.disk?.used} total={current?.disk?.total || selected.disk_total} />
          </div>
        </div>}
      </Modal>

      <Modal open={loginOpen} width="min(460px, calc(100vw - 48px))" className="login-modal" title="岛民身份验证" onClose={() => !loginLoading && setLoginOpen(false)} footer={null} typewriter={false}>
        <div className="login-intro"><Typewriter speed={42} trigger={loginOpen}>
          <span>你好，欢迎来到 <strong className="login-brand-highlight">{brandTitle}</strong>！今天的天气真不错呢～</span>
        </Typewriter></div>
        {!settings.disable_password_login && <Form layout="vertical" onFinish={(values) => login(values as LoginValues)} requiredMark={false}>
          <FormItem label="岛民账号" name="username" rules={[{ required: true, message: '请输入岛民账号' }]}><Input autoComplete="username" placeholder="请输入账号" shadow disabled={loginLoading} /></FormItem>
          <FormItem label="通行密码" name="password" rules={[{ required: true, message: '请输入通行密码' }]}><Input type="password" autoComplete="current-password" placeholder="请输入密码" shadow disabled={loginLoading} /></FormItem>
          {requireTwoFactor && <FormItem label="两步验证码" name="twoFactor" rules={[{ required: true, message: '请输入两步验证码' }]}><Input inputMode="numeric" autoComplete="one-time-code" placeholder="000000" shadow disabled={loginLoading} /></FormItem>}
          {loginError && <div className="login-error" role="alert">{loginError}</div>}
          <FormItem className="login-submit-item"><Button type="primary" htmlType="submit" block loading={loginLoading}>上岛</Button></FormItem>
        </Form>}
        {settings.oauth_enable && <div className={`oauth-login ${settings.disable_password_login ? 'oauth-login-only' : ''}`}>
          <Button type="primary" block disabled={loginLoading} onClick={() => { window.location.href = '/api/oauth'; }}>
            {settings.oauth_provider?.toLowerCase() === 'github' ? 'Github登录' : `${settings.oauth_provider && settings.oauth_provider !== 'generic' ? settings.oauth_provider : 'OAuth'}登录`}
          </Button>
        </div>}
      </Modal>

      <Drawer open={drawer} title="岛屿显示设置" onClose={() => setDrawer(false)} footer={null}>
        <Form layout="vertical" initialValues={{ appearance }} onFinish={savePreferences} requiredMark="optional">
          <FormItem label="外观" name="appearance"><Radio direction="vertical" options={[{ value: 'light', label: '白天岛屿' }, { value: 'dark', label: '夜间岛屿' }]} /></FormItem>
          <FormItem><Button type="primary" htmlType="submit" block loading={false}>保存偏好</Button></FormItem>
        </Form>
      </Drawer>
      <BackTop visibilityHeight={300} />
    </Cursor>
  );
}

