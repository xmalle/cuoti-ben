'use client';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>项目信息</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">应用名称</span>
            <span className="text-slate-900">考研错题本</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">版本</span>
            <span className="text-slate-900">v0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Supabase 状态</span>
            <span className="text-green-600">已连接</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>功能说明</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-800 mb-1">章节知识点管理</p>
            <p className="text-xs">以「科目 → 章节 → 知识点」为主线组织错题，每个章节可自定义填写知识点内容。</p>
          </div>
          <div>
            <p className="font-medium text-slate-800 mb-1">OCR 拍照识别</p>
            <p className="text-xs">拍照上传题目图片，使用 Tesseract.js 识别文字（支持中英文），识别后可手动校对。</p>
          </div>
          <div>
            <p className="font-medium text-slate-800 mb-1">预设错因标签</p>
            <p className="text-xs">7 个预设错因标签（计算错误、概念未理解、知识点遗忘等），一道题可多选，用于章节错因统计。</p>
          </div>
          <div>
            <p className="font-medium text-slate-800 mb-1">间隔重复复习</p>
            <p className="text-xs">基于 SM-2 算法自动安排复习时间，四档反馈（忘记/困难/记得/熟练），科学对抗遗忘。</p>
          </div>
          <div>
            <p className="font-medium text-slate-800 mb-1">章节错因分布报告</p>
            <p className="text-xs">按章节维度汇总错因，堆叠条形图 + 热力表 + 饼图，精准定位薄弱章节。</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>关于</CardTitle>
        </CardHeader>
        <CardBody className="text-sm text-slate-600 space-y-2">
          <p>本应用为考研备考个人错题管理工具，采用以下技术栈：</p>
          <ul className="text-xs space-y-1 text-slate-500">
            <li>Next.js 14 + TypeScript + Tailwind CSS</li>
            <li>Supabase（PostgreSQL 数据库 + Storage 图片存储）</li>
            <li>Tesseract.js（浏览器端 OCR）</li>
            <li>Recharts（数据可视化）</li>
            <li>SM-2 间隔重复算法</li>
          </ul>
          <p className="text-xs text-slate-400 pt-2">数据完全存储在你自己的 Supabase 项目中，你拥有完整控制权。</p>
        </CardBody>
      </Card>
    </div>
  );
}
