"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const priceData = [
  { time: "00:00", price: 68, forecast: 74 }, { time: "02:00", price: 51, forecast: 56 },
  { time: "04:00", price: 45, forecast: 49 }, { time: "06:00", price: 72, forecast: 65 },
  { time: "08:00", price: 96, forecast: 89 }, { time: "10:00", price: 112, forecast: 104 },
  { time: "12:00", price: 88, forecast: 94 }, { time: "14:00", price: 76, forecast: 81 },
  { time: "16:00", price: 103, forecast: 98 }, { time: "18:00", price: 139, forecast: 121 },
  { time: "20:00", price: 117, forecast: 112 }, { time: "22:00", price: 84, forecast: 91 },
];
const fuelData = [
  { name: "Natural gas", value: 42, color: "#f2b84b" }, { name: "Wind", value: 27, color: "#65c8bd" },
  { name: "Hydro", value: 17, color: "#7ca8ff" }, { name: "Coal", value: 9, color: "#8c92a4" }, { name: "Other", value: 5, color: "#d572b8" },
];
const assets = [
  { name: "Genesee 2", fuel: "Coal", output: "401 MW", status: "Online", tone: "green" },
  { name: "Keephills 3", fuel: "Coal", output: "403 MW", status: "Online", tone: "green" },
  { name: "Shepard Energy Centre", fuel: "Natural gas", output: "771 MW", status: "Online", tone: "green" },
  { name: "Ghost Pine Wind", fuel: "Wind", output: "148 MW", status: "Derated", tone: "amber" },
];
function Metric({ label, value, detail, accent = "teal" }: { label: string; value: string; detail: string; accent?: string }) {
  return <div className="metric-card"><div className={`metric-mark ${accent}`} /><p className="eyebrow">{label}</p><p className="metric-value">{value}</p><p className="metric-detail">{detail}</p></div>;
}
export default function Home() {
  const [range, setRange] = useState("24H");
  const [activeTab, setActiveTab] = useState("Overview");
  const latest = priceData[priceData.length - 1].price;
  const average = useMemo(() => Math.round(priceData.reduce((sum, row) => sum + row.price, 0) / priceData.length), []);
  return <main className="dashboard-shell">
    <header className="topbar"><div className="brand"><span className="brand-dot" /><span>ALBERTA GRID</span><span className="brand-suffix">/ OPERATIONS</span></div><nav className="topnav">{["Overview", "Market", "Generation", "Data quality"].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>{tab}</button>)}</nav><div className="system-status"><span className="pulse" /> SYSTEM NOMINAL <span className="divider" /> <span className="mono">MST · 09:42:16</span></div></header>
    <section className="hero"><div><p className="eyebrow teal-text">AESO MARKET INTELLIGENCE</p><h1>{activeTab === "Overview" ? "The grid, at a glance." : activeTab}</h1><p className="hero-copy">A decision-ready view of Alberta&apos;s power market, refreshed from the public AESO API.</p></div><div className="hero-meta"><p className="eyebrow">LAST INGEST</p><p className="mono">2026-09-02 09:41:58 UTC</p><span className="freshness"><span className="fresh-dot" /> 42 seconds ago</span></div></section>
    <section className="metric-grid"><Metric label="Pool price · current" value={`$${latest}`} detail="CAD / MWh · ↑ 8.4% vs prior hour" accent="gold" /><Metric label="Pool price · 24h avg" value={`$${average}`} detail="CAD / MWh · within seasonal range" /><Metric label="System demand" value="10,842" detail="MW · 92% of daily peak" accent="blue" /><Metric label="Available generation" value="12,108" detail="MW · 1,266 MW reserve margin" accent="pink" /></section>
    <section className="content-grid"><div className="panel chart-panel"><div className="panel-head"><div><p className="eyebrow">MARKET PRICE</p><h2>Pool price &amp; forecast</h2></div><div className="range-tabs">{["24H", "7D", "30D"].map((item) => <button key={item} onClick={() => setRange(item)} className={range === item ? "selected" : ""}>{item}</button>)}</div></div><div className="legend"><span><i className="legend-line actual" /> Actual</span><span><i className="legend-line forecast" /> Forecast</span><span className="chart-unit">CAD / MWh</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={priceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#65c8bd" stopOpacity={0.27} /><stop offset="100%" stopColor="#65c8bd" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#26343c" vertical={false} /><XAxis dataKey="time" stroke="#6f7f86" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis stroke="#6f7f86" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ background: "#172228", border: "1px solid #36505a", borderRadius: 4, color: "#edf5f3" }} formatter={(value) => [`$${value}`, ""]} /><Area type="monotone" dataKey="forecast" stroke="#7b8990" strokeDasharray="4 4" strokeWidth={1.5} fill="none" /><Area type="monotone" dataKey="price" stroke="#65c8bd" strokeWidth={2.5} fill="url(#priceFill)" /></AreaChart></ResponsiveContainer></div><div className="chart-footer"><span>LOW <b>$45</b></span><span>HIGH <b>$139</b></span><span>30D AVG <b>$81</b></span><span className="source-label">SOURCE · AESO POOL PRICE REPORT</span></div></div><div className="panel mix-panel"><div className="panel-head"><div><p className="eyebrow">GENERATION MIX</p><h2>By fuel type</h2></div><span className="live-badge">LIVE</span></div><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={fuelData} dataKey="value" innerRadius={65} outerRadius={94} paddingAngle={2} stroke="none">{fuelData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ background: "#172228", border: "1px solid #36505a" }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>12,108</strong><span>MW TOTAL</span></div></div><div className="fuel-list">{fuelData.map((fuel) => <div className="fuel-row" key={fuel.name}><span><i style={{ background: fuel.color }} />{fuel.name}</span><b>{fuel.value}%</b></div>)}</div></div></section>
    <section className="bottom-grid"><div className="panel assets-panel"><div className="panel-head"><div><p className="eyebrow">ASSET WATCH</p><h2>Selected generation assets</h2></div><button className="text-button">VIEW ALL <span>→</span></button></div><div className="asset-table"><div className="asset-row table-head"><span>ASSET</span><span>FUEL</span><span>OUTPUT</span><span>STATUS</span></div>{assets.map((asset) => <div className="asset-row" key={asset.name}><strong>{asset.name}</strong><span>{asset.fuel}</span><span className="mono">{asset.output}</span><span className={`status ${asset.tone}`}><i />{asset.status}</span></div>)}</div></div><div className="panel pipeline-panel"><p className="eyebrow">PIPELINE HEALTH</p><h2>Ingestion status</h2><div className="pipeline-stat"><span className="pipeline-icon">↗</span><div><strong>All systems operational</strong><p>2 sources · 0 failures · 0.4s avg latency</p></div></div><div className="progress-track"><div /></div><div className="pipeline-meta"><span><b>99.98%</b> uptime</span><span><b>1,248,390</b> rows loaded</span></div><div className="pipeline-foot"><span className="fresh-dot" /> dbt models last run 09:42 UTC <span className="mono">RUN #004812</span></div></div></section>
    <footer className="footer"><span>ALBERTA GRID <span className="footer-muted">· portfolio data platform</span></span><span className="mono">DuckDB → dbt → Prefect → Next.js</span></footer>
  </main>;
}
