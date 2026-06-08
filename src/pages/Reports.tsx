
import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Filter,
  Search,
  Map,
  Layers,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  Cloud,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Loader2,
  Info
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useStore } from '../store/useStore';
import { CarbonSinkData, SimulationStatus } from '../../shared/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const Reports: React.FC = () => {
  const { simulations, carbonSinkData, setNotification } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBasin, setFilterBasin] = useState<string>('all');
  const [filterSeason, setFilterSeason] = useState<string>('all');
  const [filterScenario, setFilterScenario] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const reportRef = useRef<HTMLDivElement>(null);

  const basins = Array.from(new Set(carbonSinkData.map(d => d.basin)));
  const seasons = Array.from(new Set(carbonSinkData.map(d => d.season)));
  const scenarios = Array.from(new Set(carbonSinkData.map(d => d.scenario)));
  const years = Array.from(new Set(carbonSinkData.map(d => d.year))).sort();

  const filteredData = carbonSinkData.filter(d => {
    const matchesSearch = d.basin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBasin = filterBasin === 'all' || d.basin === filterBasin;
    const matchesSeason = filterSeason === 'all' || d.season === filterSeason;
    const matchesScenario = filterScenario === 'all' || d.scenario === filterScenario;
    return matchesSearch && matchesBasin && matchesSeason && matchesScenario;
  });

  const completedSimulations = simulations.filter(s => s.status === SimulationStatus.COMPLETED);

  const getTotalCarbonSink = () => {
    return filteredData.reduce((sum, d) => sum + d.totalCarbonSink, 0);
  };

  const getCarbonFluxOption = () => {
    const basinData = basins.map(basin => {
      const basinRecords = filteredData.filter(d => d.basin === basin);
      return {
        name: basin,
        value: basinRecords.reduce((sum, d) => sum + d.totalCarbonSink, 0) / basinRecords.length || 0
      };
    }).sort((a, b) => b.value - a.value);

    return {
      backgroundColor: 'transparent',
      title: {
        text: '各海盆碳汇通量分布 (Tg C yr⁻¹)',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          const p = params[0];
          return `${p.name}<br/>碳汇通量: ${Number(p.value).toFixed(1)} Tg C yr⁻¹`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: basinData.map(d => d.name),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, rotate: 30 }
      },
      yAxis: {
        type: 'value',
        name: 'Tg C yr⁻¹',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      series: [{
        data: basinData.map(d => d.value),
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1B998B' },
            { offset: 1, color: '#1B998B60' }
          ]),
          borderRadius: [6, 6, 0, 0]
        }
      }]
    };
  };

  const getSeasonalVariationOption = () => {
    const seasonOrder = ['春季', '夏季', '秋季', '冬季'];
    const data = seasonOrder.map(season => {
      const seasonRecords = filteredData.filter(d => d.season === season);
      return seasonRecords.reduce((sum, d) => sum + d.totalCarbonSink, 0) / seasonRecords.length || 0;
    });

    return {
      backgroundColor: 'transparent',
      title: {
        text: '碳汇季节变化',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: seasonOrder,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      series: [{
        data,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#3E92CC' },
        itemStyle: { color: '#3E92CC' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3E92CC60' },
              { offset: 1, color: '#3E92CC00' }
            ]
          }
        }
      }]
    };
  };

  const getPumpCompositionOption = () => {
    const bioPump = filteredData.reduce((sum, d) => sum + d.biologicalPump, 0);
    const physPump = filteredData.reduce((sum, d) => sum + d.physicalPump, 0);
    const carbPump = filteredData.reduce((sum, d) => sum + d.carbonatePump, 0);

    return {
      backgroundColor: 'transparent',
      title: {
        text: '碳泵组成结构',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(10, 36, 99, 0.95)',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        data: [
          { value: bioPump, name: '生物泵', itemStyle: { color: '#1B998B' } },
          { value: physPump, name: '物理泵', itemStyle: { color: '#3E92CC' } },
          { value: carbPump, name: '碳酸盐泵', itemStyle: { color: '#F7CB15' } }
        ]
      }]
    };
  };

  const getBiomassOption = () => {
    const basinData = basins.map(basin => {
      const basinRecords = filteredData.filter(d => d.basin === basin);
      const avgPhyto = basinRecords.reduce((sum, d) => sum + d.biomass.phytoplankton, 0) / basinRecords.length || 0;
      const avgZoo = basinRecords.reduce((sum, d) => sum + d.biomass.zooplankton, 0) / basinRecords.length || 0;
      const avgBact = basinRecords.reduce((sum, d) => sum + d.biomass.bacteria, 0) / basinRecords.length || 0;
      return { basin, phyto: avgPhyto, zoo: avgZoo, bact: avgBact };
    });

    return {
      backgroundColor: 'transparent',
      title: {
        text: '浮游生物群落生物量分布 (mg C m⁻³)',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['浮游植物', '浮游动物', '细菌'],
        textStyle: { color: 'rgba(255,255,255,0.6)' },
        top: 30
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: {
        type: 'category',
        data: basinData.map(d => d.basin),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, rotate: 30 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      series: [
        {
          name: '浮游植物',
          type: 'bar',
          stack: 'total',
          data: basinData.map(d => d.phyto),
          itemStyle: { color: '#1B998B' }
        },
        {
          name: '浮游动物',
          type: 'bar',
          stack: 'total',
          data: basinData.map(d => d.zoo),
          itemStyle: { color: '#3E92CC' }
        },
        {
          name: '细菌',
          type: 'bar',
          stack: 'total',
          data: basinData.map(d => d.bact),
          itemStyle: { color: '#F7CB15' }
        }
      ]
    };
  };

  const getScenarioComparisonOption = () => {
    const scenarioData = scenarios.map(scenario => {
      const scenarioRecords = filteredData.filter(d => d.scenario === scenario);
      const yearlyData = years.map(year => {
        const yearRecords = scenarioRecords.filter(d => d.year === year);
        return yearRecords.reduce((sum, d) => sum + d.totalCarbonSink, 0) / yearRecords.length || 0;
      });
      return { scenario, data: yearlyData };
    });

    const colors = ['#1B998B', '#3E92CC', '#F46036'];

    return {
      backgroundColor: 'transparent',
      title: {
        text: '不同排放情景下碳汇年际变化',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: scenarios,
        textStyle: { color: 'rgba(255,255,255,0.6)' },
        top: 30
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: {
        type: 'category',
        data: years,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: 'Tg C yr⁻¹',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      series: scenarioData.map((s, i) => ({
        name: s.scenario,
        data: s.data,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: colors[i % colors.length] },
        itemStyle: { color: colors[i % colors.length] }
      }))
    };
  };

  const getNutrientSectionOption = () => {
    const depths = [0, 50, 100, 200, 500, 1000, 2000, 4000];
    const generateNutrientData = (base: number, decay: number) => 
      depths.map(d => base * Math.exp(-d / decay) * (0.9 + Math.random() * 0.2));

    return {
      backgroundColor: 'transparent',
      title: {
        text: '营养盐断面分布 (μmol kg⁻¹)',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' },
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['硝酸盐 (NO₃)', '磷酸盐 (PO₄)', '硅酸盐 (SiO₂)'],
        textStyle: { color: 'rgba(255,255,255,0.6)' },
        top: 30
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: {
        type: 'value',
        name: '浓度 (μmol kg⁻¹)',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: '深度 (m)',
        inverse: true,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      series: [
        {
          name: '硝酸盐 (NO₃)',
          data: depths.map((d, i) => [generateNutrientData(25, 800)[i], d]),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 2 },
          itemStyle: { color: '#3E92CC' }
        },
        {
          name: '磷酸盐 (PO₄)',
          data: depths.map((d, i) => [generateNutrientData(2, 600)[i], d]),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 2 },
          itemStyle: { color: '#F46036' }
        },
        {
          name: '硅酸盐 (SiO₂)',
          data: depths.map((d, i) => [generateNutrientData(70, 1200)[i], d]),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 2 },
          itemStyle: { color: '#F7CB15' }
        }
      ]
    };
  };

  const getOMZEvolutionOption = () => {
    const generateOMZData = () => {
      return scenarios.map(scenario => {
        const factor = scenario === 'SSP5-8.5' ? 1.5 : scenario === 'SSP2-4.5' ? 1.2 : 1.0;
        return {
          name: scenario,
          data: years.map(year => {
            const baseYear = year - 2000;
            return Math.round(15000 * factor * (1 + baseYear * 0.02) + Math.random() * 500);
          })
        };
      });
    };

    const omzData = generateOMZData();
    const colors = ['#1B998B', '#3E92CC', '#F46036'];

    return {
      backgroundColor: 'transparent',
      title: {
        text: '氧气最小带(OMZ)演化 - 缺氧区面积变化 (km²)',
        textStyle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 36, 99, 0.95)',
        borderColor: 'rgba(62, 146, 204, 0.3)',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          let result = params[0].axisValue + '年<br/>';
          params.forEach((p: any) => {
            result += p.marker + p.seriesName + ': ' + Number(p.value).toLocaleString() + ' km²<br/>';
          });
          return result;
        }
      },
      legend: {
        data: scenarios,
        textStyle: { color: 'rgba(255,255,255,0.6)' },
        top: 30
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: {
        type: 'category',
        data: years,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: '缺氧区面积 (km²)',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: {
          color: 'rgba(255,255,255,0.5)', fontSize: 11,
          formatter: (value: number) => (value / 1000).toFixed(0) + 'k'
        }
      },
      series: omzData.map((s, i) => ({
        name: s.name,
        data: s.data,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: colors[i % colors.length] },
        itemStyle: { color: colors[i % colors.length] },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: colors[i % colors.length] + '40' },
              { offset: 1, color: colors[i % colors.length] + '00' }
            ]
          }
        }
      }))
    };
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#050f2f',
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      const fileName = `海洋碳汇评估报告_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setNotification({ type: 'success', message: 'PDF报告生成成功' });
    } catch (error) {
      console.error('PDF generation error:', error);
      setNotification({ type: 'error', message: 'PDF报告生成失败，请重试' });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportData = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      let content = '';
      let mimeType = '';
      let extension = '';

      if (exportFormat === 'csv') {
        const headers = ['海盆', '季节', '排放情景', '年份', '总碳汇(Tg C yr⁻¹)', '生物泵(Pg C yr⁻¹)', '物理泵(Pg C yr⁻¹)', '碳酸盐泵(Pg C yr⁻¹)', '浮游植物(mg C m⁻³)', '浮游动物(mg C m⁻³)', '细菌(mg C m⁻³)'];
        const rows = filteredData.map(d => [
          d.basin,
          d.season,
          d.scenario,
          d.year,
          d.totalCarbonSink.toFixed(2),
          d.biologicalPump.toFixed(4),
          d.physicalPump.toFixed(4),
          d.carbonatePump.toFixed(4),
          d.biomass.phytoplankton.toFixed(2),
          d.biomass.zooplankton.toFixed(2),
          d.biomass.bacteria.toFixed(2)
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
      } else {
        content = JSON.stringify(filteredData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `碳汇数据_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setNotification({ type: 'success', message: `数据导出成功 (${exportFormat.toUpperCase()})` });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="text-ocean-400" size={28} />
            报告生成与数据导出
          </h1>
          <p className="text-white/60 text-sm mt-1">生成综合评估报告PDF，按多维度导出碳汇数据和生物量统计</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setExportFormat('pdf')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                exportFormat === 'pdf' ? 'bg-ocean-500/30 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              PDF报告
            </button>
            <button
              onClick={() => setExportFormat('excel')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                exportFormat === 'excel' ? 'bg-ocean-500/30 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Excel
            </button>
            <button
              onClick={() => setExportFormat('csv')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                exportFormat === 'csv' ? 'bg-ocean-500/30 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              CSV
            </button>
          </div>
          {exportFormat === 'pdf' ? (
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> 生成中...</>
              ) : (
                <><Download size={16} /> 生成PDF报告</>
              )}
            </button>
          ) : (
            <button
              onClick={exportData}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> 导出中...</>
              ) : (
                <><FileSpreadsheet size={16} /> 导出数据</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center">
            <Globe size={24} className="text-ocean-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{basins.length}</p>
            <p className="text-xs text-white/50">海盆</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-seaweed-500/20 flex items-center justify-center">
            <Calendar size={24} className="text-seaweed-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{filteredData.length}</p>
            <p className="text-xs text-white/50">数据记录</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center">
            <TrendingUp size={24} className="text-coral-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{getTotalCarbonSink().toFixed(0)}</p>
            <p className="text-xs text-white/50">总碳汇 (Tg C yr⁻¹)</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Cloud size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{completedSimulations.length}</p>
            <p className="text-xs text-white/50">已完成模拟</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-ocean-400" />
            <span>数据筛选</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="搜索海盆..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:border-ocean-500/50"
              />
            </div>
            <select
              value={filterBasin}
              onChange={(e) => setFilterBasin(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
            >
              <option value="all" className="bg-ocean-900">全部海盆</option>
              {basins.map(basin => (
                <option key={basin} value={basin} className="bg-ocean-900">{basin}</option>
              ))}
            </select>
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
            >
              <option value="all" className="bg-ocean-900">全部季节</option>
              {seasons.map(season => (
                <option key={season} value={season} className="bg-ocean-900">{season}</option>
              ))}
            </select>
            <select
              value={filterScenario}
              onChange={(e) => setFilterScenario(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-ocean-500/50"
            >
              <option value="all" className="bg-ocean-900">全部情景</option>
              {scenarios.map(scenario => (
                <option key={scenario} value={scenario} className="bg-ocean-900">{scenario}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div ref={reportRef} className="space-y-4">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Map size={18} className="text-ocean-400" />
              <span>碳通量时空分布</span>
            </div>
          </div>
          <ReactECharts option={getCarbonFluxOption()} style={{ height: '300px' }} theme="dark" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-seaweed-400" />
                <span>碳汇季节变化</span>
              </div>
            </div>
            <ReactECharts option={getSeasonalVariationOption()} style={{ height: '250px' }} theme="dark" />
          </div>
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <PieChart size={18} className="text-coral-400" />
                <span>碳泵组成结构</span>
              </div>
            </div>
            <ReactECharts option={getPumpCompositionOption()} style={{ height: '250px' }} theme="dark" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-yellow-400" />
              <span>浮游植物群落演替</span>
            </div>
          </div>
          <ReactECharts option={getBiomassOption()} style={{ height: '300px' }} theme="dark" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-ocean-400" />
                <span>营养盐断面分布</span>
              </div>
            </div>
            <ReactECharts option={getNutrientSectionOption()} style={{ height: '300px' }} theme="dark" />
          </div>
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-coral-400" />
                <span>氧气最小带演化</span>
              </div>
            </div>
            <ReactECharts option={getOMZEvolutionOption()} style={{ height: '300px' }} theme="dark" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-ocean-400" />
              <span>排放情景对比分析</span>
            </div>
          </div>
          <ReactECharts option={getScenarioComparisonOption()} style={{ height: '300px' }} theme="dark" />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-seaweed-400" />
              <span>碳汇数据统计表</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/60 border-b border-white/10 bg-white/5">
                  <th className="p-3 font-medium">海盆</th>
                  <th className="p-3 font-medium">季节</th>
                  <th className="p-3 font-medium">情景</th>
                  <th className="p-3 font-medium">年份</th>
                  <th className="p-3 font-medium text-right">总碳汇</th>
                  <th className="p-3 font-medium text-right">生物泵</th>
                  <th className="p-3 font-medium text-right">物理泵</th>
                  <th className="p-3 font-medium text-right">碳酸盐泵</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 20).map((d) => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-white/80">{d.basin}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs">{d.season}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs">{d.scenario}</span>
                    </td>
                    <td className="p-3 text-white/60 font-mono">{d.year}</td>
                    <td className="p-3 text-right text-ocean-400 font-mono">{d.totalCarbonSink.toFixed(1)}</td>
                    <td className="p-3 text-right text-seaweed-400 font-mono">{d.biologicalPump.toFixed(3)}</td>
                    <td className="p-3 text-right text-coral-400 font-mono">{d.physicalPump.toFixed(3)}</td>
                    <td className="p-3 text-right text-yellow-400 font-mono">{d.carbonatePump.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > 20 && (
            <div className="p-4 text-center text-white/50 text-sm">
              显示前20条记录，共 {filteredData.length} 条。导出数据可获取完整记录。
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-ocean-400" />
            <span>报告说明</span>
          </div>
        </div>
        <div className="p-4 text-sm text-white/60 space-y-2">
          <p>• <strong className="text-white/80">碳通量时空分布图：</strong>展示各海盆年平均碳汇通量，单位为Tg C yr⁻¹（百万吨碳/年）</p>
          <p>• <strong className="text-white/80">营养盐断面：</strong>显示关键营养盐（氮、磷、硅）沿纬度和深度的分布特征</p>
          <p>• <strong className="text-white/80">浮游植物群落演替：</strong>分析不同功能群生物量的季节和年际变化</p>
          <p>• <strong className="text-white/80">氧气最小带演化：</strong>追踪缺氧区面积和体积的长期变化趋势</p>
          <p>• <strong className="text-white/80">排放情景：</strong>SSP1-2.6（可持续发展）、SSP2-4.5（中等排放）、SSP5-8.5（高排放）</p>
          <p>• <strong className="text-white/80">数据单位：</strong>碳汇Tg C yr⁻¹，碳泵Pg C yr⁻¹，生物量mg C m⁻³</p>
        </div>
      </div>
    </div>
  );
};
