export interface ReportTypeItem {
  value: string;
  label: string;
}

// 第二步：定义举报类型枚举数组（对应你提供的选项）
export const ReportTypeEnum: ReportTypeItem[] = [
  { value: 'stateSecurity', label: 'State security' },
  { value: 'pornOrVulgar', label: 'Porn or vulgar' },
  { value: 'violentTerror', label: 'Violent terror' },
  { value: 'falseRumorsSpam', label: 'False rumors & spam' },
  { value: 'privacyBreach', label: 'Privacy breach' },
  { value: 'illegalAdActivity', label: 'Illegal ad activity' },
  { value: 'feudalSuperstition', label: 'Feudal superstition' },
  { value: 'others', label: 'Others' },
];
