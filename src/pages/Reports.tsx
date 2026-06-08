
import React, { useState, useRef, useMemo } from 'react';
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
  Clock,
  Loader2,
  Info,
  Eye,
  XCircle,
  User,
  Database,
  BarChart2,
  ArrowUpRight,
  Table,
  AlertCircle,
  GitCompare,
  CheckSquare,
  Square,
  ArrowDownUp
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useStore } from '../store/useStore';
import { SimulationStatus, ReportVersion } from '../../shared/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const Reports: React.FC = () => {
  const { simulations, carbonSinkData, setNotification, addReportVersion, reportVersions } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBasin, setFilterBasin] = useState<string>('all');
  const [filterSeason, setFilterSeason] = useState<string>('all');
  const [filterScenario, setFilterScenario] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ReportVersion | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState<[ReportVersion, ReportVersion] | null>(null);
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

  const getFilterKey = (filters: ReportVersion['filters']) => {
    return `${filters.basin}|${filters.season}|${filters.scenario}|${filters.year}`;
  };

  const groupedVersions = useMemo(() => {
    const groups: Record<string, ReportVersion[]> = {};
    reportVersions.forEach(version => {
      const key = getFilterKey(version.filters);
      if (!groups[key]) groups[key] = [];
      groups[key].push(version);
    });
    return groups;
  }, [reportVersions]);

  const toggleVersionForComparison = (versionId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        setNotification({ type: 'warning', message: '最多只能选择两个版本进行对比' });
        return prev;
      }
      return [...prev, versionId];
    });
  };

  const openComparison = () => {
    if (selectedForComparison.length !== 2) {
      setNotification({ type: 'error', message: '请选择两个版本进行对比' });
      return;
    }
    const v1 = reportVersions.find(v => v.id === selectedForComparison[0]);
    const v2 = reportVersions.find(v => v.id === selectedForComparison[1]);
    if (!v1 || !v2) {
      setNotification({ type: 'error', message: '无法找到选中的版本' });
      return;
    }
    const sorted = new Date(v1.generatedAt) < new Date(v2.generatedAt) ? [v1, v2] : [v2, v1];
    setComparisonVersions(sorted as [ReportVersion, ReportVersion]);
    setShowComparisonModal(true);
  };

  const closeComparison = () => {
    setShowComparisonModal(false);
    setComparisonVersions(null);
    setSelectedForComparison([]);
  };

  const getDiffBadge = (oldVal: number | string, newVal: number | string) => {
    if (oldVal === newVal) {
      return <span className="px-2 py-0.5 bg-white/5 text-white/50 rounded text-xs">无变化</span>;
    }
    if (typeof oldVal === 'number' && typeof newVal === 'number') {
      const diff = newVal - oldVal;
      const percent = oldVal !== 0 ? (diff / oldVal) * 100 : 0;
      if (diff > 0) {
        return <span className="px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs">+{diff.toFixed(1)} ({percent > 0 ? '+' : ''}{percent.toFixed(1)}%)</span>;
      } else {
        return <span className="px-2 py-0.5 bg-coral-500/20 text-coral-300 rounded text-xs">{diff.toFixed(1)} ({percent.toFixed(1)}%)</span>;
      }
    }
    return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs">已变更</span>;
  };

  const getSnapshotDisplay = (snapshot: ReportVersion['snapshot']) => {
    if (!snapshot) {
      return {
        hasData: false,
        carbonFlux: [],
        pumpEfficiency: null,
        scenarioComparison: [],
        dataPreview: []
      };
    }
    return {
      hasData: true,
      carbonFlux: Array.isArray(snapshot.chartsData?.carbonFlux) ? snapshot.chartsData.carbonFlux : [],
      pumpEfficiency: snapshot.chartsData?.pumpEfficiency || null,
      scenarioComparison: Array.isArray(snapshot.chartsData?.scenarioComparison) ? snapshot.chartsData.scenarioComparison : [],
      dataPreview: Array.isArray(snapshot.dataPreview) ? snapshot.dataPreview : []
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
      
      const totalCarbon = filteredData.reduce((sum, d) => sum + d.totalCarbonSink, 0);
      const avgCarbon = filteredData.length > 0 ? totalCarbon / filteredData.length : 0;
      const basinsIncluded = Array.from(new Set(filteredData.map(d => d.basin)));
      
      const bioPumpTotal = filteredData.reduce((sum, d) => sum + d.biologicalPump, 0);
      const physPumpTotal = filteredData.reduce((sum, d) => sum + d.physicalPump, 0);
      const carbPumpTotal = filteredData.reduce((sum, d) => sum + d.carbonatePump, 0);
      
      addReportVersion({
        filters: {
          basin: filterBasin,
          season: filterSeason,
          scenario: filterScenario,
          year: null
        },
        summary: {
          totalCarbonSink: Math.round(totalCarbon * 100) / 100,
          avgCarbonSink: Math.round(avgCarbon * 100) / 100,
          recordCount: filteredData.length,
          basins: basinsIncluded
        },
        format: 'pdf',
        fileSize: canvas.width * canvas.height * 4,
        snapshot: {
          chartsData: {
            carbonFlux: basins.map(basin => {
              const basinRecords = filteredData.filter(d => d.basin === basin);
              return {
                name: basin,
                value: Math.round((basinRecords.reduce((sum, d) => sum + d.totalCarbonSink, 0) / basinRecords.length || 0) * 100) / 100
              };
            }).sort((a, b) => b.value - a.value),
            pumpEfficiency: {
              biologicalPump: Math.round(bioPumpTotal * 10000) / 10000,
              physicalPump: Math.round(physPumpTotal * 10000) / 10000,
              carbonatePump: Math.round(carbPumpTotal * 10000) / 10000
            },
            scenarioComparison: scenarios.map(scenario => {
              const scenarioRecords = filteredData.filter(d => d.scenario === scenario);
              return {
                name: scenario,
                avgCarbonSink: Math.round((scenarioRecords.reduce((sum, d) => sum + d.totalCarbonSink, 0) / scenarioRecords.length || 0) * 100) / 100
              };
            })
          },
          dataPreview: filteredData.slice(0, 2).map(d => ({
            basin: d.basin,
            season: d.season,
            scenario: d.scenario,
            year: d.year,
            totalCarbonSink: d.totalCarbonSink,
            biologicalPump: d.biologicalPump,
            physicalPump: d.physicalPump,
            carbonatePump: d.carbonatePump
          })),
          generationParams: {
            searchTerm,
            filterBasin,
            filterSeason,
            filterScenario,
            exportFormat: 'pdf',
            timestamp: new Date().toISOString()
          }
        }
      });
      
      setNotification({ type: 'success', message: 'PDF报告生成成功，版本记录已保存' });
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

      const totalCarbon = filteredData.reduce((sum, d) => sum + d.totalCarbonSink, 0);
      const avgCarbon = filteredData.length > 0 ? totalCarbon / filteredData.length : 0;
      const basinsIncluded = Array.from(new Set(filteredData.map(d => d.basin)));
      
      const bioPumpTotal = filteredData.reduce((sum, d) => sum + d.biologicalPump, 0);
      const physPumpTotal = filteredData.reduce((sum, d) => sum + d.physicalPump, 0);
      const carbPumpTotal = filteredData.reduce((sum, d) => sum + d.carbonatePump, 0);
      
      addReportVersion({
        filters: {
          basin: filterBasin,
          season: filterSeason,
          scenario: filterScenario,
          year: null
        },
        summary: {
          totalCarbonSink: Math.round(totalCarbon * 100) / 100,
          avgCarbonSink: Math.round(avgCarbon * 100) / 100,
          recordCount: filteredData.length,
          basins: basinsIncluded
        },
        format: exportFormat as 'pdf' | 'excel' | 'csv',
        fileSize: blob.size,
        snapshot: {
          chartsData: {
            carbonFlux: basins.map(basin => {
              const basinRecords = filteredData.filter(d => d.basin === basin);
              return {
                name: basin,
                value: Math.round((basinRecords.reduce((sum, d) => sum + d.totalCarbonSink, 0) / basinRecords.length || 0) * 100) / 100
              };
            }).sort((a, b) => b.value - a.value),
            pumpEfficiency: {
              biologicalPump: Math.round(bioPumpTotal * 10000) / 10000,
              physicalPump: Math.round(physPumpTotal * 10000) / 10000,
              carbonatePump: Math.round(carbPumpTotal * 10000) / 10000
            },
            scenarioComparison: scenarios.map(scenario => {
              const scenarioRecords = filteredData.filter(d => d.scenario === scenario);
              return {
                name: scenario,
                avgCarbonSink: Math.round((scenarioRecords.reduce((sum, d) => sum + d.totalCarbonSink, 0) / scenarioRecords.length || 0) * 100) / 100
              };
            })
          },
          dataPreview: filteredData.slice(0, 2).map(d => ({
            basin: d.basin,
            season: d.season,
            scenario: d.scenario,
            year: d.year,
            totalCarbonSink: d.totalCarbonSink,
            biologicalPump: d.biologicalPump,
            physicalPump: d.physicalPump,
            carbonatePump: d.carbonatePump
          })),
          generationParams: {
            searchTerm,
            filterBasin,
            filterSeason,
            filterScenario,
            exportFormat,
            timestamp: new Date().toISOString()
          }
        }
      });

      setIsGenerating(false);
      setNotification({ type: 'success', message: `数据导出成功 (${exportFormat.toUpperCase()})，版本记录已保存` });
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

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-seaweed-400" />
            <span>报告版本追溯</span>
            <span className="ml-2 px-2 py-0.5 bg-seaweed-500/20 text-seaweed-300 rounded text-xs">
              共 {reportVersions.length} 条记录
            </span>
            {selectedForComparison.length > 0 && (
              <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs">
                已选择 {selectedForComparison.length}/2
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {selectedForComparison.length === 2 && (
                <button
                  onClick={openComparison}
                  className="px-3 py-1.5 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors flex items-center gap-1"
                >
                  <GitCompare size={14} />
                  对比选中版本
                </button>
              )}
              {selectedForComparison.length > 0 && (
                <button
                  onClick={() => setSelectedForComparison([])}
                  className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
                >
                  清除选择
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {reportVersions.length === 0 ? (
            <div className="p-8 text-center text-white/50">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>暂无报告版本记录</p>
              <p className="text-xs mt-1">生成报告或导出数据后将自动记录</p>
            </div>
          ) : (
            Object.entries(groupedVersions).map(([filterKey, versions]) => (
              <div key={filterKey} className="border-b border-white/5 last:border-b-0">
                <div className="px-4 py-2 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Layers size={12} />
                    <span>
                      海盆: {versions[0].filters.basin === 'all' ? '全部' : versions[0].filters.basin} | 
                      季节: {versions[0].filters.season === 'all' ? '全部' : versions[0].filters.season} | 
                      情景: {versions[0].filters.scenario === 'all' ? '全部' : versions[0].filters.scenario}
                      {versions[0].filters.year && ` | 年份: ${versions[0].filters.year}`}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">{versions.length} 个版本</span>
                </div>
                {versions.map((version: ReportVersion) => (
                  <div key={version.id} className="p-4 hover:bg-white/5 transition-colors relative">
                    <div className="absolute left-4 top-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVersionForComparison(version.id);
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {selectedForComparison.includes(version.id) ? (
                          <CheckSquare size={16} className="text-ocean-400" />
                        ) : (
                          <Square size={16} className="text-white/30" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-start justify-between mb-2 pl-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          version.format === 'pdf' ? 'bg-coral-500/20 text-coral-400' : 
                          version.format === 'csv' ? 'bg-seaweed-500/20 text-seaweed-400' : 
                          'bg-ocean-500/20 text-ocean-400'
                        }`}>
                          {version.format === 'pdf' ? <FileText size={16} /> : 
                           version.format === 'csv' ? <FileSpreadsheet size={16} /> : <FileSpreadsheet size={16} />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {version.format.toUpperCase()} 报告
                            {!version.snapshot && (
                              <span className="ml-2 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-[10px]">
                                早期版本
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/50">
                            由 {version.generatedByName} · {new Date(version.generatedAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs font-mono text-ocean-400">
                            {(version.fileSize / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <div className="text-xs text-white/40">
                            {version.summary.recordCount} 条记录
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedVersion(version);
                            setShowDetailModal(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 ml-10">
                      <div className="p-2 rounded-lg bg-white/5">
                        <div className="text-[10px] text-white/40 mb-0.5">海盆
                            </div>
                        <div className="text-xs text-white/70">
                          {version.filters.basin === 'all' ? '全部' : version.filters.basin}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <div className="text-[10px] text-white/40 mb-0.5">季节
                            </div>
                        <div className="text-xs text-white/70">
                          {version.filters.season === 'all' ? '全部' : version.filters.season}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <div className="text-[10px] text-white/40 mb-0.5">情景
                            </div>
                        <div className="text-xs text-white/70">
                          {version.filters.scenario === 'all' ? '全部' : version.filters.scenario}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <div className="text-[10px] text-white/40 mb-0.5">总碳汇
                            </div>
                        <div className="text-xs font-mono text-ocean-400">
                          {version.summary.totalCarbonSink.toFixed(1)} Tg C
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {version.summary.basins.slice(0, 4).map((basin, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-ocean-500/10 text-ocean-300 rounded text-[10px]">
                          {basin}
                        </span>
                      ))}
                      {version.summary.basins.length > 4 && (
                        <span className="px-2 py-0.5 bg-white/5 text-white/40 rounded text-[10px]">
                          +{version.summary.basins.length - 4} 更多
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {showDetailModal && selectedVersion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="card-header flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedVersion.format === 'pdf' ? 'bg-coral-500/20 text-coral-400' : 
                    selectedVersion.format === 'csv' ? 'bg-seaweed-500/20 text-seaweed-400' : 
                    'bg-ocean-500/20 text-ocean-400'
                  }`}>
                    {selectedVersion.format === 'pdf' ? <FileText size={20} /> : 
                     selectedVersion.format === 'csv' ? <FileSpreadsheet size={20} /> : <FileSpreadsheet size={20} />}
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {selectedVersion.format.toUpperCase()} 报告详情
                      <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs">
                        版本 #{selectedVersion.id.slice(-6)}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 mt-0.5 flex items-center gap-2">
                      <User size={10} />
                      {selectedVersion.generatedByName}
                      <span className="text-white/30">•</span>
                      <Clock size={10} />
                      {new Date(selectedVersion.generatedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedVersion(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-ocean-400" />
                    <span className="text-sm font-medium text-white/80">核心指标摘要</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">总碳汇</span>
                      <span className="text-sm font-mono font-bold text-ocean-400">
                        {selectedVersion.summary.totalCarbonSink.toFixed(2)} Tg C yr⁻¹
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">平均碳汇</span>
                      <span className="text-sm font-mono text-white/80">
                        {selectedVersion.summary.avgCarbonSink.toFixed(2)} Tg C yr⁻¹
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">数据记录数</span>
                      <span className="text-sm font-mono text-seaweed-400">
                        {selectedVersion.summary.recordCount} 条
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">文件大小</span>
                      <span className="text-sm font-mono text-white/80">
                        {(selectedVersion.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">包含海盆</span>
                      <span className="text-sm text-white/80">
                        {selectedVersion.summary.basins.join('、')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-yellow-400" />
                    <span className="text-sm font-medium text-white/80">筛选条件</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">海盆</span>
                      <span className="text-sm text-white/80">
                        {selectedVersion.filters.basin === 'all' ? '全部海盆' : selectedVersion.filters.basin}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">季节</span>
                      <span className="text-sm text-white/80">
                        {selectedVersion.filters.season === 'all' ? '全部季节' : selectedVersion.filters.season}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">排放情景</span>
                      <span className="text-sm text-white/80">
                        {selectedVersion.filters.scenario === 'all' ? '全部情景' : selectedVersion.filters.scenario}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">年份</span>
                      <span className="text-sm text-white/80">
                        {selectedVersion.filters.year || '全部年份'}
                      </span>
                    </div>
                    {selectedVersion.snapshot?.generationParams?.searchTerm && (
                      <div className="flex justify-between">
                        <span className="text-sm text-white/50">搜索词</span>
                        <span className="text-sm text-white/80 font-mono">
                          "{selectedVersion.snapshot.generationParams.searchTerm}"
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Database size={16} className="text-purple-400" />
                    <span className="text-sm font-medium text-white/80">生成信息</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">生成时间</span>
                      <span className="text-sm font-mono text-white/80">
                        {new Date(selectedVersion.generatedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">导出人ID</span>
                      <span className="text-sm font-mono text-white/80">
                        {selectedVersion.generatedBy}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">导出格式</span>
                      <span className="text-sm text-white/80 uppercase">
                        {selectedVersion.format}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">版本ID</span>
                      <span className="text-sm font-mono text-white/60 text-right">
                        {selectedVersion.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedVersion.snapshot?.chartsData && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} className="text-ocean-400" />
                    <span className="text-sm font-medium text-white/80">图表数据快照</span>
                    <span className="ml-auto text-xs text-white/40 flex items-center gap-1">
                      <AlertCircle size={12} />
                      此为生成时的永久快照，不随后续数据变化
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-white/40 mb-2 flex items-center gap-1">
                        <ArrowUpRight size={10} />
                        各海盆碳汇通量 (Tg C yr⁻¹)
                      </div>
                      <div className="space-y-1.5">
                        {selectedVersion.snapshot.chartsData.carbonFlux.slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-16 text-xs text-white/60">{item.name}</div>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-ocean-500 to-seaweed-500 rounded-full"
                                style={{ width: `${Math.min(100, (item.value / (selectedVersion.snapshot!.chartsData!.carbonFlux[0].value || 1)) * 100)}%` }}
                              />
                            </div>
                            <div className="w-14 text-xs font-mono text-ocean-400 text-right">
                              {item.value.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-white/40 mb-2 flex items-center gap-1">
                        <PieChart size={10} />
                        碳泵效率 (Pg C yr⁻¹)
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/60">生物泵</span>
                            <span className="font-mono text-seaweed-400">{selectedVersion.snapshot.chartsData.pumpEfficiency.biologicalPump.toFixed(4)}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-seaweed-500 rounded-full"
                              style={{ width: '70%' }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/60">物理泵</span>
                            <span className="font-mono text-ocean-400">{selectedVersion.snapshot.chartsData.pumpEfficiency.physicalPump.toFixed(4)}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-ocean-500 rounded-full"
                              style={{ width: '55%' }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/60">碳酸盐泵</span>
                            <span className="font-mono text-yellow-400">{selectedVersion.snapshot.chartsData.pumpEfficiency.carbonatePump.toFixed(4)}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: '35%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-white/40 mb-2 flex items-center gap-1">
                        <TrendingUp size={10} />
                        情景对比 (平均碳汇 Tg C yr⁻¹)
                      </div>
                      <div className="space-y-2">
                        {selectedVersion.snapshot.chartsData.scenarioComparison.map((item, i) => {
                          const colors = ['#1B998B', '#3E92CC', '#F46036'];
                          return (
                            <div key={i} className="p-2 rounded-lg bg-white/5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-white/60">{item.name}</span>
                                <span className="text-sm font-mono" style={{ color: colors[i % colors.length] }}>
                                  {item.avgCarbonSink.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!selectedVersion.snapshot?.chartsData && (
                <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Info size={32} className="mx-auto mb-3 text-yellow-400 opacity-50" />
                  <p className="text-white/60">此为早期版本报告，暂无图表快照数据</p>
                  <p className="text-xs text-white/40 mt-1">早期报告版本仅保留了核心指标摘要，未保存完整图表快照</p>
                </div>
              )}

              {selectedVersion.snapshot?.dataPreview && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Table size={16} className="text-seaweed-400" />
                    <span className="text-sm font-medium text-white/80">数据预览快照</span>
                    <span className="text-xs text-white/40">
                      显示前 {selectedVersion.snapshot.dataPreview.length} 条记录
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-white/60 border-b border-white/10 bg-white/5">
                          <th className="p-2 font-medium">海盆</th>
                          <th className="p-2 font-medium">季节</th>
                          <th className="p-2 font-medium">情景</th>
                          <th className="p-2 font-medium">年份</th>
                          <th className="p-2 font-medium text-right">总碳汇</th>
                          <th className="p-2 font-medium text-right">生物泵</th>
                          <th className="p-2 font-medium text-right">物理泵</th>
                          <th className="p-2 font-medium text-right">碳酸盐泵</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVersion.snapshot.dataPreview.map((d, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="p-2 text-white/80">{d.basin}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 bg-ocean-500/10 text-ocean-300 rounded text-[10px]">{d.season}</span>
                            </td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 bg-seaweed-500/10 text-seaweed-300 rounded text-[10px]">{d.scenario}</span>
                            </td>
                            <td className="p-2 text-white/60 font-mono">{d.year}</td>
                            <td className="p-2 text-right text-ocean-400 font-mono">{d.totalCarbonSink.toFixed(1)}</td>
                            <td className="p-2 text-right text-seaweed-400 font-mono">{d.biologicalPump.toFixed(3)}</td>
                            <td className="p-2 text-right text-coral-400 font-mono">{d.physicalPump.toFixed(3)}</td>
                            <td className="p-2 text-right text-yellow-400 font-mono">{d.carbonatePump.toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!selectedVersion.snapshot?.dataPreview && selectedVersion.snapshot?.chartsData && (
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Table size={24} className="mx-auto mb-2 text-white/30" />
                  <p className="text-white/40 text-sm">此版本未保存数据预览快照</p>
                </div>
              )}
            </div>

            <div className="card-footer flex-shrink-0 border-t border-white/10">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedVersion(null);
                  }}
                  className="btn-secondary"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComparisonModal && comparisonVersions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="card-header flex-shrink-0 bg-gradient-to-r from-purple-900/30 to-ocean-900/30 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <GitCompare size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      报告版本对比
                      <span className="px-2 py-0.5 bg-ocean-500/20 text-ocean-300 rounded text-xs">
                        筛选条件一致
                      </span>
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      同一组筛选条件下两个版本的差异对比
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeComparison}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {comparisonVersions.map((version, idx) => (
                  <div key={version.id} className={`p-4 rounded-xl border ${idx === 0 ? 'bg-ocean-900/20 border-ocean-500/30' : 'bg-purple-900/20 border-purple-500/30'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${idx === 0 ? 'bg-ocean-500/20 text-ocean-300' : 'bg-purple-500/20 text-purple-300'}`}>
                          {idx === 0 ? '旧版本' : '新版本'}
                        </span>
                        <span className="text-white/80 text-sm font-mono">#{version.id.slice(-6)}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-ocean-400' : 'bg-purple-400'}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">生成时间</span>
                        <span className="text-white/80 font-mono">{new Date(version.generatedAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">导出人</span>
                        <span className="text-white/80">{version.generatedByName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">文件大小</span>
                        <span className="text-white/80 font-mono">{(version.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      {!version.snapshot && (
                        <div className="mt-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded">
                          <span className="text-yellow-300 text-[10px] flex items-center gap-1">
                            <AlertCircle size={10} />
                            早期版本，无快照数据
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={16} className="text-ocean-400" />
                  <span className="text-sm font-medium text-white/80">核心指标对比</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/60 border-b border-white/10">
                        <th className="p-3 font-medium bg-white/5">指标</th>
                        <th className="p-3 font-medium bg-ocean-900/20 text-ocean-300">旧版本</th>
                        <th className="p-3 font-medium bg-purple-900/20 text-purple-300">新版本</th>
                        <th className="p-3 font-medium bg-white/5">差异</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="p-3 text-white/60">生成时间</td>
                        <td className="p-3 font-mono text-ocean-300">{new Date(comparisonVersions[0].generatedAt).toLocaleString('zh-CN')}</td>
                        <td className="p-3 font-mono text-purple-300">{new Date(comparisonVersions[1].generatedAt).toLocaleString('zh-CN')}</td>
                        <td className="p-3">{getDiffBadge(comparisonVersions[0].generatedAt, comparisonVersions[1].generatedAt)}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-3 text-white/60">导出人</td>
                        <td className="p-3 text-ocean-300">{comparisonVersions[0].generatedByName}</td>
                        <td className="p-3 text-purple-300">{comparisonVersions[1].generatedByName}</td>
                        <td className="p-3">{getDiffBadge(comparisonVersions[0].generatedByName, comparisonVersions[1].generatedByName)}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-3 text-white/60">数据记录数</td>
                        <td className="p-3 font-mono text-ocean-300">{comparisonVersions[0].summary.recordCount}</td>
                        <td className="p-3 font-mono text-purple-300">{comparisonVersions[1].summary.recordCount}</td>
                        <td className="p-3">{getDiffBadge(comparisonVersions[0].summary.recordCount, comparisonVersions[1].summary.recordCount)}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-3 text-white/60">总碳汇 (Tg C)</td>
                        <td className="p-3 font-mono text-ocean-300">{comparisonVersions[0].summary.totalCarbonSink.toFixed(2)}</td>
                        <td className="p-3 font-mono text-purple-300">{comparisonVersions[1].summary.totalCarbonSink.toFixed(2)}</td>
                        <td className="p-3">{getDiffBadge(comparisonVersions[0].summary.totalCarbonSink, comparisonVersions[1].summary.totalCarbonSink)}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-3 text-white/60">平均碳汇 (Tg C)</td>
                        <td className="p-3 font-mono text-ocean-300">{comparisonVersions[0].summary.avgCarbonSink.toFixed(2)}</td>
                        <td className="p-3 font-mono text-purple-300">{comparisonVersions[1].summary.avgCarbonSink.toFixed(2)}</td>
                        <td className="p-3">{getDiffBadge(comparisonVersions[0].summary.avgCarbonSink, comparisonVersions[1].summary.avgCarbonSink)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white/60">包含海盆</td>
                        <td className="p-3 text-ocean-300">{comparisonVersions[0].summary.basins.length} 个</td>
                        <td className="p-3 text-purple-300">{comparisonVersions[1].summary.basins.length} 个</td>
                        <td className="p-3">{getDiffBadge(comparisonVersions[0].summary.basins.length, comparisonVersions[1].summary.basins.length)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-yellow-400" />
                    <span className="text-sm font-medium text-white/80">筛选条件</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { key: 'basin', label: '海盆' },
                      { key: 'season', label: '季节' },
                      { key: 'scenario', label: '排放情景' },
                      { key: 'year', label: '年份' }
                    ].map(({ key, label }) => {
                      const filters0 = comparisonVersions[0].filters as any;
                      const filters1 = comparisonVersions[1].filters as any;
                      const oldVal = filters0[key];
                      const newVal = filters1[key];
                      const displayOld = oldVal === 'all' ? '全部' : oldVal || '全部';
                      const displayNew = newVal === 'all' ? '全部' : newVal || '全部';
                      return (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="text-white/50">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-ocean-300 font-mono">{displayOld}</span>
                            <ArrowDownUp size={12} className="text-white/30" />
                            <span className="text-purple-300 font-mono">{displayNew}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={16} className="text-seaweed-400" />
                    <span className="text-sm font-medium text-white/80">图表摘要差异</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {getSnapshotDisplay(comparisonVersions[0].snapshot).hasData && getSnapshotDisplay(comparisonVersions[1].snapshot).hasData ? (
                      <>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="text-white/50">碳通量数据</span>
                          <div className="flex items-center gap-2">
                            <span className="text-ocean-300">{getSnapshotDisplay(comparisonVersions[0].snapshot).carbonFlux.length} 项</span>
                            <ArrowDownUp size={12} className="text-white/30" />
                            <span className="text-purple-300">{getSnapshotDisplay(comparisonVersions[1].snapshot).carbonFlux.length} 项</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="text-white/50">情景对比数据</span>
                          <div className="flex items-center gap-2">
                            <span className="text-ocean-300">{getSnapshotDisplay(comparisonVersions[0].snapshot).scenarioComparison.length} 项</span>
                            <ArrowDownUp size={12} className="text-white/30" />
                            <span className="text-purple-300">{getSnapshotDisplay(comparisonVersions[1].snapshot).scenarioComparison.length} 项</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="text-white/50">碳泵效率数据</span>
                          <div className="flex items-center gap-2">
                            <span className="text-ocean-300">{getSnapshotDisplay(comparisonVersions[0].snapshot).pumpEfficiency ? '有' : '无'}</span>
                            <ArrowDownUp size={12} className="text-white/30" />
                            <span className="text-purple-300">{getSnapshotDisplay(comparisonVersions[1].snapshot).pumpEfficiency ? '有' : '无'}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                        <AlertCircle size={16} className="mx-auto mb-1 text-yellow-400" />
                        <p className="text-yellow-300 text-[10px]">一个或多个版本无快照数据，无法对比图表摘要</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {getSnapshotDisplay(comparisonVersions[0].snapshot).hasData && getSnapshotDisplay(comparisonVersions[1].snapshot).hasData && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Table size={16} className="text-coral-400" />
                    <span className="text-sm font-medium text-white/80">数据预览差异（前5条记录）</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-left text-white/60 border-b border-white/10 bg-white/5">
                          <th className="p-2 font-medium">版本</th>
                          <th className="p-2 font-medium">海盆</th>
                          <th className="p-2 font-medium">季节</th>
                          <th className="p-2 font-medium">情景</th>
                          <th className="p-2 font-medium">年份</th>
                          <th className="p-2 font-medium text-right">总碳汇</th>
                          <th className="p-2 font-medium text-right">生物泵</th>
                          <th className="p-2 font-medium text-right">物理泵</th>
                          <th className="p-2 font-medium text-right">碳酸盐泵</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1].map(versionIdx => {
                          const snapshot = getSnapshotDisplay(comparisonVersions[versionIdx].snapshot);
                          return snapshot.dataPreview.slice(0, 5).map((d, i) => (
                            <tr key={`${versionIdx}-${i}`} className={`border-b border-white/5 ${versionIdx === 0 ? 'bg-ocean-900/10' : 'bg-purple-900/10'}`}>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] ${versionIdx === 0 ? 'bg-ocean-500/20 text-ocean-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                  {versionIdx === 0 ? '旧' : '新'}
                                </span>
                              </td>
                              <td className="p-2 text-white/80">{d.basin}</td>
                              <td className="p-2">{d.season}</td>
                              <td className="p-2">{d.scenario}</td>
                              <td className="p-2 text-white/60 font-mono">{d.year}</td>
                              <td className="p-2 text-right text-ocean-400 font-mono">{d.totalCarbonSink?.toFixed(1) || '-'}</td>
                              <td className="p-2 text-right text-seaweed-400 font-mono">{d.biologicalPump?.toFixed(3) || '-'}</td>
                              <td className="p-2 text-right text-coral-400 font-mono">{d.physicalPump?.toFixed(3) || '-'}</td>
                              <td className="p-2 text-right text-yellow-400 font-mono">{d.carbonatePump?.toFixed(3) || '-'}</td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="card-footer flex-shrink-0 border-t border-white/10">
              <div className="flex justify-between items-center">
                <div className="text-xs text-white/40">
                  提示：只有相同筛选条件的版本才能进行对比
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeComparison}
                    className="btn-secondary"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
