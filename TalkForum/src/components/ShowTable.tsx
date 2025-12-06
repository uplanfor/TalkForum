import type { JSX, ReactNode } from "react";
import React from "react";
import "./styles/style_showtable.css"

// 泛型优化：避免any，让组件更通用
interface ShowTableProps<T = Record<string, any>> {
  /** 表格数据 */
  data: T[];
  /** 渲染表格行内容 */
  renderItem: (item: T, index: number) => JSX.Element;
  /** 渲染表头 */
  renderHeader: () => JSX.Element;
  /** 空数据提示（可选） */
  emptyContent?: ReactNode;
  /** 自定义容器类名（可选） */
  className?: string;
}

const ShowTable = <T,>({
  data,
  renderItem,
  renderHeader,
  emptyContent = <div style={{ padding: "1em", textAlign: "center" }}>No Data</div>,
  className = "",
}: ShowTableProps<T>) => {

  return (
    // 外层容器：对应样式里的table-wrapper
    <div className={`table-wrapper ${className}`}>
      <table className="custom-table">
        <thead>
          {React.cloneElement(renderHeader(), { className: "table-header" })}
        </thead>
        <tbody className="table-body">
          {data.length > 0 && (
            data.map((item, index) => (
              React.cloneElement(renderItem(item, index), { className: "table-row" })
            ))
          )}
        </tbody>
      </table>
      
        {data.length === 0 && (emptyContent)}
    </div>
  );
};

export default ShowTable;