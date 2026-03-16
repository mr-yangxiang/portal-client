<!-- 
  管理后台仪表盘
  @description 展示系统概览统计数据（浏览量、文章数、项目数等）和快捷操作入口
  @author yx
-->
<template>
  <div class="dashboard-container">
    <!-- 页面标题区 -->
    <div class="header-section">
      <h2 class="page-title">系统仪表盘</h2>
      <p class="page-subtitle">欢迎回来，管理员。系统运行正常。</p>
    </div>

    <!-- 统计卡片区域（四列布局） -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="(stat, index) in stats" :key="index">
        <GlassCard shadow="hover" class="stat-card">
          <div class="stat-icon-wrapper" :style="{ color: stat.color }">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value" :style="{ color: stat.color }">
              {{ stat.value }}
              <span class="stat-unit" v-if="stat.unit">{{ stat.unit }}</span>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon><CaretTop v-if="stat.trend > 0" /><CaretBottom v-else /></el-icon>
              {{ Math.abs(stat.trend) }}% 较上周
            </div>
          </div>
        </GlassCard>
      </el-col>
    </el-row>

    <!-- 图表与快捷操作区域 -->
    <el-row :gutter="20" class="charts-section">
      <!-- 流量分析图表占位 -->
      <el-col :span="16">
        <GlassCard>
          <template #header>
            <div class="card-header">流量分析</div>
          </template>
          <div ref="chartRef" class="traffic-chart"></div>
        </GlassCard>
      </el-col>
      
      <!-- 快捷操作面板 -->
      <el-col :span="8">
        <GlassCard>
          <template #header>
            <div class="card-header">快捷操作</div>
          </template>
          <div class="action-list">
            <el-button type="primary" plain class="action-btn" @click="$router.push('/admin/article-edit')">
              <el-icon><Edit /></el-icon> 撰写文章
            </el-button>
            <el-button type="success" plain class="action-btn" @click="$router.push('/admin/projects')">
              <el-icon><Box /></el-icon> 管理项目
            </el-button>
            <el-button type="warning" plain class="action-btn" @click="$router.push('/admin/settings')">
              <el-icon><Setting /></el-icon> 系统设置
            </el-button>
          </div>
        </GlassCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
/**
 * 仪表盘页面 - 逻辑层
 * 页面载入时从后端获取统计数据并展示
 */
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { View, Document, Box, Cpu, CaretTop, CaretBottom, Edit, Setting } from '@element-plus/icons-vue'
import { getDashboardStats, getVisitStats, getTodayVisitSummary } from '@/api/modules/sys'
import GlassCard from '@/components/GlassCard.vue'
import * as echarts from 'echarts'

/**
 * 统计卡片数据（从 /common/dashboard/stats 接口加载）
 * 包含：总浏览量、文章数、项目数、服务器负载
 */
const stats = ref([
  { title: '总浏览量', value: '...', icon: View, color: 'var(--el-color-primary)', trend: 0 },
  { title: '文章数', value: '...', icon: Document, color: '#388bfd', trend: 0 },
  { title: '项目数', value: '...', icon: Box, color: '#d2a8ff', trend: 0 },
  { title: '分类 / 标签', value: '...', icon: Cpu, color: '#ff7b72', trend: 0 }
])

/** ECharts 实例引用 */
const chartRef = ref(null)
let chartInstance = null

/**
 * 初始化 ECharts 流量折线图
 * @param {Array} data 近7天的 [{ date, pv, uv }]
 */
const initChart = (data) => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)

  const dates = data.map(d => {
    const dt = new Date(d.date)
    return `${dt.getMonth() + 1}/${dt.getDate()}`
  })
  const pvData = data.map(d => d.pv)
  const uvData = data.map(d => d.uv)

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30,35,42,0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontFamily: 'Fira Code, monospace', fontSize: 12 }
    },
    legend: {
      data: ['PV (浏览量)', 'UV (独立访客)'],
      textStyle: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Fira Code, monospace', fontSize: 12 },
      top: 0
    },
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Fira Code, monospace', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Fira Code, monospace', fontSize: 11 }
    },
    series: [
      {
        name: 'PV (浏览量)',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: pvData,
        lineStyle: { color: '#00ffaa', width: 2 },
        itemStyle: { color: '#00ffaa' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,255,170,0.25)' },
          { offset: 1, color: 'rgba(0,255,170,0)' }
        ])}
      },
      {
        name: 'UV (独立访客)',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: uvData,
        lineStyle: { color: '#388bfd', width: 2 },
        itemStyle: { color: '#388bfd' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(56,139,253,0.2)' },
          { offset: 1, color: 'rgba(56,139,253,0)' }
        ])}
      }
    ]
  })
}

/**
 * 页面挂载时获取仪表盘统计数据 + 流量图表数据
 */
onMounted(async () => {
  try {
    const res = await getDashboardStats()
    if (res.data) {
      stats.value[0].value = res.data.totalViews || 0
      stats.value[1].value = res.data.articleCount || 0
      stats.value[2].value = res.data.projectCount || 0
      stats.value[3].value = (res.data.categoryCount || 0) + ' / ' + (res.data.tagCount || 0)
    }
  } catch (e) {
    console.error('仪表盘统计数据获取失败:', e)
  }

  // 加载流量折线图
  try {
    const visitRes = await getVisitStats({ days: 7 })
    if (visitRes.data && visitRes.data.length > 0) {
      await nextTick()
      initChart(visitRes.data)
    } else {
      // 无数据时展示空图表（7天0值）
      const emptyData = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        emptyData.push({ date: d.toISOString().split('T')[0], pv: 0, uv: 0 })
      }
      await nextTick()
      initChart(emptyData)
    }
  } catch (e) {
    console.error('流量数据获取失败:', e)
  }
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-section {
  margin-bottom: 8px;
  
  .page-title {
    font-size: 24px;
    font-family: 'Fira Code', monospace;
    font-weight: 700;
    color: var(--el-color-primary);
    margin: 0 0 8px 0;
    text-shadow: 0 0 8px rgba(0, 255, 170, 0.3);
  }
  
  .page-subtitle {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin: 0;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    padding: 24px;
    width: 100%;
  }

  .stat-icon-wrapper {
    font-size: 48px;
    margin-right: 20px;
    opacity: 0.8;
  }

  .stat-content {
    flex: 1;
    .stat-title {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      font-family: 'Fira Code', monospace;
      margin-bottom: 8px;
      
      .stat-unit {
        font-size: 16px;
        opacity: 0.6;
      }
    }
    .stat-trend {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      &.up { color: var(--el-color-primary); }
      &.down { color: #ff7b72; }
    }
  }
}

.card-header {
  font-family: 'Fira Code', monospace;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 1px;
}

.traffic-chart {
  height: 300px;
  width: 100%;
  border-radius: 8px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;

  .action-btn {
    width: 100%;
    margin-left: 0 !important; /* 强制覆盖 .el-button+.el-button 的 12px 水平缩进 */
    justify-content: flex-start;
    font-family: 'Fira Code', monospace;
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
    
    .el-icon {
      margin-right: 12px;
    }
    
    &:hover {
      background: rgba(0, 255, 170, 0.1);
      border-color: var(--el-color-primary);
      box-shadow: 0 0 10px rgba(0, 255, 170, 0.2) inset;
    }
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
