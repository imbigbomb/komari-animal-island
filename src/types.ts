export interface NodeInfo {
  uuid: string;
  name: string;
  region?: string;
  group?: string;
  virtualization?: string;
  arch?: string;
  os?: string;
  cpu_name?: string;
  cpu_cores?: number;
  mem_total?: number;
  swap_total?: number;
  disk_total?: number;
  public_remark?: string;
  price?: number;
  billing_cycle?: number;
  auto_renewal?: boolean;
  currency?: string;
  expired_at?: string | null;
}

export interface LiveState {
  cpu?: { usage?: number };
  ram?: { total?: number; used?: number };
  swap?: { total?: number; used?: number };
  disk?: { total?: number; used?: number };
  network?: { up?: number; down?: number; totalUp?: number; totalDown?: number };
  load?: { load1?: number; load5?: number; load15?: number };
  connections?: { tcp?: number; udp?: number };
  uptime?: number;
  process?: number;
  updated_at?: string;
}

export interface PublicSettings {
  sitename?: string;
  description?: string;
  disable_password_login?: boolean;
  oauth_enable?: boolean;
  oauth_provider?: string;
  theme_settings?: {
    show_dashboard?: boolean;
    show_footer?: boolean;
    footer_content?: string;
    brand_title?: string;
    brand_subtitle?: string;
    brand_logo_url?: string;
  };
}
