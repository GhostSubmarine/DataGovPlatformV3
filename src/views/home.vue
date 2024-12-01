<template>
  <el-card class="layout-home" body-style="height: calc(100vh - 170px )">
    <el-row :gutter="20">
      <el-col :span="4">
        <el-card>
          <div class="flex-between">
            <img src="@/assets/home/icon_1.png" class="icon-img" alt="" />
            <div class="option-info">
              <div class="option-title">数据源数</div>
              <div class="option-desc">8</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div class="flex-between">
            <img src="@/assets/home/icon_2.png" class="icon-img" alt="" />
            <div class="option-info">
              <div class="option-title">数据集成任务数</div>
              <div class="option-desc">8</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div class="flex-between">
            <img src="@/assets/home/icon_3.png" class="icon-img" alt="" />
            <div class="option-info">
              <div class="option-title">数据集成任务数</div>
              <div class="option-desc">8</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div class="flex-between">
            <img src="@/assets/home/icon_4.png" class="icon-img" alt="" />
            <div class="option-info">
              <div class="option-title">数据API数</div>
              <div class="option-desc">8</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div class="flex-between">
            <img src="@/assets/home/icon_5.png" class="icon-img" alt="" />
            <div class="option-info">
              <div class="option-title">数据标准任务数</div>
              <div class="option-desc">8</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <div class="flex-between">
            <img src="@/assets/home/icon_6.png" class="icon-img" alt="" />
            <div class="option-info">
              <div class="option-title">数据质量任务数</div>
              <div class="option-desc">8</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin: 20px 0">
      <el-col :span="6" style="padding-left: 0">
        <el-card>
          <div class="chart-title">数据源类型统计</div>
          <v-chart :option="chartOption1" style="width: 100%; height: 230px" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="chart-title">数据集成类型统计</div>
          <v-chart :option="chartOption2" style="width: 100%; height: 230px" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="chart-title">数据开发类型统计</div>
          <v-chart :option="chartOption3" style="width: 100%; height: 230px" />
        </el-card>
      </el-col>
      <el-col :span="6" style="padding-right: 0">
        <el-card>
          <div class="chart-title">数据API请求统计</div>
          <v-chart :option="chartOption4" style="width: 100%; height: 230px" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card style="height: 370px">
          <div class="chart-title">数据集成任务</div>
          <v-chart :option="chartOption5" style="width: 100%; height: 340px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="height: 370px">
          <div class="chart-title">集成数据详情</div>
          <v-chart :option="chartOption6" style="width: 100%; height: 340px" />
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
const chartOption1 = ref({
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      name: '数据源',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 580, name: 'postgressql' },
        { value: 1048, name: 'mysql' },
        { value: 580, name: 'oracle' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})
const chartOption2 = ref({
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      name: '任务类型',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'dataX' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})
const chartOption3 = ref({
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      name: '任务类型',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 0, name: '任务' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})
const chartOption4 = ref({
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      name: 'API',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 735, name: '开发' },
        { value: 1548, name: '测试' },
        { value: 580, name: '生产' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})
let base = +new Date(1968, 9, 3);
let oneDay = 24 * 3600 * 1000;
let date = [];
let data = [Math.random() * 300];
for (let i = 1; i < 20000; i++) {
  var now = new Date((base += oneDay));
  date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
  data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
}
const chartOption5 = ref({
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: date
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%']
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 10
    },
    {
      start: 0,
      end: 10
    }
  ],
  series: [
    {
      name: 'Fake Data',
      type: 'line',
      symbol: 'none',
      sampling: 'lttb',
      itemStyle: {
        color: 'rgb(255, 70, 131)'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgb(255, 158, 68)'
          },
          {
            offset: 1,
            color: 'rgb(255, 70, 131)'
          }
        ])
      },
      data: data
    }
  ]
})
const data6 = ref<number[]>([]);
for (let i = 0; i < 5; ++i) {
  data6.value.push(Math.round(Math.random() * 200));
}
const chartOption6 = ref({
  xAxis: {
    max: 'dataMax'
  },
  yAxis: {
    type: 'category',
    data: ['A', 'B', 'C', 'D', 'E'],
    inverse: true,
    animationDuration: 300,
    animationDurationUpdate: 300,
    max: 2 // only the largest 3 bars will be displayed
  },
  series: [
    {
      realtimeSort: true,
      name: 'X',
      type: 'bar',
      data: data6,
      label: {
        show: true,
        position: 'right',
        valueAnimation: true
      }
    }
  ],
  animationDuration: 0,
  animationDurationUpdate: 3000,
  animationEasing: 'linear',
  animationEasingUpdate: 'linear'
})
const run = () => {
  for (var i = 0; i < data6.value.length; ++i) {
    if (Math.random() > 0.9) {
      data6.value[i] += Math.round(Math.random() * 2000);
    } else {
      data6.value[i] += Math.round(Math.random() * 200);
    }
  }
  chartOption6.value.series[0].data = data6.value;
}
onMounted(() => {
  setTimeout(function () {
    run();
  }, 0);
  setInterval(function () {
    run();
  }, 3000);
})
</script>
<style scoped lang="less">
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  .icon-img {
    height: 100%;
  }

  .option-info {
    font-weight: 700;
    text-align: center;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.chart-title {
  font-weight: bolder;
  font-size: 18px;
  line-height: 20px;
}
</style>
